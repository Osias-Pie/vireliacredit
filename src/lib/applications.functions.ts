import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  last_name: z.string().trim().min(1).max(100),
  first_name: z.string().trim().min(1).max(100),
  gender: z.enum(["male", "female", "other"]),
  birth_date: z.string().min(4).max(20),
  country: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().min(4).max(40),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(200),
  profession: z.string().trim().min(1).max(150),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  income: z.union([z.number(), z.string()]).optional().nullable(),
  program: z.string().trim().min(1).max(100),
  amount: z.number().positive().max(100_000_000),
  currency: z.string().trim().min(2).max(10),
  description: z.string().trim().min(10).max(4000),
  goals: z.string().trim().min(5).max(2000),
  language: z.string().trim().max(5).optional(),
});

export type ApplicationInput = z.infer<typeof schema>;

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const incomeNum =
      data.income === "" || data.income == null
        ? null
        : typeof data.income === "string"
        ? Number(data.income) || null
        : data.income;

    const { data: inserted, error } = await supabaseAdmin
      .from("applications")
      .insert({
        last_name: data.last_name,
        first_name: data.first_name,
        gender: data.gender,
        birth_date: data.birth_date,
        country: data.country,
        city: data.city,
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        email: data.email,
        profession: data.profession,
        company: data.company || null,
        income: incomeNum,
        program: data.program,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        goals: data.goals,
        language: data.language ?? null,
      })
      .select("reference, status")
      .single();

    if (error) {
      console.error("[submitApplication] insert error", error);
      throw new Error("insert_failed");
    }

    return { reference: inserted.reference, status: inserted.status };
  });
