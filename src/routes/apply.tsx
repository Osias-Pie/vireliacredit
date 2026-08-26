import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LOAN_PRODUCTS } from "@/lib/data/programs";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { submitApplication } from "@/lib/applications.functions";
import { generateLoanContractPdf } from "@/lib/contracts/generate-loan-contract";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";
import {
  DOCUMENTS_BY_STATUS,
  EMPLOYMENT_STATUSES,
  PROCESSING_SPEEDS,
  SUPPORTED_CURRENCIES,
  enabledLoanSlugs,
  formatMoney,
  getLoanConfig,
  getProcessingFee,
  type EmploymentStatus,
  type LoanCurrency,
  type ProcessingSpeed,
} from "@/config/loans";

export const Route = createFileRoute("/apply")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    program?: string;
    amount?: number;
    duration?: number;
    speed?: string;
    currency?: string;
    status?: string;
  } => ({
    program: typeof s.program === "string" ? s.program : undefined,
    amount: s.amount != null && Number.isFinite(Number(s.amount)) ? Number(s.amount) : undefined,
    duration:
      s.duration != null && Number.isFinite(Number(s.duration)) ? Number(s.duration) : undefined,
    speed: typeof s.speed === "string" ? s.speed : undefined,
    currency: typeof s.currency === "string" ? s.currency : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Demande de prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "Déposez votre demande de prêt remboursable en 5 étapes, puis confirmez le projet de contrat.",
      },
      { property: "og:title", content: "Demande de prêt — Virelia Crédit" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ApplyPage,
});

const TOTAL_STEPS = 5;

interface FormState {
  first_name: string;
  last_name: string;
  birth_date: string;
  country: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  employment_status: EmploymentStatus | "";
  details: Record<string, string>;
  income: string;
  other_income: string;
  monthly_charges: string;
  program: string;
  amount: string;
  currency: LoanCurrency;
  duration: string;
  purpose: string;
  speed: ProcessingSpeed;
  files: Record<string, File | null>;
  bank_name: string;
  account_holder_name: string;
  iban_account_number: string;
  swift_bic: string;
  accept: boolean;
}

const DETAIL_FIELDS: Record<EmploymentStatus, { id: string; label: TranslationKey }[]> = {
  employee: [
    { id: "job", label: "field.job" },
    { id: "employer", label: "field.employer" },
    { id: "seniority", label: "field.seniority" },
    { id: "contract", label: "field.contract" },
  ],
  self_employed: [
    { id: "activity", label: "field.activity" },
    { id: "company_name", label: "field.company_name" },
    { id: "activity_seniority", label: "field.activity_seniority" },
  ],
  business_owner: [
    { id: "job", label: "field.function" },
    { id: "company_name", label: "field.company_name" },
    { id: "seniority", label: "field.seniority" },
  ],
  retired: [{ id: "pension_provider", label: "field.pension_provider" }],
  other: [{ id: "situation_type", label: "field.situation_type" }],
};

