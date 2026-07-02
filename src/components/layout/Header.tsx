import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { LanguageSelector } from "./LanguageSelector";
import { CurrencySelector } from "./CurrencySelector";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const links: { to: string; label: string }[] = [
    { to: "/", label: t("nav.home") },
    { to: "/programs", label: t("nav.programs") },
    { to: "/about", label: t("nav.about") },
    { to: "/process", label: t("nav.process") },
    { to: "/faq", label: t("nav.faq") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-background/60 backdrop-blur-md",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/8 data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            <LanguageSelector />
            <CurrencySelector />
            <ThemeToggle />
          </div>
          <Button asChild size="sm" className="hidden rounded-full px-5 shadow-[var(--shadow-elegant)] md:inline-flex">
            <Link to="/apply">{t("nav.apply")}</Link>
          </Button>
          <Button
            variant="ghost" size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/8 data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
              <LanguageSelector />
              <CurrencySelector />
              <ThemeToggle />
            </div>
            <Button asChild className="mt-3 rounded-full">
              <Link to="/apply">{t("nav.apply")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
