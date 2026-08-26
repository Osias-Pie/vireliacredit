import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck2, Lock, SearchCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-advisory.jpg";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative isolate min-h-[680px] overflow-hidden bg-[#071D2A] sm:min-h-[720px] lg:min-h-[760px]">
      <motion.img
        src={heroImage}
        alt=""
        aria-hidden
        initial={{ scale: 1.025 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover object-[64%_center] sm:object-[68%_center] lg:object-center"
        width={1600}
        height={1100}
        fetchPriority="high"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,29,42,0.97)_0%,rgba(7,29,42,0.91)_37%,rgba(7,29,42,0.62)_62%,rgba(7,29,42,0.22)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,29,42,0.5)_0%,transparent_48%,rgba(7,29,42,0.18)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -left-28 top-20 h-96 w-96 rounded-full bg-[#155EEF]/20 blur-3xl"
      />

      <div className="container-page relative z-10 flex min-h-[680px] items-center py-24 sm:min-h-[720px] lg:min-h-[760px] lg:py-28">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-10 bg-[#7EB0FF]" />
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#DCE9FF]">
              Solutions de financement
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.08 }}
            className="mt-6 max-w-[16ch] font-display text-[clamp(2.7rem,6vw,5.7rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-white"
          >
            {t("home.hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-7 max-w-[42rem] text-base leading-7 text-white/82 sm:text-lg sm:leading-8"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg" className="group h-12 rounded-full bg-[#155EEF] px-7 font-semibold text-white shadow-xl shadow-blue-950/30 hover:bg-[#0F4DD4]">
              <Link to="/eligibility">
                {t("home.hero.cta_primary")}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-white/30 bg-white/8 px-7 font-semibold text-white backdrop-blur-sm hover:bg-white/14 hover:text-white"
            >
              <Link to="/programs">{t("cta.discover")}</Link>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-12 grid max-w-2xl gap-3 border-t border-white/16 pt-6 text-[0.82rem] text-white/72 sm:grid-cols-3"
          >
            <li className="flex items-center gap-2">
              <SearchCheck className="h-4 w-4 shrink-0 text-[#8FB4FF]" />
              Éligibilité en quelques questions
            </li>
            <li className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 shrink-0 text-[#8FB4FF]" />
              Demande structurée en ligne
            </li>
            <li className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-[#8FB4FF]" />
              Suivi privé par référence
            </li>
          </motion.ul>

          <p className="mt-5 max-w-[58ch] text-[0.72rem] leading-relaxed text-white/48">
            {t("home.hero.legal")}
          </p>
        </div>
      </div>
    </section>
  );
}
