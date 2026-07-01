import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export function CTABand() {
  const { t } = useI18n();
  return (
    <section className="container-page pb-20 pt-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark p-10 text-primary-foreground sm:p-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[oklch(0.78_0.13_78)]/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-primary-light/30 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("home.cta.title")}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/85">
            {t("home.cta.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="group h-12 rounded-full px-6">
              <Link to="/apply">
                {t("cta.apply")}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/contact">{t("nav.contact")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
