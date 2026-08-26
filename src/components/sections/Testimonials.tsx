import { motion } from "framer-motion";
import { Quote, Star, ImageIcon, MessageSquareText, ShieldCheck } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

/**
 * This section never invents social proof. Real testimonials can be populated
 * through TESTIMONIALS; until then, it shows an explicit, neutral proof area.
 */
export function Testimonials() {
  const { t } = useI18n();

  if (TESTIMONIALS.length === 0) {
    return (
      <section className="border-y border-border/70 bg-[#071D2A] py-20 text-white sm:py-24">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/7 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#DCE9FF]">
                Confiance & preuves
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ils nous font confiance
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base">
                Cet espace est réservé aux avis, captures et preuves réellement fournis. Aucun témoignage ni résultat n’est généré artificiellement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <ProofSlot icon={MessageSquareText} title="Avis clients" text="Les retours vérifiés pourront être publiés ici." />
              <ProofSlot icon={ImageIcon} title="Captures & preuves" text="Une galerie pourra accueillir les éléments fournis." />
              <ProofSlot icon={ShieldCheck} title="Contenu vérifiable" text="Aucune donnée fictive n’est affichée pour remplir la section." />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Confiance & preuves</p>
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
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">« {item.quote} »</p>
              <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role} · {item.country}</p>
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

function ProofSlot({ icon: Icon, title, text }: { icon: typeof MessageSquareText; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.055] p-5 backdrop-blur-sm">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#155EEF]/20 text-[#A9C6FF]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-white/58">{text}</p>
    </div>
  );
}
