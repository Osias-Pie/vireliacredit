import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  VIRELIA_ASSISTANT_KNOWLEDGE,
  answerFromVireliaKnowledge,
  containsSensitiveBankData,
  type AssistantKnowledgeContext,
} from "@/lib/assistant-knowledge";
import { normalizeLocale } from "@/lib/i18n/locale-core";

const SYSTEM = `You are Virelia Assistant, the official assistant for Virelia Credit.
You explain, guide and simplify the repayable-loan journey: eligibility, application form, documents, configured fees, draft agreements, VIR reference and application tracking.

Strict rules:
- never accept or reject a loan
- never make a final solvency decision
- never invent a rate, granted amount or financial condition
- never replace an administrator
- never request or invent IBAN, SWIFT/BIC, account numbers, identity documents, private documents or internal notes
- never help bypass reference + email tracking verification
- if information is unavailable, say so clearly
- never present an application as accepted unless its real public status says so
- eligibility is orientation only, never a lending decision
- a draft agreement remains subject to application approval
- the VIR reference must be kept with the email address used for the application

The application always supplies an ACTIVE LOCALE. Reply exclusively in that active language, even if the user's latest message is written in another language, unless the user explicitly asks for a translation.

VIRELIA KNOWLEDGE:
${VIRELIA_ASSISTANT_KNOWLEDGE}`;

const contextSchema = z
  .object({
    page: z.string().max(40).optional(),
    step: z.number().int().min(1).max(5).optional(),
    professionalStatus: z.string().max(40).optional(),
    missingFields: z.array(z.string().max(80)).max(20).optional(),
    reference: z.string().max(40).optional(),
    status: z.string().max(60).optional(),
    public_messages: z.array(z.string().max(500)).max(12).optional(),
    missing_public_requirements: z.string().max(400).optional(),
  })
  .default({});

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        message: z.string().trim().min(1).max(2000),
        locale: z.string().max(5).optional(),
        context: contextSchema,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const ctx = (data.context ?? {}) as AssistantKnowledgeContext;
    const activeLocale = normalizeLocale(data.locale) ?? "fr";
    const fallback = () => answerFromVireliaKnowledge(data.message, ctx, activeLocale);

    if (containsSensitiveBankData(data.message)) return { reply: fallback(), source: "local" as const };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("[Virelia assistant] OPENAI_API_KEY missing; serving local knowledge fallback");
      return { reply: fallback(), source: "local" as const };
    }

    const safeContext = {
      page: ctx.page,
      step: ctx.step,
      professionalStatus: ctx.professionalStatus,
      missingFields: ctx.missingFields,
      reference: ctx.reference,
      status: ctx.status,
      public_messages: ctx.public_messages,
      missing_public_requirements: ctx.missing_public_requirements,
    };

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5-mini",
          max_completion_tokens: 500,
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "system",
              content: `ACTIVE LOCALE: ${activeLocale}. Reply exclusively in this language. Allowed journey context (no bank data or private documents): ${JSON.stringify(safeContext)}`,
            },
            { role: "user", content: data.message },
          ],
        }),
      });

      if (!res.ok) {
        console.warn(`[Virelia assistant] OpenAI request failed with HTTP ${res.status}; local fallback used`);
        return { reply: fallback(), source: "local" as const };
      }

      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = json.choices?.[0]?.message?.content?.trim();
      return reply
        ? { reply, source: "openai" as const }
        : { reply: fallback(), source: "local" as const };
    } catch (error) {
      console.warn(
        `[Virelia assistant] provider unavailable (${error instanceof Error ? error.name : "unknown_error"}); local fallback used`,
      );
      return { reply: fallback(), source: "local" as const };
    }
  });
