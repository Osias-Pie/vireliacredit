import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/context";

function AnimatedNumber({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 40, damping: 20 });
  const rounded = useTransform(spring, (v) => new Intl.NumberFormat("fr-FR").format(Math.round(v)));

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function Stats() {
  const { t } = useI18n();
  const items = [
    { value: 12500, suffix: "+", label: t("home.stats.applications") },
    { value: 6, suffix: "", label: t("home.stats.programs") },
    { value: 32, suffix: "", label: t("home.stats.countries") },
    { value: 97, suffix: "%", label: t("home.stats.satisfaction") },
  ];
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="grid gap-6 rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-primary-dark p-8 text-primary-foreground shadow-[var(--shadow-glow)] sm:grid-cols-2 lg:grid-cols-4 lg:p-12">
        {items.map((s) => (
          <div key={s.label} className="text-center lg:text-left">
            <div className="text-4xl font-bold tracking-tight sm:text-5xl">
              <AnimatedNumber to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-2 text-sm font-medium text-primary-foreground/80">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
