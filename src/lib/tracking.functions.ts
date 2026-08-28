import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface TrackingHistoryItem {
  status: string;
  public_message: string | null;
  created_at: string;
}

export interface TrackingResult {
  reference: string;
  program: string;
  amount: number;
  currency: string;
  created_at: string;
  status: string;
  public_message: string | null;
  missing_public_requirements: string | null;
  history: TrackingHistoryItem[];
}

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function assertTrackingRateLimit(reference: string, email: string) {
  const now = Date.now();
  const key = `${reference.trim().toLowerCase()}|${email.trim().toLowerCase()}`;
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (current.count >= MAX_ATTEMPTS) throw new Error("lookup_limited");
  current.count += 1;
}

export const getApplicationTracking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      reference: z.string().trim().min(8).max(40),
      email: z.string().trim().email().max(200),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    assertTrackingRateLimit(data.reference, data.email);

    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("supabase_config_missing");

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });

    const { data: row, error } = await supabase.rpc("get_application_tracking", {
      p_reference: data.reference,
      p_email: data.email,
    });

    if (error) {
      console.error("[tracking] lookup failed");
      throw new Error("lookup_failed");
    }
    if (!row) return null;

    const parsed = row as TrackingResult;
    return {
      reference: parsed.reference,
      program: parsed.program,
      amount: parsed.amount,
      currency: parsed.currency,
      created_at: parsed.created_at,
      status: parsed.status,
      public_message: parsed.public_message,
      missing_public_requirements: parsed.missing_public_requirements,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    } satisfies TrackingResult;
  });
