import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";

export const Route = createFileRoute("/about")({ component: () => (
  <SimplePage
    title="À propos"
    subtitle="Un organisme international dédié au financement de projets à impact depuis 15 ans."
  >
    <div className="prose prose-slate mx-auto max-w-3xl">
      <p>
        SubvenFinance est un organisme international indépendant qui accompagne les
        entrepreneurs, particuliers, associations et PME dans le financement de leurs
        projets. Nous ne sommes pas une banque : nous mettons en relation les porteurs de
        projets avec des programmes de financement adaptés, et instruisons chaque dossier
        avec la plus grande rigueur.
      </p>
      <p>
        Nos valeurs : transparence, proximité, rapidité et sécurité. Toutes nos
        communications se font par e-mail, avec un référent unique par dossier.
      </p>
    </div>
  </SimplePage>
) });
