import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOAN_PRODUCTS } from "@/lib/data/programs";
import { useI18n } from "@/lib/i18n/context";

interface ProgramsProps { compact?: boolean; }

/** Loan solutions without invented rates, ranges or country-specific conditions. */
export function ProgramsSection({ compact = false }: ProgramsProps) {
  const { t } = useI18n();
  const items = compact ? LOAN_PRODUCTS.slice(0, 3) : LOAN_PRODUCTS;

  return (
    <section id="solutions" className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">{t("solutions.repayable")}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t("solutions.title")}</h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{t("home.why.subtitle")}</p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="surface-card surface-card-hover group flex min-h-[310px] flex-col p-7 lg:p-8"
            >
              <div className={`mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} text-white shadow-[var(--shadow-soft)]`}>
                <Icon className="h-6 w-6" strokeWidth={2.1} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{p.audience}</span>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{p.description}</p>
              <Button asChild variant="ghost" className="mt-6 w-fit gap-1.5 px-0 text-primary hover:bg-transparent hover:text-primary-dark">
                <Link to="/apply" search={{ program: p.slug }}>
                  {t("solutions.apply")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.article>
          );
        })}
      </div>

      {compact && (
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/programs">{t("cta.discover")}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
