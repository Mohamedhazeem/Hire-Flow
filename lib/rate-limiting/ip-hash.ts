import { createHmac } from "node:crypto";
import type { IPHasher } from "./types";

export function ipHash(ip: string, salt: string, digestLength: number = 16): string {
  const hash = createHmac("sha256", salt).update(ip).digest("hex");
  return hash.substring(0, digestLength);
}

export class IPHasherImpl implements IPHasher {
  private salt: string;
  private digestLength: number;

  constructor(salt: string, digestLength: number = 16) {
    this.salt = salt;
    this.digestLength = digestLength;
  }

  hash(ip: string): string {
    return ipHash(ip, this.salt, this.digestLength);
  }
}
