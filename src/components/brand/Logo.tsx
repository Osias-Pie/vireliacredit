import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function Logo({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105"
        aria-hidden
      >
        <Sparkles className="h-4.5 w-4.5" strokeWidth={2.5} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Global Finance
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Initiative
        </span>
      </span>
      <span className="sr-only">{t("brand.name")}</span>
    </Link>
  );
}
