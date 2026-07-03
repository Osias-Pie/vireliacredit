import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/content";

export function Testimonials() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Star className="h-3 w-3 fill-current" />
            4.9 / 5 — 1 200+ avis vérifiés
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ils parlent de nous
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des femmes et des hommes qui ont transformé leur projet grâce à notre accompagnement.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-elegant)]"
            >
              {/* Large photo */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={item.avatar.replace("w=256&h=256", "w=800&h=600")}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.08_258)]/70 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 flex gap-0.5 rounded-full bg-white/95 px-2.5 py-1 text-[oklch(0.68_0.14_78)] shadow-md">
                  {Array.from({ length: item.rating }).map((_, k) => (
                    <Star key={k} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-xl font-bold leading-tight drop-shadow">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-white/90">
                    {item.role}
                  </p>
                  <p className="text-xs text-[oklch(0.90_0.11_82)]">
                    {item.country}
                  </p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="relative flex flex-1 flex-col p-6">
                <Quote
                  className="absolute right-5 top-5 h-8 w-8 text-primary/10 transition-colors group-hover:text-primary/20"
                  aria-hidden
                />
                <p className="text-[15px] leading-relaxed text-foreground/85">
                  « {item.quote} »
                </p>
                <div className="mt-5 border-t border-border/70 pt-4">
                  <span className="inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
                    {item.program}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
