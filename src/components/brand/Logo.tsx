import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/context";
import { BRAND } from "@/config/brand";
import logoMark from "@/assets/virelia-icon.png";

export function Logo({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoMark}
        alt={BRAND.name}
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl object-cover shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          {BRAND.name}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {t("brand.tagline")}
        </span>
      </span>
    </Link>
  );
}
