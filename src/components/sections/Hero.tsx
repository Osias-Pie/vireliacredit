import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Lock, FileCheck2, SearchCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-advisory.jpg";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden bg-[var(--primary-dark)] lg:min-h-[690px]">
      <div className="mx-auto grid max-w-[96rem] lg:min-h-[690px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10 flex items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(65% 62% at 12% 15%, rgba(21,94,239,.28), transparent 72%)",
            }}
          />
          <div className="w-full px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:pl-[max(3rem,calc((100vw-80rem)/2+3rem))] xl:pr-16">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-9 bg-[#8FB4FF]" aria-hidden />
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#BFD3FF]">
                {t("home.hero.eyebrow")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.07 }}
              className="mt-6 max-w-[17ch] font-display text-[clamp(2.35rem,4.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white"
            >
              {t("home.hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14 }}
              className="mt-7 max-w-[42rem] text-base leading-7 text-white/75 sm:text-lg sm:leading-8"
            >
              {t("home.hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button asChild size="lg" className="group h-12 rounded-full px-7 text-[0.95rem] font-semibold shadow-lg shadow-blue-950/20">
                <Link to="/eligibility">
                  {t("home.hero.cta_primary")}
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-white/25 bg-white/5 px-7 text-[0.95rem] font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/apply">{t("nav.apply")}</Link>
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="mt-11 grid max-w-2xl gap-3 border-t border-white/12 pt-6 text-[0.8rem] text-white/65 sm:grid-cols-3"
            >
              <li className="flex items-center gap-2">
                <SearchCheck className="h-4 w-4 shrink-0 text-[#8FB4FF]" aria-hidden />
                {t("cta.check_eligibility")}
              </li>
              <li className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 shrink-0 text-[#8FB4FF]" aria-hidden />
                {t("solutions.repayable")}
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 text-[#8FB4FF]" aria-hidden />
                {t("transparency.item2.title")}
              </li>
            </motion.ul>

            <p className="mt-5 max-w-[52ch] text-[0.72rem] leading-relaxed text-white/45">
              {t("home.hero.legal")}
            </p>
          </div>
        </div>

        <div className="relative order-first min-h-[55vw] sm:min-h-[38rem] lg:order-last lg:min-h-full">
          <img
            src={heroImage}
            alt={t("home.hero.eyebrow")}
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1280}
            height={1600}
            fetchPriority="high"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0B1F3A]/55 lg:via-transparent lg:to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/20 lg:inset-y-0 lg:left-0 lg:h-full lg:w-px" />
        </div>
      </div>
    </section>
  );
}
