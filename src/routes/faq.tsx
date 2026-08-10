import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { FAQSection } from "@/components/sections/FAQSection";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Questions fréquentes sur le prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "Prêt remboursable, pays desservis, taux et frais, étude du dossier, documents : les réponses aux questions les plus fréquentes.",
      },
      { property: "og:title", content: "Questions fréquentes — Virelia Crédit" },
      {
        property: "og:description",
        content: "Ce qu'il faut savoir avant de demander un prêt remboursable.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/faq" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useI18n();
  return (
    <SimplePage title={t("faq.title")} subtitle={t("faq.subtitle")}>
      <FAQSection />
    </SimplePage>
  );
}
