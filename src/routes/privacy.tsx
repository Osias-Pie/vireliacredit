import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { BRAND, CONTACT, LEGAL } from "@/config/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Virelia Crédit" },
      { name: "description", content: "Comment Virelia Crédit collecte et protège les données transmises dans le cadre d'une demande de prêt." },
      { property: "og:title", content: "Politique de confidentialité — Virelia Crédit" },
      { property: "og:description", content: "Traitement des données personnelles liées aux demandes de prêt." },
      { property: "og:url", content: "https://vireliacredit.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/privacy" }],
  }),
  component: () => (
    <SimplePage title="Politique de confidentialité">
      <div className="prose prose-slate mx-auto max-w-3xl">
        <p>
          {BRAND.name} collecte uniquement les informations nécessaires à l'étude d'une demande de
          prêt remboursable : identité, coordonnées, situation professionnelle et financière, et
          éléments relatifs au projet financé.
        </p>
        <p>
          Ces données servent exclusivement à l'instruction du dossier et au suivi de la relation.
          Elles ne sont pas cédées à des tiers à des fins commerciales.
        </p>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'opposition et
          de suppression{CONTACT.email ? <> — exercez-le à l'adresse <strong>{CONTACT.email}</strong></> : null}.
        </p>
        {!LEGAL.dataControllerContact && (
          <p className="text-sm italic text-muted-foreground">
            Le responsable de traitement et le délai de conservation seront précisés dès leur
            validation. Aucune information légale n'est publiée tant qu'elle n'est pas confirmée.
          </p>
        )}
      </div>
    </SimplePage>
  ),
});
