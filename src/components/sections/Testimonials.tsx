import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Star className="h-3 w-3 fill-current" />
            4.9 / 5 — 1200+ avis
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group surface-card surface-card-hover relative overflow-hidden p-7"
            >
              <Quote
                className="absolute right-5 top-5 h-10 w-10 text-primary/10 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/20"
                aria-hidden
              />
              <div className="flex gap-0.5 text-[oklch(0.78_0.13_78)]">
                {Array.from({ length: item.rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="relative mt-4 text-[15px] leading-relaxed text-foreground/90">
                « {item.quote} »
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                <img
                  src={item.avatar}
                  alt={item.name}
                  loading="lazy"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-background shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.role} · {item.country}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {item.program}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
