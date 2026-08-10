import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

/**
 * Loan testimonials. The list is intentionally empty until real, verified
 * borrower feedback is provided — the section then hides itself.
 */
export function Testimonials() {
  const { t } = useI18n();
  if (TESTIMONIALS.length === 0) return null;

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
