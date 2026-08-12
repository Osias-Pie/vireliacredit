import { motion } from "framer-motion";
import { Eye, Route as RouteIcon, Globe2, Lock, LifeBuoy, Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

/**
 * Replaces the former "proofs" gallery.
 * No transfer screenshot, no beneficiary figure: only verifiable statements
 * about how the service works.
 */
export function Transparency() {
  const { t } = useI18n();
  const items = [
    { icon: Eye, title: t("trust.c1.title"), text: t("trust.c1.text") },
    { icon: RouteIcon, title: t("trust.c2.title"), text: t("trust.c2.text") },
    { icon: Globe2, title: t("trust.c3.title"), text: t("trust.c3.text") },
    { icon: Lock, title: t("trust.c4.title"), text: t("trust.c4.text") },
    { icon: LifeBuoy, title: t("trust.c5.title"), text: t("trust.c5.text") },
    { icon: Scale, title: t("trust.c6.title"), text: t("trust.c6.text") },
  ];

  return (
    <section id="transparence" className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("transparency.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("transparency.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="flex gap-4 rounded-2xl border border-border bg-background p-6"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {t("footer.warning")}
        </p>
      </div>
    </section>
  );
}
