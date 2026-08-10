import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { SimplePage } from "@/components/layout/SimplePage";
import { CONTACT } from "@/config/brand";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Virelia Crédit" },
      {
        name: "description",
        content:
          "Contactez l'équipe Virelia Crédit pour toute question sur les solutions de prêt remboursable ou le suivi d'un dossier.",
      },
      { property: "og:title", content: "Contact — Virelia Crédit" },
      {
        property: "og:description",
        content: "Nos coordonnées pour vos questions sur les prêts remboursables.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  return (
    <SimplePage title={t("contact.title")} subtitle={t("contact.subtitle")}>
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        <InfoCard icon={<Mail className="h-5 w-5" />} label={t("contact.email")} value={CONTACT.email} />
        <InfoCard
          icon={<Mail className="h-5 w-5" />}
          label={t("contact.applications")}
          value={CONTACT.applicationEmail}
        />
        <InfoCard icon={<Phone className="h-5 w-5" />} label={t("contact.phone")} value={CONTACT.phone} />
        <InfoCard icon={<MapPin className="h-5 w-5" />} label={t("contact.address")} value={CONTACT.address} />
        <InfoCard icon={<Clock className="h-5 w-5" />} label={t("contact.hours")} value={CONTACT.hours} />
      </div>
      <p className="mx-auto mt-8 max-w-4xl text-center text-xs text-muted-foreground">
        {t("footer.warning")}
      </p>
    </SimplePage>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  const { t } = useI18n();
  return (
    <div className="surface-card p-6 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={value ? "mt-1 font-medium break-words" : "mt-1 text-sm italic text-muted-foreground"}>
        {value ?? t("contact.pending")}
      </p>
    </div>
  );
}
