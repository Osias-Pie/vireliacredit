import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import heroImage from "@/assets/hero.jpg";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 40% at 15% 10%, oklch(0.68 0.11 240 / 0.18), transparent 70%), radial-gradient(50% 40% at 90% 20%, oklch(0.78 0.13 78 / 0.14), transparent 70%)",
        }}
      />
      <div className="container-page grid items-center gap-12 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/6 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> {t("home.hero.badge")}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("home.hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("home.hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 rounded-full px-6 shadow-[var(--shadow-elegant)]">
              <Link to="/apply">
                {t("cta.apply")}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6">
              <Link to="/programs">{t("cta.discover")}</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> RGPD · SSL 256-bit
            </span>
            <span>30+ pays · 15 ans d'expérience</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/12 via-transparent to-[oklch(0.78_0.13_78)]/15 blur-2xl" aria-hidden />
          <div className="overflow-hidden rounded-[2rem] border border-border bg-surface-elevated shadow-[var(--shadow-glow)]">
            <img
              src={heroImage}
              alt="Illustration abstraite représentant la croissance financière"
              width={1600}
              height={1200}
              className="h-auto w-full"
              fetchPriority="high"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
