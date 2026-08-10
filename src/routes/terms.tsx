import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { BRAND } from "@/config/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation — Virelia Crédit" },
      { name: "description", content: "Conditions d'utilisation de la plateforme de demande de prêt Virelia Crédit." },
      { property: "og:title", content: "Conditions d'utilisation — Virelia Crédit" },
      { property: "og:description", content: "Règles d'accès et d'usage de la plateforme." },
      { property: "og:url", content: "https://vireliacredit.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/terms" }],
  }),
  component: () => (
    <SimplePage title="Conditions d'utilisation">
      <div className="prose prose-slate mx-auto max-w-3xl">
        <p>
          L'accès à la plateforme est réservé aux personnes majeures résidant dans un pays desservi.
          Toute demande doit être sincère, complète et documentée.
        </p>
        <p>
          {BRAND.name} propose exclusivement des prêts remboursables. Le dépôt d'une demande
          n'entraîne aucune obligation et ne garantit aucun accord de financement : chaque dossier
          est étudié individuellement.
        </p>
        <p>
          Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement
          avant de vous engager.
        </p>
      </div>
    </SimplePage>
  ),
});
