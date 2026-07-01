import { motion } from "framer-motion";
import { Eye, Globe2, HeartHandshake, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function WhyChoose() {
  const { t } = useI18n();
  const items = [
    { icon: Eye, title: t("home.why.transparency.title"), text: t("home.why.transparency.text") },
    { icon: Globe2, title: t("home.why.expertise.title"), text: t("home.why.expertise.text") },
    { icon: HeartHandshake, title: t("home.why.support.title"), text: t("home.why.support.text") },
    { icon: Zap, title: t("home.why.speed.title"), text: t("home.why.speed.text") },
  ];

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("home.why.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("home.why.subtitle")}</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
