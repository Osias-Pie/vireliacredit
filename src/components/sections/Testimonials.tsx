import { motion } from "framer-motion";
import { Quote, Star, Calculator, ListChecks, Layers, MailCheck } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

/**
 * Loan testimonials. The list stays empty until real, verified borrower
 * feedback exists — meanwhile the same slot presents qualitative service
 * benefits instead of inventing quotes or figures.
 */
export function Testimonials() {
  const { t } = useI18n();
  if (TESTIMONIALS.length === 0) return <ExperienceFallback />;


  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("testimonials.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)]"
            >
              <Quote className="h-7 w-7 text-primary/15" aria-hidden />
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
                « {item.quote} »
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.role} · {item.country}
                  </p>
                </div>
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: item.rating }).map((_, k) => (
                    <Star key={k} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
              <span className="mt-4 inline-flex w-fit rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                {item.program}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Shown while no verified testimonial exists. Qualitative only — no figures. */
function ExperienceFallback() {
  const { t } = useI18n();
  const items = [
    { icon: Calculator, title: t("experience.e1.title"), text: t("experience.e1.text") },
    { icon: ListChecks, title: t("experience.e2.title"), text: t("experience.e2.text") },
    { icon: Layers, title: t("experience.e3.title"), text: t("experience.e3.text") },
    { icon: MailCheck, title: t("experience.e4.title"), text: t("experience.e4.text") },
  ];

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("experience.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("experience.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {t("testimonials.pending")}
        </p>
      </div>
    </section>
  );
}
