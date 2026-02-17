import { SELF, env } from "cloudflare:test";
import { describe, it, expect } from "vitest";

declare module "cloudflare:test" {
  interface ProvidedEnv {
    USERNAME: string;
    PASSWORD: string;
  }
}

const authHeader = (username: string, password: string) => ({
  Authorization: `Basic ${btoa(`${username}:${password}`)}`,
});

const AUTH = authHeader(env.USERNAME, env.PASSWORD);

describe("Auth", () => {
  it("returns 401 without credentials", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes");
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid credentials", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/auth/page", { headers: AUTH });
    expect(res.status).toBe(200);
  });
});

describe("GET /quotes", () => {
  it("returns 200", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes", { headers: AUTH });
    expect(res.status).toBe(200);
  });

  it("returns an array of quotes", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes", { headers: AUTH });
    const data = await res.json() as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("quotes have expected shape", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes", { headers: AUTH });
    const data = await res.json() as any[];
    const quote = data[0];
    expect(quote).toHaveProperty("character");
    expect(quote).toHaveProperty("quote");
  });
});

describe("GET /quotes/:id", () => {
  it("returns a single quote", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes/1", { headers: AUTH });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data).toHaveProperty("characterImg");
  });

  it("returns 400 for out of range id", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes/999999", { headers: AUTH });
    expect(res.status).toBe(400);
  });

  it("returns 400 for id of 0", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes/0", { headers: AUTH });
    expect(res.status).toBe(400);
  });
});

describe("GET /random-quote", () => {
  it("returns a random quote", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/random-quote", { headers: AUTH });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data).toHaveProperty("character");
    expect(data).toHaveProperty("characterImg");
  });

  it("redirects when character query param is provided", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/random-quote?character=aang", { 
      headers: AUTH,
      redirect: "manual"
    });
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toContain("/random-character-quote?character=aang");
  });
});

describe("GET /random-character-quote", () => {
  it("returns a quote for a valid character", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/random-character-quote?character=aang", { headers: AUTH });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(data.character).toBe("aang");
  });

  it("returns 400 for unknown character", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/random-character-quote?character=xyz_fake", { headers: AUTH });
    expect(res.status).toBe(400);
  });

  it("returns 400 with no character param", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/random-character-quote", { headers: AUTH });
    expect(res.status).toBe(400);
  });
});

describe("GET /quotes-by-character", () => {
  it("returns all quotes for a character", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes-by-character?character=aang", { headers: AUTH });
    expect(res.status).toBe(200);
    const data = await res.json() as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.every((q: any) => q.character === "aang")).toBe(true);
  });

  it("returns 400 with no character param", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes-by-character", { headers: AUTH });
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown character", async () => {
    const res = await SELF.fetch("https://atla-quotes-api.workers.dev/quotes-by-character?character=xyz_fake", { headers: AUTH });
    expect(res.status).toBe(400);
  });
});