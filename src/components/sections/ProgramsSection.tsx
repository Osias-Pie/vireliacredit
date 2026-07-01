import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROGRAMS } from "@/lib/data/programs";
import { useCurrency } from "@/lib/currency/context";
import { useI18n } from "@/lib/i18n/context";

interface ProgramsProps {
  compact?: boolean;
}

export function ProgramsSection({ compact = false }: ProgramsProps) {
  const { t } = useI18n();
  const { format } = useCurrency();
  const items = compact ? PROGRAMS.slice(0, 3) : PROGRAMS;

  return (
    <section id="programs" className="container-page py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("programs.title")}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("programs.subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="surface-card surface-card-hover group flex flex-col overflow-hidden p-7"
            >
              <div
                className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-[var(--shadow-elegant)]`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("programs.max_amount")}
                </p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {format(p.maxAmountEUR)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.audience}</p>
              </div>
              <Button
                asChild
                variant="ghost"
                className="mt-5 w-fit gap-1.5 px-0 text-primary hover:bg-transparent hover:text-primary-dark"
              >
                <Link to="/apply" search={{ program: p.slug } as never}>
                  {t("programs.apply")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
