import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const num = z
  .union([z.number(), z.string()])
  .optional()
  .nullable()
  .transform((v) => {
    if (v === "" || v == null) return null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : null;
  });

const schema = z.object({
  // Step 1 — identity (country is informative only, never a rule)
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  birth_date: z.string().min(4).max(20),
  country: z.string().trim().min(1).max(100),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().min(4).max(40),
  email: z.string().trim().email().max(200),
  // Step 2 — situation
  employment_status: z.enum([
    "employee",
    "self_employed",
    "business_owner",
    "retired",
    "other",
  ]),
  employment_details: z.record(z.string(), z.string().max(300)).default({}),
  income: num,
  other_income: num,
  monthly_charges: num,
  // Step 3 — loan
  program: z.string().trim().min(1).max(100),
  amount: z.number().positive().max(1_000_000_000),
  currency: z.string().trim().min(2).max(10),
  duration_months: z.number().int().positive().max(600),
  purpose: z.string().trim().min(10).max(4000),
  processing_speed: z.string().trim().max(50),
  processing_fee: num,
  // Step 4
  documents: z.array(z.string().max(120)).max(20).default([]),
  language: z.string().trim().max(5).optional(),
});

export type ApplicationInput = z.input<typeof schema>;

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");

    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error("supabase_config_missing");

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      birth_date: data.birth_date,
      country: data.country,
      nationality: data.nationality ?? "",
      address: data.address,
      phone: data.phone,
      email: data.email,
      employment_status: data.employment_status,
      employment_details: data.employment_details ?? {},
      income: data.income ?? "",
      other_income: data.other_income ?? "",
      monthly_charges: data.monthly_charges ?? "",
      program: data.program,
      amount: data.amount,
      currency: data.currency,
      duration_months: data.duration_months,
      purpose: data.purpose,
      processing_speed: data.processing_speed,
      processing_fee: data.processing_fee ?? "",
      documents: data.documents ?? [],
      language: data.language ?? "",
    };

    const { data: ref, error } = await supabase.rpc("submit_application", {
      p: payload,
    });

    if (error) {
      console.error("[submitApplication] rpc error", error.message);
      throw new Error("insert_failed");
    }

    return { reference: ref as string, status: "nouvelle_demande" };
  });
