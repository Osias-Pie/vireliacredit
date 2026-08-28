import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

/** Only verified testimonials may render. Internal placeholders never reach visitors. */
export function Testimonials() {
  const { t } = useI18n();
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="border-y border-gold/20 bg-primary py-20 text-primary-foreground sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Confiance & preuves</p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mt-4 text-lg text-white/75">{t("testimonials.subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-gold/25 bg-white/8 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50"
            >
              <Quote className="h-7 w-7 text-gold/60" aria-hidden />
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-white/90">« {item.quote} »</p>
              <div className="mt-5 flex items-center justify-between border-t border-gold/20 pt-4">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-white/65">{item.role} · {item.country}</p>
                </div>
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: item.rating }).map((_, k) => (
                    <Star key={k} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
              <span className="mt-4 inline-flex w-fit rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-gold">
                {item.program}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
