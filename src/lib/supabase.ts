/**
 * Minimal Supabase REST client (fetch-based, no SDK dependency).
 *
 * The anon key is a public, browser-side credential by design — it ships in the
 * JS bundle either way. Access is governed by Row Level Security on the table.
 */

const FALLBACK_URL = "https://eqjcgarhwaftsdytomqy.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxamNnYXJod2FmdHNkeXRvbXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NDk2OTAsImV4cCI6MjEwNTIyNTY5MH0.-BXYGWpRTGL1FM3SmJXJFUq46VjATrKH2lF_5m5CKd8";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_URL;

export const SUPABASE_URL = rawUrl.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
export const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_KEY;

export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export class SupabaseError extends Error {
  status: number;
  /** True when the table itself is missing / RLS blocks everything. */
  missingTable: boolean;

  constructor(message: string, status: number, missingTable = false) {
    super(message);
    this.name = "SupabaseError";
    this.status = status;
    this.missingTable = missingTable;
  }
}

const headers = (extra?: Record<string, string>) => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  ...extra,
});

const TIMEOUT_MS = 10_000;

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      signal: controller.signal,
    });
  } catch (err) {
    throw new SupabaseError(
      err instanceof Error && err.name === "AbortError"
        ? "Cloud request timed out"
        : "Can't reach the cloud",
      0
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // PGRST205 = table not found in schema cache; 42P01 = undefined_table
    const missingTable =
      res.status === 404 || body.includes("PGRST205") || body.includes("42P01");
    throw new SupabaseError(
      missingTable ? "Cloud table not set up yet" : `Cloud error ${res.status}`,
      res.status,
      missingTable
    );
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const sb = {
  select: <T>(table: string, query = "") =>
    request<T>(`${table}${query ? `?${query}` : ""}`, { headers: headers() }),

  insert: <T>(table: string, row: unknown) =>
    request<T>(table, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(row),
    }),

  upsert: <T>(table: string, row: unknown) =>
    request<T>(table, {
      method: "POST",
      headers: headers({
        Prefer: "return=representation,resolution=merge-duplicates",
      }),
      body: JSON.stringify(row),
    }),

  update: <T>(table: string, query: string, patch: unknown) =>
    request<T>(`${table}?${query}`, {
      method: "PATCH",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(patch),
    }),

  remove: (table: string, query: string) =>
    request<void>(`${table}?${query}`, {
      method: "DELETE",
      headers: headers(),
    }),
};
