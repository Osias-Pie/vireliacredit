import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM = `Tu es l'Assistant Virelia, un accompagnateur pour le site Virelia Crédit.
Tu expliques, guides et simplifies. Tu aides à remplir le formulaire, à comprendre l'éligibilité, les documents, le projet de contrat et le suivi de dossier.

Interdictions strictes :
- n'accepte jamais un prêt
- ne refuse jamais un prêt
- ne calcule jamais une solvabilité définitive
- ne décide jamais du taux, du montant accordé ni des frais hors information déjà affichée
- ne remplace jamais un administrateur
- ne demande jamais et n'invente jamais d'IBAN, de SWIFT, de documents d'identité ou de notes internes
- si le contexte ne contient pas une donnée, dis que tu ne l'as pas
- ne présente jamais une demande comme déjà acceptée
- n'aide jamais à contourner la vérification référence + e-mail du suivi

Le test d'éligibilité oriente seulement. Le projet de contrat est soumis à validation du dossier.
La référence VIR est affichée après l'enregistrement de la demande et doit être conservée avec l'adresse e-mail utilisée.
Réponds dans la langue de l'utilisateur, de façon courte et claire.`;

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

function containsSensitiveBankData(message: string): boolean {
  const compact = message.replace(/\s+/g, " ").trim();
  const ibanLike = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/i.test(compact.replace(/\s/g, ""));
  const bankKeyword = /\b(iban|swift|bic|num[eé]ro de compte|account number|bank account)\b/i.test(compact);
  const longAccountLike = /\b\d{10,34}\b/.test(compact.replace(/[ .-]/g, ""));
  return ibanLike || (bankKeyword && longAccountLike);
}

function localReply(message: string, ctx: z.infer<typeof contextSchema>): string {
  if (containsSensitiveBankData(message)) {
    return "Je ne peux pas traiter ni transmettre une coordonnée bancaire. Saisissez ces informations uniquement dans l'étape sécurisée « Coordonnées bancaires » du formulaire.";
  }

  const missing = ctx.missingFields ?? [];
  if (missing.length) {
    return `Il vous reste à renseigner : ${missing.join(", ")} avant de continuer. Je ne peux pas valider un prêt à votre place ; je peux seulement vous indiquer les champs encore vides.`;
  }

  if (ctx.page === "tracking" && ctx.status) {
    const extra = ctx.missing_public_requirements
      ? ` Point d'attention communiqué : ${ctx.missing_public_requirements}`
      : " Aucun document supplémentaire n'est indiqué pour le moment.";
    const msgs = ctx.public_messages?.length ? ` Messages de l'équipe : ${ctx.public_messages.join(" · ")}` : "";
    return `Votre dossier${ctx.reference ? ` ${ctx.reference}` : ""} est actuellement au statut « ${ctx.status} ».${extra}${msgs} La page de suivi affiche uniquement les informations publiques du dossier. Je ne peux ni accepter ni refuser le prêt.`;
  }

  if (ctx.page === "tracking") {
    return "Pour consulter un dossier, utilisez la référence VIR affichée après votre demande et exactement l'adresse e-mail utilisée lors de l'envoi. Cette double vérification protège l'accès au suivi. Si vous venez de soumettre votre demande, la référence se trouve sur la page de confirmation.";
  }

  if (ctx.page === "eligibility") {
    return "Le test d'éligibilité sert uniquement à orienter. Un résultat favorable ne garantit pas un prêt. Vous pouvez ensuite déposer une demande pour étude humaine.";
  }

  if (ctx.page === "application") {
    return `Vous êtes à l'étape ${ctx.step ?? "en cours"} du formulaire. Complétez les champs demandés, déposez les documents, puis consultez et confirmez le projet de contrat. Les frais affichés proviennent de la grille de la plateforme pour le délai choisi. Aucune donnée bancaire ne m'est transmise.`;
  }

  if (ctx.page === "confirmation") {
    return `Votre demande est enregistrée${ctx.reference ? ` sous la référence ${ctx.reference}` : ""}. Conservez cette référence : vous aurez besoin de la référence et de l'adresse e-mail utilisée pour suivre le dossier. Vous pouvez copier la référence depuis cette page puis ouvrir « Suivre ma demande ».`;
  }

  const lower = message.toLowerCase();
  if (lower.includes("iban") || lower.includes("swift") || lower.includes("bic")) {
    return "Je n'ai pas accès à vos coordonnées bancaires et je ne dois pas les traiter. Saisissez-les uniquement dans l'étape prévue du formulaire.";
  }

  return "Je peux vous expliquer les étapes : éligibilité, formulaire, documents, projet de contrat et suivi. Je ne peux pas accorder, refuser ou chiffrer un crédit à votre place.";
}

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    message: z.string().trim().min(1).max(2000),
    locale: z.string().max(5).optional(),
    context: contextSchema,
  }).parse(d))
  .handler(async ({ data }) => {
    const ctx = data.context ?? {};

    // Bank/account values must never leave Virelia for an external AI provider.
    if (containsSensitiveBankData(data.message)) {
      return { reply: localReply(data.message, ctx) };
    }

    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) return { reply: localReply(data.message, ctx) };

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
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env["OPENAI_MODEL"] || "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 400,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "system", content: `Contexte autorisé (aucune donnée bancaire) : ${JSON.stringify(safeContext)}` },
            { role: "user", content: data.message },
          ],
        }),
      });
      if (!res.ok) return { reply: localReply(data.message, ctx) };
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const reply = json.choices?.[0]?.message?.content?.trim();
      return { reply: reply || localReply(data.message, ctx) };
    } catch {
      return { reply: localReply(data.message, ctx) };
    }
  });
