import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  useEffect(() => setOpen(false), [pathname]);

  const primaryLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/programs", label: t("nav.solutions") },
    { to: "/eligibility", label: t("nav.eligibility") },
    { to: "/process", label: t("nav.process") },
    { to: "/suivi", label: t("nav.track") },
    { to: "/faq", label: t("nav.faq") },
  ] as const;

  const secondaryLinks = [
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-background/88 backdrop-blur-lg",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 lg:gap-4">
        <Logo className="shrink-0" />

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label={t("ui.nav.primary")}
        >
          {primaryLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/8 data-[status=active]:text-primary xl:px-3"
            >
              {l.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 rounded-full px-2.5 text-[13px] font-medium text-muted-foreground xl:px-3"
              >
                {t("ui.nav.more")} <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {secondaryLinks.map((l) => (
                <DropdownMenuItem key={l.to} asChild>
                  <Link to={l.to} className="w-full cursor-pointer">
                    {l.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="flex items-center justify-between gap-3 focus:bg-transparent">
                <span className="text-xs text-muted-foreground">{t("ui.theme")}</span>
                <ThemeToggle />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center md:flex">
            <LanguageSelector />
          </div>
          <Button asChild size="sm" className="hidden h-9 rounded-full px-4 font-semibold lg:inline-flex xl:px-5">
            <Link to="/apply">{t("nav.apply")}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("ui.menu")}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/98 shadow-lg backdrop-blur-xl lg:hidden">
          <div className="container-page grid gap-1 py-4">
            {[...primaryLinks, ...secondaryLinks].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/8 data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3 md:hidden">
              <LanguageSelector />
              <ThemeToggle />
            </div>
            <Button asChild className="mt-3 h-11 rounded-full">
              <Link to="/apply">{t("nav.apply")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
