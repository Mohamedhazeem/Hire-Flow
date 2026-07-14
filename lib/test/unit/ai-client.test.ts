import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("callAI", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("returns null when no API key is set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const { callAI } = await import("@/lib/ai-client");
    const result = await callAI("Hello");
    expect(result).toBeNull();
  });

  it("returns text from anthropic response", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.AI_PROVIDER = "anthropic";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ content: [{ text: "Hello from Claude" }] }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    const result = await callAI("Hi");
    expect(result).toBe("Hello from Claude");
  });

  it("returns text from openai response", async () => {
    process.env.OPENAI_API_KEY = "sk-openai-test";
    process.env.AI_PROVIDER = "openai";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Hello from GPT" } }] }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    const result = await callAI("Hi");
    expect(result).toBe("Hello from GPT");
  });

  it("returns text from google response", async () => {
    process.env.GEMINI_API_KEY = "gemini-test-key";
    process.env.AI_PROVIDER = "google";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        candidates: [{ content: { parts: [{ text: "Hello from Gemini" }] } }],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    const result = await callAI("Hi");
    expect(result).toBe("Hello from Gemini");
  });

  it("throws ApiError(502) when API returns error", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.AI_PROVIDER = "anthropic";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: vi.fn().mockResolvedValue({ error: { message: "Rate limited" } }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    await expect(callAI("Hi")).rejects.toThrow("anthropic API error (429)");
  });

  it("handles error response without error.message", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.AI_PROVIDER = "anthropic";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: vi.fn().mockResolvedValue({ error: "Something broke" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    await expect(callAI("Hi")).rejects.toThrow("Something broke");
  });

  it("uses system prompt when provided", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    process.env.AI_PROVIDER = "anthropic";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ content: [{ text: "response" }] }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    await callAI("user prompt", "system instruction");
    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.system).toBe("system instruction");
    expect(body.messages[0].content).toBe("user prompt");
  });

  it("defaults to anthropic when AI_PROVIDER is not set", async () => {
    delete process.env.AI_PROVIDER;
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ content: [{ text: "default" }] }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const { callAI } = await import("@/lib/ai-client");
    const result = await callAI("Hi");
    expect(result).toBe("default");
  });
});
