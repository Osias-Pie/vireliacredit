import { Link } from "@tanstack/react-router";
import { BRAND } from "@/config/brand";
import logoMark from "@/assets/virelia-icon.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoMark}
        alt={BRAND.name}
        width={36}
        height={36}
        className="h-9 w-9 rounded-xl object-cover shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105"
      />
      <span className="text-[15px] font-bold tracking-tight text-foreground sm:text-base">
        {BRAND.name}
      </span>
    </Link>
  );
}
