import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SimplePage } from "@/components/layout/SimplePage";

const criteria = [
  "Être majeur (18 ans ou plus)",
  "Résider dans un pays éligible",
  "Fournir une pièce d'identité valide",
  "Présenter un projet cohérent et documenté",
  "Justifier d'une capacité de remboursement (pour certains programmes)",
  "Accepter les conditions générales et la politique de confidentialité",
];

export const Route = createFileRoute("/eligibility")({ component: () => (
  <SimplePage
    title="Conditions d'éligibilité"
    subtitle="Vérifiez que votre profil correspond aux critères de nos programmes."
  >
    <ul className="mx-auto max-w-2xl space-y-3">
      {criteria.map((c) => (
        <li key={c} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm">{c}</span>
        </li>
      ))}
    </ul>
  </SimplePage>
) });
