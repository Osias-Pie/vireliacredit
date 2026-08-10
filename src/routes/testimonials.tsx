import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { Testimonials } from "@/components/sections/Testimonials";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Témoignages — Virelia Crédit" },
      { name: "description", content: "Retours d'emprunteurs accompagnés par Virelia Crédit. Seuls des témoignages vérifiés sont publiés." },
      { property: "og:title", content: "Témoignages — Virelia Crédit" },
      { property: "og:description", content: "Aucun témoignage n'est publié tant qu'il n'est pas vérifié." },
      { property: "og:url", content: "https://vireliacredit.lovable.app/testimonials" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/testimonials" }],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const { t } = useI18n();
  return (
    <SimplePage title={t("testimonials.title")} subtitle={t("testimonials.subtitle")}>
      {TESTIMONIALS.length === 0 ? (
        <p className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          {t("testimonials.empty")}
        </p>
      ) : (
        <Testimonials />
      )}
    </SimplePage>
  );
}