const INCOME_LABEL: Record<EmploymentStatus, TranslationKey> = {
  employee: "field.net_salary",
  self_employed: "field.net_income",
  business_owner: "field.net_income",
  retired: "field.pension_amount",
  other: "field.net_income",
};

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function ApplyPage() {
  const { t, locale } = useI18n();
  const search = useSearch({ from: "/apply" });
  const navigate = useNavigate();
  const assistant = useAssistantContext();

  const slugs = enabledLoanSlugs() as string[];
  const products = LOAN_PRODUCTS.filter((p) => slugs.includes(p.slug));
  const initialStatus = (EMPLOYMENT_STATUSES as readonly string[]).includes(search.status ?? "")
    ? (search.status as EmploymentStatus)
    : "";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    birth_date: "",
    country: "",
    nationality: "",
    address: "",
    phone: "",
    email: "",
    employment_status: initialStatus,
    details: {},
    income: "",
    other_income: "",
    monthly_charges: "",
    program: search.program && slugs.includes(search.program) ? search.program : (products[0]?.slug ?? "personal"),
    amount: search.amount ? String(search.amount) : "",
    currency: (SUPPORTED_CURRENCIES as readonly string[]).includes(search.currency ?? "")
      ? (search.currency as LoanCurrency)
      : "EUR",
    duration: search.duration ? String(search.duration) : "",
    purpose: "",
    speed: (PROCESSING_SPEEDS as readonly string[]).includes(search.speed ?? "")
      ? (search.speed as ProcessingSpeed)
      : "48h",
    files: {},
    bank_name: "",
    account_holder_name: "",
    iban_account_number: "",
    swift_bic: "",
    accept: false,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const status = form.employment_status || null;
  const requiredDocs = status ? DOCUMENTS_BY_STATUS[status] : [];
  const fee = getProcessingFee(form.program, form.speed);
  const durationRange = getLoanConfig(form.program).durationRange;

  const productLabel = useMemo(() => {
    const p = products.find((x) => x.slug === form.program);
    return p ? t(p.titleKey as TranslationKey) : form.program;
  }, [products, form.program, t]);

  const missingFields = useMemo(() => {
    const m: string[] = [];
    if (step === 1) {
      if (!form.first_name.trim()) m.push("first_name");
      if (!form.last_name.trim()) m.push("last_name");
      if (!form.birth_date) m.push("birth_date");
      if (!form.country.trim()) m.push("country_of_residence");
      if (!form.nationality.trim()) m.push("nationality");
      if (!form.address.trim()) m.push("address");
      if (!form.phone.trim()) m.push("phone");
      if (!form.email.trim()) m.push("email");
    }
    if (step === 2) {
      if (!form.employment_status) m.push("professionalStatus");
      if (!form.income.trim()) m.push("monthly_pension_or_income");
      if (!form.monthly_charges.trim()) m.push("monthly_charges");
    }
    if (step === 4) {
      for (const key of requiredDocs) {
        if (!form.files[key]) m.push(key);
      }
    }
    if (step === 5) {
      if (!form.bank_name.trim()) m.push("bank_name");
      if (!form.account_holder_name.trim()) m.push("account_holder_name");
      if (!form.iban_account_number.trim()) m.push("iban_account_number");
    }
    return m;
  }, [step, form, requiredDocs]);

  useEffect(() => {
    assistant?.setContext({
      page: "application",
      step,
      professionalStatus: form.employment_status || undefined,
      missingFields,
    });
  }, [assistant, step, form.employment_status, missingFields]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function validate(current: number): boolean {
    const e: Record<string, string> = {};
    const required = (k: keyof FormState, min = 2) => {
      const v = String(form[k] ?? "").trim();
      if (v.length < min) e[k as string] = t("form.required");
    };
    if (current === 1) {
      required("first_name");
      required("last_name");
      required("birth_date", 4);
      required("country");
      required("nationality");
      required("address", 4);
      required("phone", 6);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = t("form.required");
    }
    if (current === 2) {
      if (!form.employment_status) e.employment_status = t("form.required");
      if (!form.income.trim()) e.income = t("form.required");
      if (!form.monthly_charges.trim()) e.monthly_charges = t("form.required");
    }
    if (current === 3) {
      if (!form.program) e.program = t("form.required");
      if (!(Number(form.amount) > 0)) e.amount = t("form.required");
      const d = Number(form.duration);
      if (!(d >= durationRange.min && d <= durationRange.max)) e.duration = t("form.required");
      if (form.purpose.trim().length < 10) e.purpose = t("form.required");
    }
    if (current === 4) {
      for (const key of requiredDocs) {
        if (!form.files[key]) e[key] = t("form.required");
      }
    }
    if (current === 5) {
      required("bank_name");
      required("account_holder_name");
      required("iban_account_number", 6);
      if (!form.accept) e.accept = t("form.required");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 5) return;
    if (!validate(step)) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setPreviewing(false);
    setStep((s) => Math.max(1, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openPreview() {
    const e: Record<string, string> = {};
    if (form.bank_name.trim().length < 2) e.bank_name = t("form.required");
    if (form.account_holder_name.trim().length < 2) e.account_holder_name = t("form.required");
    if (form.iban_account_number.trim().length < 6) e.iban_account_number = t("form.required");
    setErrors(e);
    if (Object.keys(e).length) return;

    const bytes = await generateLoanContractPdf({
      firstName: form.first_name,
      lastName: form.last_name,
      birthDate: form.birth_date,
      nationality: form.nationality,
      address: form.address,
      phone: form.phone,
      email: form.email,
      programLabel: productLabel,
      purpose: form.purpose,
      amountLabel: formatMoney(Number(form.amount) || 0, form.currency, locale),
      currency: form.currency,
      durationMonths: form.duration,
      processingSpeedLabel: t(`speed.${form.speed}` as TranslationKey),
      processingFeeLabel: fee
        ? `${formatMoney(fee.amount, form.currency, locale)} — ${t("form.fee_status.pending")}`
        : t("form.fee_status.not_applicable"),
      bankName: form.bank_name,
      accountHolderName: form.account_holder_name,
      ibanAccountNumber: form.iban_account_number,
      swiftBic: form.swift_bic,
      confirmationDate: new Date().toISOString().slice(0, 10),
    });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    setPreviewUrl(URL.createObjectURL(blob));
    setPreviewing(true);
  }

  async function onSubmit() {
    if (!validate(5) || !previewing) return;
    setSubmitting(true);
    try {
      const files = [];
      for (const key of requiredDocs) {
        const file = form.files[key];
        if (!file) continue;
        files.push({
          key,
          filename: file.name,
          mime: file.type,
          contentBase64: await fileToBase64(file),
        });
      }
      const res = await submitApplication({
        data: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          birth_date: form.birth_date,
          country: form.country.trim(),
          nationality: form.nationality.trim(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          employment_status: form.employment_status as EmploymentStatus,
          employment_details: form.details,
          income: form.income,
          other_income: form.other_income,
          monthly_charges: form.monthly_charges,
          program: form.program,
          amount: Number(form.amount),
          currency: form.currency,
          duration_months: Number(form.duration),
          purpose: form.purpose.trim(),
          processing_speed: form.speed,
          processing_fee: fee ? fee.amount : null,
          language: locale,
          program_label: productLabel,
          speed_label: t(`speed.${form.speed}` as TranslationKey),
          bank_name: form.bank_name.trim(),
          account_holder_name: form.account_holder_name.trim(),
          iban_account_number: form.iban_account_number.trim(),
          swift_bic: form.swift_bic.trim(),
          files,
          contract_confirmed: true as const,
        },
      });
      navigate({ to: "/confirmation", search: { ref: res.reference } });
    } catch {
      toast.error(t("apply.error.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) =>
    errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <PageLayout>
      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("apply.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("apply.subtitle")}</p>

          <div className="mt-8">
            <p className="text-sm font-medium text-primary">
              {t("form.step").replace("{n}", String(step)).replace("{total}", String(TOTAL_STEPS))}
            </p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="surface-card mt-8 space-y-6 p-5 sm:p-8"
          >
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold">{t("form.step1.title")}</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("field.first_name")} error={err("first_name")}>
                    <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
                  </Field>
                  <Field label={t("field.last_name")} error={err("last_name")}>
                    <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
                  </Field>
                  <Field label={t("field.birth_date")} error={err("birth_date")}>
                    <Input type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} />
                  </Field>
                  <Field label={t("field.country")} error={err("country")}>
                    <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
                  </Field>
                  <Field label={t("field.nationality")} error={err("nationality")}>
                    <Input value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
                  </Field>
                  <Field label={t("field.phone")} error={err("phone")}>
                    <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label={t("field.address")} error={err("address")}>
                      <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label={t("field.email")} error={err("email")}>
                      <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold">{t("form.step2.title")}</h2>
                <Field label={t("field.status")} error={err("employment_status")}>
                  <Select
                    value={form.employment_status}
                    onValueChange={(v) => {
                      set("employment_status", v as EmploymentStatus);
                      set("details", {});
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{t(`status.${s}` as TranslationKey)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {status && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {DETAIL_FIELDS[status].map((f) => (
                      <Field key={f.id} label={t(f.label)}>
                        <Input
                          value={form.details[f.id] ?? ""}
                          onChange={(e) =>
                            set("details", { ...form.details, [f.id]: e.target.value })
                          }
                        />
                      </Field>
                    ))}
                    <Field label={t(INCOME_LABEL[status])} error={err("income")}>
                      <Input
                        inputMode="numeric"
                        value={form.income}
                        onChange={(e) => set("income", e.target.value)}
                      />
                    </Field>
                    <Field label={`${t("field.other_income")} (${t("form.optional")})`}>
                      <Input
                        inputMode="numeric"
                        value={form.other_income}
                        onChange={(e) => set("other_income", e.target.value)}
                      />
                    </Field>
                    <Field label={t("field.monthly_charges")} error={err("monthly_charges")}>
                      <Input
                        inputMode="numeric"
                        value={form.monthly_charges}
                        onChange={(e) => set("monthly_charges", e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold">{t("form.step3.title")}</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("field.loan_type")} error={err("program")}>
                    <Select value={form.program} onValueChange={(v) => set("program", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.slug} value={p.slug}>
                            {t(p.titleKey as TranslationKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("field.currency")}>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => set("currency", v as LoanCurrency)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("field.amount")} error={err("amount")}>
                    <Input
                      inputMode="numeric"
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                    />
                  </Field>
                  <Field
                    label={`${t("field.duration")} (${durationRange.min}–${durationRange.max})`}
                    error={err("duration")}
                  >
                    <Input
                      inputMode="numeric"
                      value={form.duration}
                      onChange={(e) => set("duration", e.target.value)}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label={t("field.speed")}>
                      <Select
                        value={form.speed}
                        onValueChange={(v) => set("speed", v as ProcessingSpeed)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROCESSING_SPEEDS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`speed.${s}` as TranslationKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label={t("field.purpose")} error={err("purpose")}>
                      <Textarea
                        rows={4}
                        value={form.purpose}
                        onChange={(e) => set("purpose", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
                {fee && (
                  <p className="rounded-2xl bg-primary/5 p-3.5 text-sm text-muted-foreground">
                    {t("form.fee_label")} :{" "}
                    <strong className="text-primary">
                      {formatMoney(fee.amount, form.currency, locale)}
                    </strong>{" "}
                    — {t("form.fee_status.pending")}
                  </p>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-xl font-semibold">{t("form.step4.title")}</h2>
                <p className="text-xs text-muted-foreground">{t("form.documents.hint")}</p>
                <ul className="space-y-4">
                  {requiredDocs.map((key) => (
                    <li key={key} className="rounded-2xl border border-border p-4">
                      <Label className="text-sm font-medium">{t(key as TranslationKey)}</Label>
                      <Input
                        className="mt-2"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          set("files", { ...form.files, [key]: e.target.files?.[0] ?? null })
                        }
                      />
                      {form.files[key] && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("form.documents.chosen")} : {form.files[key]?.name}
                        </p>
                      )}
                      {err(key)}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="text-xl font-semibold">{t("form.step5.title")}</h2>
                {!previewing ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={t("field.bank_name")} error={err("bank_name")}>
                      <Input
                        autoComplete="off"
                        value={form.bank_name}
                        onChange={(e) => set("bank_name", e.target.value)}
                      />
                    </Field>
                    <Field label={t("field.account_holder")} error={err("account_holder_name")}>
                      <Input
                        autoComplete="off"
                        value={form.account_holder_name}
                        onChange={(e) => set("account_holder_name", e.target.value)}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label={t("field.iban")} error={err("iban_account_number")}>
                        <Input
                          autoComplete="off"
                          value={form.iban_account_number}
                          onChange={(e) => set("iban_account_number", e.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label={`${t("field.swift")} (${t("form.optional")})`}>
                        <Input
                          autoComplete="off"
                          value={form.swift_bic}
                          onChange={(e) => set("swift_bic", e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {t("form.contract.badge")}
                      </p>
                      <h3 className="text-lg font-semibold">{t("form.contract.title")}</h3>
                    </div>
                    {previewUrl && (
                      <iframe
                        title={t("form.contract.title")}
                        src={previewUrl}
                        className="h-[70vh] w-full rounded-xl border border-border bg-muted"
                      />
                    )}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="accept"
                        checked={form.accept}
                        onCheckedChange={(c) => set("accept", c === true)}
                      />
                      <Label htmlFor="accept" className="text-sm font-normal leading-snug">
                        {t("form.contract.confirm")}
                      </Label>
                    </div>
                    {err("accept")}
                    <p className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {t("documents.note")}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={back}
                disabled={step === 1 || submitting}
              >
                {t("form.back")}
              </Button>
              {step < 5 && (
                <Button type="button" className="rounded-full" onClick={next}>
                  {t("form.next")}
                </Button>
              )}
              {step === 5 && !previewing && (
                <Button type="button" className="rounded-full" onClick={() => void openPreview()}>
                  {t("form.preview_contract")}
                </Button>
              )}
              {step === 5 && previewing && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setPreviewing(false)}
                  >
                    {t("form.contract.edit")}
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={() => void onSubmit()}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {t("form.contract.submit")}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}

function Field({
  label, error, children,
}: {
  label: string; error?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="block text-sm font-medium">
        <span>{label}</span>
        <div className="mt-1.5 font-normal">{children}</div>
      </Label>
      {error}
    </div>
  );
}
