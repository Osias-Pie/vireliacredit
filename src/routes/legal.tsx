import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { BRAND, LEGAL } from "@/config/brand";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Virelia Crédit" },
      { name: "description", content: "Mentions légales de la plateforme Virelia Crédit." },
      { property: "og:title", content: "Mentions légales — Virelia Crédit" },
      { property: "og:description", content: "Éditeur, identité légale et informations réglementaires." },
      { property: "og:url", content: "https://vireliacredit.lovable.app/legal" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/legal" }],
  }),
  component: () => (
    <SimplePage title="Mentions légales">
      <div className="prose prose-slate mx-auto max-w-3xl">
        <p><strong>Plateforme :</strong> {BRAND.name}</p>
        <p><strong>Raison sociale :</strong> {LEGAL.legalCompanyName ?? "en cours de configuration"}</p>
        <p><strong>Numéro d'enregistrement :</strong> {LEGAL.registrationNumber ?? "en cours de configuration"}</p>
        <p><strong>Informations réglementaires :</strong> {LEGAL.regulatoryInformation ?? "en cours de configuration"}</p>
        <p className="text-sm italic text-muted-foreground">
          Aucune mention légale ou réglementaire n'est publiée tant qu'elle n'a pas été confirmée.
        </p>
      </div>
    </SimplePage>
  ),
});
