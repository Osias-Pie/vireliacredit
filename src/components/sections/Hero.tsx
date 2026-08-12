import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Globe2, FileCheck2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useMarket } from "@/lib/market/context";
import { countryName } from "@/lib/market/country-name";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-advisory.jpg";

/**
 * Virelia hero — editorial split composition.
 * Left: deep petrol panel carrying the message. Right: the advisory photo.
 * The former full-bleed "coins & plant" background image is no longer used.
 */
export function Hero() {
  const { t, locale } = useI18n();
  const { market, marketCode } = useMarket();

  return (
    <section className="relative isolate overflow-hidden bg-[var(--primary-dark)]">
      <div className="grid lg:grid-cols-12">
        {/* ---------------- Message panel ---------------- */}
        <div className="relative z-10 lg:col-span-7">
          {/* subtle gold wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(70% 60% at 8% 12%, oklch(0.7587 0.106 77.6 / 0.14), transparent 68%)",
            }}
          />
          <div className="mx-auto flex max-w-[46rem] flex-col justify-center px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32 xl:pl-[max(3rem,calc((100vw-80rem)/2+3rem))]">
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-10 bg-[var(--gold)]" aria-hidden />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("home.hero.eyebrow")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-6 max-w-[19ch] font-display font-semibold leading-[1.06] tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(2rem, 4.6vw, 3.6rem)" }}
            >
              {t("home.hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-6 max-w-[46ch] text-base leading-relaxed text-white/75 sm:text-lg"
            >
              {t("home.hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-sm bg-[var(--gold)] px-7 text-[0.95rem] font-semibold text-[var(--gold-foreground)] hover:bg-[var(--gold)]/90"
              >
                <Link to="/simulator">
                  {t("home.hero.cta_primary")}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-sm border-white/25 bg-transparent px-7 text-[0.95rem] font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/programs">{t("home.hero.cta_secondary")}</Link>
              </Button>
            </motion.div>

            {/* trust strip — factual only, no certification claim */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-12 grid gap-x-8 gap-y-3 border-t border-white/12 pt-6 text-[0.8rem] text-white/60 sm:grid-cols-3"
            >
              <li className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden />
                {countryName(marketCode, locale)} · {market.currency}
              </li>
              <li className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden />
                {t("solutions.repayable")}
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden />
                {t("transparency.item2.title")}
              </li>
            </motion.ul>

            <p className="mt-6 max-w-[52ch] text-[0.72rem] leading-relaxed text-white/45">
              {t("home.hero.legal")}
            </p>
          </div>
        </div>

        {/* ---------------- Image panel ---------------- */}
        <div className="relative order-first min-h-[52vw] sm:min-h-[40vw] lg:order-last lg:col-span-5 lg:min-h-[unset]">
          <img
            src={heroImage}
            alt={t("home.hero.eyebrow")}
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1280}
            height={1600}
            fetchPriority="high"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.2358 0.0255 222.6 / 0.92) 0%, oklch(0.2358 0.0255 222.6 / 0.35) 32%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-24 lg:hidden"
            style={{
              background:
                "linear-gradient(0deg, oklch(0.2358 0.0255 222.6) 0%, transparent 100%)",
            }}
          />
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-1 w-full bg-[var(--gold)] lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:w-1"
          />
        </div>
      </div>
    </section>
  );
}
