import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { env } from "@/utils/env";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type AccessMode = "public" | "private";

type UploadResult = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};

type UploadProvider = {
  name: string;
  canHandle: (url: string) => boolean;
  save: (file: File, access?: AccessMode) => Promise<UploadResult>;
  del: (url: string) => Promise<boolean>;
};

function validateFile(file: File): void {
  if (file.size === 0) {
    throw new Error("File is empty.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds the 5 MB limit (received ${file.size} bytes).`);
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed.`);
  }
}

function buildFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || "";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
}

function getProviderName(): string {
  return process.env.UPLOAD_PROVIDER ?? env.data?.UPLOAD_PROVIDER ?? "local";
}

// ── Local provider ───────────────────────────────────────────
const localProvider: UploadProvider = {
  name: "local",
  canHandle: (url) => url.startsWith("/uploads/"),
  save: async (file) => {
    const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
    await mkdir(UPLOAD_DIR, { recursive: true });

    const filename = buildFilename(file.name);
    const destPath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(destPath, buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      size: file.size,
      mimeType: file.type,
    };
  },
  del: async (url) => {
    const filename = url.replace("/uploads/", "");
    if (filename.includes("..") || filename.includes("/")) return false;

    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    try {
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  },
};

// ── Vercel Blob provider (lazy import) ───────────────────────
let blobModule: typeof import("@vercel/blob") | null = null;
let blobToken: string | undefined;

async function getBlobModule(): Promise<typeof import("@vercel/blob")> {
  if (!blobModule) {
    blobModule = await import("@vercel/blob");
  }
  return blobModule;
}

function ensureBlobToken(): string {
  if (!blobToken) {
    blobToken = process.env.BLOB_READ_WRITE_TOKEN || env.data?.BLOB_READ_WRITE_TOKEN;
  }
  if (!blobToken) {
    throw new Error("BLOB_READ_WRITE_TOKEN required when UPLOAD_PROVIDER=vercel-blob");
  }
  return blobToken;
}

const blobCdnHost = env.data?.NEXT_PUBLIC_BLOB_CDN_HOST ?? "public.blob.vercel-storage.com";

const blobProvider: UploadProvider = {
  name: "vercel-blob",
  canHandle: (url) => url.includes(blobCdnHost),
  save: async (file, access) => {
    const token = ensureBlobToken();
    const { put } = await getBlobModule();
    const filename = buildFilename(file.name);
    const blob = await put(filename, file, {
      access: access ?? "public",
      token,
    });

    return {
      url: blob.url,
      filename,
      size: file.size,
      mimeType: file.type,
    };
  },
  del: async (url) => {
    try {
      const token = ensureBlobToken();
      const { del } = await getBlobModule();
      await del(url, { token });
      return true;
    } catch {
      return false;
    }
  },
};

const providers: UploadProvider[] = [localProvider, blobProvider];

// ── Public API ───────────────────────────────────────────────
export async function saveUpload(file: File, access?: AccessMode): Promise<UploadResult> {
  validateFile(file);

  const providerName = getProviderName();
  const provider = providers.find((p) => p.name === providerName);

  if (!provider) {
    throw new Error(
      `Unknown upload provider: "${providerName}". Supported: ${providers.map((p) => p.name).join(", ")}`,
    );
  }

  return provider.save(file, access);
}

export async function deleteUpload(url: string): Promise<boolean> {
  if (!url) return false;

  for (const provider of providers) {
    if (provider.canHandle(url)) {
      return provider.del(url);
    }
  }

  return false;
}
