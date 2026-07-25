import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";

export const Route = createFileRoute("/terms")({ component: () => (
  <SimplePage title="Conditions d'utilisation">
    <div className="prose prose-slate mx-auto max-w-3xl">
      <p>
        L'accès à la plateforme est réservé aux personnes majeures. Toute demande doit
        être sincère et documentée. Golden Grant Hub se réserve le droit de refuser tout
        dossier ne respectant pas les conditions d'éligibilité.
      </p>
    </div>
  </SimplePage>
) });
