import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Target, Rocket, HandCoins } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-premium.jpg";

const SLIDE_ICONS = [HandCoins, TrendingUp, Target, Rocket];

export function Hero() {
  const { t } = useI18n();
  const SLIDES = [
    { icon: SLIDE_ICONS[0], text: t("home.hero.rotate1") },
    { icon: SLIDE_ICONS[1], text: t("home.hero.rotate2") },
    { icon: SLIDE_ICONS[2], text: t("home.hero.rotate3") },
    { icon: SLIDE_ICONS[3], text: t("home.hero.rotate4") },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIdx((n) => (n + 1) % 4), 3500);
    return () => clearInterval(i);
  }, []);

  const Slide = SLIDES[idx];
  const SlideIcon = Slide.icon;

  return (
    <section className="relative isolate min-h-[92vh] w-full overflow-hidden">
      {/* Background image */}
      <img
        src={heroImage}
        alt="Solutions de prêt remboursable"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        width={1920}
        height={1088}
        fetchPriority="high"
      />
      {/* Overlays for readability */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "linear-gradient(120deg, oklch(0.16 0.08 258 / 0.88) 0%, oklch(0.20 0.09 258 / 0.72) 45%, oklch(0.18 0.08 258 / 0.55) 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 50% at 20% 30%, oklch(0.78 0.13 78 / 0.18), transparent 70%)",
        }}
      />

      <div className="container-page relative flex min-h-[92vh] flex-col justify-center py-24 sm:py-28">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.78_0.13_78)]/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[oklch(0.88_0.11_82)] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-[oklch(0.88_0.13_82)] via-[oklch(0.80_0.15_78)] to-[oklch(0.72_0.14_72)] bg-clip-text text-transparent">
              {t("home.hero.title")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          {/* Rotating benefit slider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 flex h-10 items-center gap-3 text-white/90"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
                className="flex items-center gap-2.5"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.78_0.13_78)]/25 text-[oklch(0.88_0.13_82)] ring-1 ring-[oklch(0.78_0.13_78)]/40">
                  <SlideIcon className="h-4 w-4" />
                </span>
                <span className="text-base font-medium sm:text-lg">{Slide.text}</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="group h-13 rounded-full bg-gradient-to-r from-[oklch(0.78_0.14_78)] to-[oklch(0.68_0.16_70)] px-7 text-base font-semibold text-[oklch(0.18_0.06_258)] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)] hover:from-[oklch(0.82_0.14_80)] hover:to-[oklch(0.72_0.16_72)]"
            >
              <Link to="/apply">
                {t("cta.apply")}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 rounded-full border-white/30 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur-md hover:bg-white/15 hover:text-white"
            >
              <Link to="/simulator">{t("cta.simulate")}</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/70"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[oklch(0.85_0.13_82)]" /> RGPD · SSL
            </span>
            <span>{t("solutions.repayable")}</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
