import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calculator, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { useMarket } from "@/lib/market/context";
import { LOAN_PRODUCTS } from "@/lib/data/programs";
import { formatMoney, type ProductPricing } from "@/config/markets";
import { countryName } from "@/lib/market/country-name";

interface Estimation {
  monthly: number;
  interest: number;
  fees: number;
  totalCost: number;
  totalRepaid: number;
}

/** Pure amortisation maths — no commercial value is invented here. */
function estimate(amount: number, months: number, pricing: ProductPricing): Estimation {
  const rate = (pricing.nominalRate ?? 0) / 100 / 12;
  const monthly =
    rate === 0 ? amount / months : (amount * rate) / (1 - Math.pow(1 + rate, -months));
  const interest = monthly * months - amount;
  const fees = pricing.fees.reduce((sum, f) => {
    if (f.kind === "fixed") return sum + f.value;
    if (f.kind === "percent_of_amount") return sum + (amount * f.value) / 100;
    return sum + (amount * f.value * months) / 100;
  }, 0);
  return {
    monthly,
    interest,
    fees,
    totalCost: interest + fees,
    totalRepaid: amount + interest + fees,
  };
}

export function LoanSimulator() {
  const { t, locale } = useI18n();
  const { market, marketCode } = useMarket();

  const available = LOAN_PRODUCTS.filter((p) => market.products.includes(p.slug));
  const [slug, setSlug] = useState(available[0]?.slug ?? "personal");
  const pricing = market.pricing[slug] ?? null;

  const [amount, setAmount] = useState(pricing?.minAmount ?? 10000);
  const [months, setMonths] = useState(pricing?.durations[0] ?? 24);

  const result = useMemo(
    () => (pricing ? estimate(amount, months, pricing) : null),
    [pricing, amount, months],
  );

  const money = (v: number) => formatMoney(v, market.currency, `${locale}-${marketCode}`);

  return (
    <section id="simulateur" className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Calculator className="h-3.5 w-3.5" /> {t("nav.simulator")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("simulator.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("simulator.subtitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {countryName(marketCode, locale)} · {t("market.currency")}: {market.currency}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2"
        >
          {/* Inputs */}
          <div className="surface-card space-y-7 p-6 sm:p-8">
            <div>
              <label className="text-sm font-medium">{t("simulator.product")}</label>
              <Select value={slug} onValueChange={setSlug}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {available.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {pricing ? (
              <>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium">{t("simulator.amount")}</label>
                    <span className="font-semibold tabular-nums text-primary">{money(amount)}</span>
                  </div>
                  <Slider
                    className="mt-4"
                    min={pricing.minAmount}
                    max={pricing.maxAmount}
                    step={500}
                    value={[amount]}
                    onValueChange={([v]) => setAmount(v)}
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium">{t("simulator.duration")}</label>
                    <span className="font-semibold tabular-nums text-primary">
                      {months} {t("simulator.months")}
                    </span>
                  </div>
                  <Slider
                    className="mt-4"
                    min={Math.min(...pricing.durations)}
                    max={Math.max(...pricing.durations)}
                    step={6}
                    value={[months]}
                    onValueChange={([v]) => setMonths(v)}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{t("simulator.pending_title")}</p>
                <p className="mt-2 leading-relaxed">{t("simulator.pending_text")}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="surface-card flex flex-col p-6 sm:p-8">
            <h3 className="text-lg font-semibold">{t("simulator.results")}</h3>
            <dl className="mt-6 space-y-3 text-sm">
              <Row label={t("simulator.monthly")} value={result ? money(result.monthly) : null} strong />
              <Row
                label={t("simulator.rate")}
                value={pricing?.nominalRate != null ? `${pricing.nominalRate} %` : null}
              />
              <Row label={t("simulator.apr")} value={pricing?.apr != null ? `${pricing.apr} %` : null} />
              <Row label={t("simulator.fees")} value={result ? money(result.fees) : null} />
              <Row label={t("simulator.total_interest")} value={result ? money(result.interest) : null} />
              <Row label={t("simulator.total_cost")} value={result ? money(result.totalCost) : null} />
              <Row label={t("simulator.total_repaid")} value={result ? money(result.totalRepaid) : null} />
            </dl>

            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("simulator.disclaimer")}
            </p>

            <div className="mt-6">
              <Button asChild className="w-full rounded-full" size="lg">
                <Link
                  to="/apply"
                  search={{ program: slug, amount: pricing ? amount : undefined, duration: pricing ? months : undefined }}
                >
                  {t("simulator.cta")}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string | null; strong?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          value
            ? strong
              ? "text-lg font-bold tabular-nums text-primary"
              : "font-medium tabular-nums"
            : "text-xs italic text-muted-foreground"
        }
      >
        {value ?? t("simulator.pending")}
      </dd>
    </div>
  );
}
