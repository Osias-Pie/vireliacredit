import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYMENT_STATUSES, SUPPORTED_CURRENCIES, type EmploymentStatus, type LoanCurrency } from "@/config/loans";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

type IncomeKind = "yes" | "no" | "variable";

export function EligibilityCheck({ id = "eligibilite" }: { id?: string }) {
  const { t } = useI18n();
  const [situation, setSituation] = useState<EmploymentStatus | "">("");
  const [income, setIncome] = useState<IncomeKind | "">("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<LoanCurrency>("EUR");
  const [result, setResult] = useState<"positive" | "review" | null>(null);

  const applySearch = useMemo(
    () => ({
      status: situation || undefined,
      amount: amount ? Number(amount) : undefined,
      currency,
    }),
    [situation, amount, currency],
  );

  function check() {
    if (!situation || !income || !(Number(amount) > 0)) return;
    const oriented =
      income === "yes" &&
      (situation === "employee" ||
        situation === "self_employed" ||
        situation === "business_owner" ||
        situation === "retired");
    setResult(oriented ? "positive" : "review");
  }

  return (
    <section id={id} className="bg-surface py-16 sm:py-24">
      <div className="container-page max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("eligibility.check.title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("eligibility.check.subtitle")}</p>

        <div className="surface-card mt-8 space-y-5 p-5 sm:p-8">
          <div>
            <Label className="text-sm font-medium">{t("eligibility.q1")}</Label>
            <Select value={situation} onValueChange={(v) => setSituation(v as EmploymentStatus)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`status.${s}` as TranslationKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">{t("eligibility.q2")}</Label>
            <Select value={income} onValueChange={(v) => setIncome(v as IncomeKind)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">{t("eligibility.income.yes")}</SelectItem>
                <SelectItem value="no">{t("eligibility.income.no")}</SelectItem>
                <SelectItem value="variable">{t("eligibility.income.variable")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">{t("eligibility.q3")}</Label>
              <Input
                className="mt-1.5"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t("field.currency")}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as LoanCurrency)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full rounded-full sm:w-auto" onClick={check}>
            {t("eligibility.check.cta")}
          </Button>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-border bg-background p-5 sm:p-6">
            <h3 className="text-xl font-semibold">
              {result === "positive"
                ? t("eligibility.result.positive.title")
                : t("eligibility.result.review.title")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {result === "positive"
                ? t("eligibility.result.positive.text")
                : t("eligibility.result.review.text")}
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link to="/apply" search={applySearch}>
                {result === "positive" ? t("eligibility.result.apply") : t("eligibility.result.deposit")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
