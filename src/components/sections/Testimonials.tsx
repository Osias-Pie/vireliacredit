import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

export function Testimonials() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const item = TESTIMONIALS[i];

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 6500);
    return () => clearInterval(id);
  }, []);

  const prev = () => setI((v) => (v - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setI((v) => (v + 1) % TESTIMONIALS.length);

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("testimonials.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("testimonials.subtitle")}</p>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="surface-card relative overflow-hidden p-8 sm:p-12">
            <Quote className="absolute right-8 top-8 h-16 w-16 text-primary/8" aria-hidden />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex gap-0.5 text-[oklch(0.78_0.13_78)]">
                  {Array.from({ length: item.rating }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-lg leading-relaxed text-foreground sm:text-xl">
                  « {item.quote} »
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-light text-lg font-semibold text-primary-foreground">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.role} · {item.country}
                    </p>
                  </div>
                  <span className="ml-auto hidden rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary sm:inline">
                    {item.program}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" size="icon" className="rounded-full" onClick={prev} aria-label="Précédent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, k) => (
                <button
                  key={k}
                  aria-label={`Aller au témoignage ${k + 1}`}
                  onClick={() => setI(k)}
                  className={`h-1.5 rounded-full transition-all ${
                    k === i ? "w-8 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" className="rounded-full" onClick={next} aria-label="Suivant">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
