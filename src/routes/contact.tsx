import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { SimplePage } from "@/components/layout/SimplePage";

export const Route = createFileRoute("/contact")({ component: () => (
  <SimplePage title="Contact" subtitle="Notre équipe vous répond sous 24 à 72h ouvrées.">
    <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
      <InfoCard icon={<Mail className="h-5 w-5" />} label="Email" value="contact@goldengranthub.com" />
      <InfoCard icon={<Phone className="h-5 w-5" />} label="Téléphone" value="+33 1 84 60 00 00" />
      <InfoCard icon={<MapPin className="h-5 w-5" />} label="Siège" value="Paris, France" />
    </div>
    <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-border">
      <iframe
        title="Localisation"
        src="https://www.google.com/maps?q=Paris&output=embed"
        className="h-80 w-full"
        loading="lazy"
      />
    </div>
  </SimplePage>
) });

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="surface-card p-6 text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
