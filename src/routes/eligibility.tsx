import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileText } from "lucide-react";
import { SimplePage } from "@/components/layout/SimplePage";
import { useI18n } from "@/lib/i18n/context";
import { BASE_DOCUMENTS, ELIGIBILITY_CRITERIA } from "@/config/loans";
import type { TranslationKey } from "@/lib/i18n/translations";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Éligibilité au prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "Critères d'éligibilité et documents à prévoir pour une demande de prêt remboursable, quel que soit votre pays de résidence.",
      },
      { property: "og:title", content: "Éligibilité au prêt — Virelia Crédit" },
      {
        property: "og:description",
        content: "Critères et pièces justificatives à prévoir avant toute demande de prêt.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/eligibility" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/eligibility" }],
  }),
  component: EligibilityPage,
});

function EligibilityPage() {
  const { t } = useI18n();

  return (
    <SimplePage title={t("eligibility.title")} subtitle={t("eligibility.subtitle")}>
      <ul className="mx-auto mt-8 max-w-2xl space-y-3">
        {ELIGIBILITY_CRITERIA.map((key) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <span className="text-sm">{t(key as TranslationKey)}</span>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-14 max-w-2xl">
        <h2 className="text-xl font-bold tracking-tight">{t("documents.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("documents.subtitle")}</p>
        <ul className="mt-5 space-y-3">
          {[...BASE_DOCUMENTS, "documents.income", "documents.activity"].map((key) => (
            <li
              key={key}
              className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{t(key as TranslationKey)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">{t("documents.note")}</p>
      </div>
    </SimplePage>
  );
}
