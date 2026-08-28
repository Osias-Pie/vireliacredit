import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  VIRELIA_ASSISTANT_KNOWLEDGE,
  answerFromVireliaKnowledge,
  containsSensitiveBankData,
  type AssistantKnowledgeContext,
} from "@/lib/assistant-knowledge";

const SYSTEM = `Tu es l'Assistant Virelia, l'assistant officiel du site Virelia Crédit.
Tu expliques, guides et simplifies. Tu aides à comprendre Virelia Crédit, les solutions de prêt remboursable, l'éligibilité, le formulaire, les documents, les frais configurés, le projet de contrat, la référence VIR et le suivi de dossier.

Interdictions strictes :
- n'accepte jamais un prêt
- ne refuse jamais un prêt
- ne calcule jamais une solvabilité définitive
- ne décide jamais du taux, du montant accordé ni de conditions financières non configurées
- ne remplace jamais un administrateur
- ne demande jamais et n'invente jamais d'IBAN, SWIFT/BIC, numéro de compte, document d'identité, document privé ou note interne
- n'aide jamais à contourner la vérification référence + e-mail du suivi
- si une donnée n'est pas disponible dans le contexte ou la base de connaissances, indique-le clairement
- ne présente jamais une demande comme déjà acceptée sauf si son statut public réel le dit explicitement

Le test d'éligibilité est une orientation, jamais une décision d'octroi.
Le projet de contrat reste soumis à validation du dossier.
La référence VIR est affichée après l'enregistrement réussi de la demande et doit être conservée avec l'adresse e-mail utilisée.
Réponds dans la langue de l'utilisateur, de façon concise, claire et utile.

BASE DE CONNAISSANCES VIRELIA :
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
    const locale = data.locale || "fr";
    const fallback = () => answerFromVireliaKnowledge(data.message, ctx, locale);

    // Bank/account values must never leave Virelia for an external AI provider.
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
              content: `Contexte autorisé du parcours (aucune donnée bancaire ou document privé) : ${JSON.stringify(safeContext)}`,
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
