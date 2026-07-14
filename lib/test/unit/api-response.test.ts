import { describe, it, expect, vi } from "vitest";
import { ok, fail } from "@/lib/api/api-response";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      headers: new Headers(),
    })),
  },
}));

describe("ok", () => {
  it("returns success response with data and default 200", () => {
    const res = ok({ id: "1" });
    expect(res.body).toEqual({ success: true, data: { id: "1" } });
    expect(res.status).toBe(200);
  });

  it("returns success response with custom status", () => {
    const res = ok({ id: "1" }, 201);
    expect(res.status).toBe(201);
  });
});

describe("fail", () => {
  it("returns failure response with message and default 400", () => {
    const res = fail("Something went wrong");
    expect(res.body).toEqual({ success: false, message: "Something went wrong" });
    expect(res.status).toBe(400);
  });

  it("returns failure response with custom status", () => {
    const res = fail("Not found", 404);
    expect(res.status).toBe(404);
  });
});
