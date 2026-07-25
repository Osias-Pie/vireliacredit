import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/context";
import logoMark from "@/assets/golden-grant-hub-icon.png";

export function Logo({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoMark}
        alt="Golden Grant Hub"
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl object-cover shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Golden Grant Hub
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          International Grants
        </span>
      </span>
      <span className="sr-only">{t("brand.name")}</span>
    </Link>
  );
}
