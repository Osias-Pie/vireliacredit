import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";

export const Route = createFileRoute("/privacy")({ component: () => (
  <SimplePage title="Politique de confidentialité">
    <div className="prose prose-slate mx-auto max-w-3xl">
      <p>
        Nous collectons uniquement les informations nécessaires au traitement de votre
        demande. Les données sont hébergées de manière sécurisée et ne sont jamais
        cédées à des tiers.
      </p>
      <p>
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
        suppression sur vos données. Contactez-nous à privacy@subvenfinance.org.
      </p>
    </div>
  </SimplePage>
) });
