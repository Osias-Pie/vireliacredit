import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calculator, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { useMarket } from "@/lib/market/context";
import { LOAN_PRODUCTS } from "@/lib/data/programs";
import {
  formatMoney,
  getPricing,
  getProcessingFee,
  marketProductSlugs,
  PROCESSING_SPEEDS,
  type ProcessingSpeed,
  type ProductPricing,
} from "@/config/markets";
import { countryName } from "@/lib/market/country-name";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Estimation {
  monthly: number;
  interest: number;
  fees: number;
  totalCost: number;
  totalRepaid: number;
}

/** Pure amortisation maths — no commercial value is invented here. */
function estimate(
  amount: number,
  months: number,
  pricing: ProductPricing,
): Estimation | null {
  if (pricing.nominalRate == null) return null;
  const rate = pricing.nominalRate / 100 / 12;
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

export const speedKey = (s: ProcessingSpeed) => `speed.${s}` as TranslationKey;

export function LoanSimulator() {
  const { t, locale } = useI18n();
  const { market, marketCode } = useMarket();

  const slugs = marketProductSlugs(market);
  const available = LOAN_PRODUCTS.filter((p) => slugs.includes(p.slug));
  const [slug, setSlug] = useState(available[0]?.slug ?? "personal");
  const [speed, setSpeed] = useState<ProcessingSpeed>("48h");

  const pricing = getPricing(market, slug);
  const amountRange = pricing
    ? { min: pricing.minAmount, max: pricing.maxAmount, step: 500 }
    : market.amountRange;
  const durationRange = pricing
    ? { min: Math.min(...pricing.durations), max: Math.max(...pricing.durations), step: 6 }
    : market.durationRange;

  const [amount, setAmount] = useState(
    Math.round((amountRange.min + amountRange.max) / 2 / 1000) * 1000,
  );
  const [months, setMonths] = useState(
    Math.min(durationRange.max, Math.max(durationRange.min, 48)),
  );

  useEffect(() => {
    setAmount((a) => Math.min(amountRange.max, Math.max(amountRange.min, a)));
    setMonths((m) => Math.min(durationRange.max, Math.max(durationRange.min, m)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketCode, slug]);

  const result = useMemo(
    () => (pricing ? estimate(amount, months, pricing) : null),
    [pricing, amount, months],
  );

  const processingFee = getProcessingFee(market, slug, speed);

  const money = (v: number, currency = market.currency) =>
    formatMoney(v, currency, `${locale}-${marketCode}`);

  const product = available.find((p) => p.slug === slug);

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
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            {t("simulator.subtitle")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {countryName(marketCode, locale)} · {market.currency}
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
          <div className="surface-card space-y-7 p-5 sm:p-8">
            <div>
              <label className="text-sm font-medium">{t("simulator.product")}</label>
              <Select value={slug} onValueChange={setSlug}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {available.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {t(p.titleKey as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label className="text-sm font-medium">{t("simulator.amount")}</label>
                <span className="font-semibold tabular-nums text-primary">{money(amount)}</span>
              </div>
              <Slider
                className="mt-4"
                min={amountRange.min}
                max={amountRange.max}
                step={amountRange.step}
                value={[amount]}
                onValueChange={([v]) => setAmount(v)}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label className="text-sm font-medium">{t("simulator.duration")}</label>
                <span className="font-semibold tabular-nums text-primary">
                  {months} {t("simulator.months")}
                </span>
              </div>
              <Slider
                className="mt-4"
                min={durationRange.min}
                max={durationRange.max}
                step={durationRange.step}
                value={[months]}
                onValueChange={([v]) => setMonths(v)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t("simulator.speed")}</label>
              <Select value={speed} onValueChange={(v) => setSpeed(v as ProcessingSpeed)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROCESSING_SPEEDS.map((s) => (
                    <SelectItem key={s} value={s}>{t(speedKey(s))}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {processingFee && (
                <div className="mt-3 flex items-start justify-between gap-3 rounded-2xl bg-primary/5 p-3.5">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{t("simulator.processing_fee")}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-primary">
                    {money(processingFee.amount, processingFee.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="surface-card flex flex-col p-5 sm:p-8">
            <h3 className="text-lg font-semibold">{t("simulator.results")}</h3>
            <dl className="mt-6 space-y-3 text-sm">
              <Row
                label={t("simulator.product")}
                value={product ? t(product.titleKey as TranslationKey) : slug}
              />
              <Row label={t("simulator.amount")} value={money(amount)} strong />
              <Row label={t("market.currency")} value={market.currency} />
              <Row
                label={t("simulator.duration")}
                value={`${months} ${t("simulator.months")}`}
              />
              {result && <Row label={t("simulator.monthly")} value={money(result.monthly)} strong />}
              <Row
                label={t("simulator.rate")}
                value={
                  pricing?.nominalRate != null
                    ? `${pricing.nominalRate} %`
                    : t("simulator.rate_on_offer")
                }
                muted={pricing?.nominalRate == null}
              />
              {pricing?.apr != null && <Row label={t("simulator.apr")} value={`${pricing.apr} %`} />}
              {result && (
                <>
                  <Row label={t("simulator.total_interest")} value={money(result.interest)} />
                  <Row label={t("simulator.fees")} value={money(result.fees)} />
                  <Row label={t("simulator.total_cost")} value={money(result.totalCost)} />
                  <Row label={t("simulator.total_repaid")} value={money(result.totalRepaid)} />
                </>
              )}
              <Row label={t("simulator.speed")} value={t(speedKey(speed))} />
              {processingFee && (
                <Row
                  label={t("simulator.processing_fee")}
                  value={money(processingFee.amount, processingFee.currency)}
                  strong
                />
              )}
            </dl>

            {processingFee && (
              <p className="mt-5 rounded-2xl bg-muted/60 p-3.5 text-xs leading-relaxed text-muted-foreground">
                {t("simulator.processing_fee_note")}
              </p>
            )}

            <div className="mt-6">
              <Button asChild className="w-full rounded-full" size="lg">
                <Link
                  to="/apply"
                  search={{ program: slug, amount, duration: months, speed }}
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

function Row({
  label, value, strong, muted,
}: {
  label: string; value: string; strong?: boolean; muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0">
      <dt className="min-w-0 text-muted-foreground">{label}</dt>
      <dd
        className={
          muted
            ? "max-w-[60%] text-right text-xs leading-snug text-muted-foreground"
            : strong
              ? "shrink-0 text-lg font-bold tabular-nums text-primary"
              : "shrink-0 text-right font-medium tabular-nums"
        }
      >
        {value}
      </dd>
    </div>
  );
}
