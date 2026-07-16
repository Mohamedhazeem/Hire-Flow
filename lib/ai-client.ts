import { ApiError } from "./api/api-error";

type AIProvider = "anthropic" | "openai" | "google";

type ProviderConfig = {
  apiUrl: string;
  authHeader: string;
  buildBody: (sys: string, user: string, maxTokens: number) => unknown;
  extractText: (data: unknown) => string;
};

const PROVIDER_CONFIG: Record<AIProvider, ProviderConfig> = {
  anthropic: {
    apiUrl: "https://api.anthropic.com/v1/messages",
    authHeader: "x-api-key",
    buildBody: (sys, user, maxTokens) => ({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: sys,
      messages: [{ role: "user", content: user }],
    }),
    extractText: (data: unknown) => {
      const d = data as { content?: { text?: string }[] };
      return d.content?.[0]?.text ?? "";
    },
  },
  openai: {
    apiUrl: "https://api.openai.com/v1/chat/completions",
    authHeader: "Authorization",
    buildBody: (sys, user, maxTokens) => ({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
    extractText: (data: unknown) => {
      const d = data as { choices?: { message?: { content?: string } }[] };
      return d.choices?.[0]?.message?.content ?? "";
    },
  },
  google: {
    apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent`,
    authHeader: "x-goog-api-key",
    buildBody: (sys, user, maxTokens) => ({
      system_instruction: { parts: [{ text: sys }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
    extractText: (data: unknown) => {
      const d = data as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    },
  },
};

export async function callAI(
  userPrompt: string,
  systemPrompt?: string,
  maxTokens = 2048,
): Promise<string | null> {
  const provider = (process.env.AI_PROVIDER || "anthropic") as AIProvider;
  const config = PROVIDER_CONFIG[provider];
  if (!config) return null;

  const apiKey =
    process.env[`${provider.toUpperCase()}_API_KEY`] ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const body = config.buildBody(systemPrompt || "", userPrompt, maxTokens);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (provider !== "google") {
    headers[config.authHeader] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  }

  let url = process.env[`${provider.toUpperCase()}_API_URL`] || config.apiUrl;
  if (provider === "google") {
    url += `?key=${apiKey}`;
  }

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody.error?.message ?? errBody.error ?? JSON.stringify(errBody).slice(0, 200);
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(`${provider} API error (${res.status}): ${detail}`, 502);
  }

  const data = await res.json();
  return config.extractText(data);
}
