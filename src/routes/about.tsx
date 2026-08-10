import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { BRAND, LEGAL, isMissing } from "@/config/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Virelia Crédit" },
      {
        name: "description",
        content:
          "Virelia Crédit présente des solutions de prêt remboursable en Europe et au Canada, avec des conditions affichées marché par marché.",
      },
      { property: "og:title", content: "À propos — Virelia Crédit" },
      { property: "og:description", content: "Notre approche du crédit : lisible, marché par marché." },
      { property: "og:url", content: "https://vireliacredit.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/about" }],
  }),
  component: () => (
    <SimplePage title="À propos" subtitle={BRAND.positioning}>
      <div className="prose prose-slate mx-auto max-w-3xl">
        <p>
          {BRAND.name} présente des solutions de <strong>prêt remboursable</strong> destinées aux
          particuliers, indépendants, entreprises, étudiants et porteurs de projet résidant dans les
          pays desservis. Il ne s'agit ni de dons, ni de subventions, ni d'aides non remboursables.
        </p>
        <p>
          Notre approche est organisée par marché : chaque pays possède sa devise, ses langues, ses
          documents et ses conditions. Les taux, frais et montants sont publiés uniquement lorsqu'ils
          sont validés — à défaut, la mention « en cours de configuration » est affichée.
        </p>
        <p>
          Chaque demande est étudiée individuellement, notamment au regard de la capacité de
          remboursement. Aucune approbation, aucun délai de versement et aucun taux ne sont garantis
          avant l'étude du dossier.
        </p>
        {isMissing(LEGAL.legalCompanyName) && (
          <p className="text-sm italic text-muted-foreground">
            Informations légales et réglementaires en cours de configuration.
          </p>
        )}
      </div>
    </SimplePage>
  ),
});
