import { motion } from "framer-motion";
import { FileCheck2, Landmark, ShieldCheck, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

/** Qualitative commitments — no unverified figures are displayed. */
export function Stats() {
  const { t } = useI18n();
  const items = [
    { icon: FileCheck2, title: t("home.benefits.item1.title"), text: t("home.benefits.item1.text") },
    { icon: Landmark, title: t("home.benefits.item2.title"), text: t("home.benefits.item2.text") },
    { icon: ShieldCheck, title: t("home.benefits.item3.title"), text: t("home.benefits.item3.text") },
    { icon: Mail, title: t("home.benefits.item4.title"), text: t("home.benefits.item4.text") },
  ];

  return (
    <section className="border-b border-border bg-surface py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("home.benefits.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("home.benefits.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
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
