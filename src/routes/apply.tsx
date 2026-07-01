import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
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
import { PROGRAMS } from "@/lib/data/programs";
import { CURRENCIES } from "@/lib/currency/context";
import { useI18n } from "@/lib/i18n/context";
import { submitApplication } from "@/lib/applications.functions";

const schema = z.object({
  last_name: z.string().trim().min(2, "Nom requis"),
  first_name: z.string().trim().min(2, "Prénom requis"),
  gender: z.enum(["male", "female", "other"]),
  birth_date: z.string().min(4, "Date requise"),
  country: z.string().trim().min(2, "Pays requis"),
  city: z.string().trim().min(2, "Ville requise"),
  address: z.string().trim().min(4, "Adresse requise"),
  phone: z.string().trim().min(6, "Téléphone requis"),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide"),
  profession: z.string().trim().min(2, "Profession requise"),
  company: z.string().trim().optional().or(z.literal("")),
  income: z.string().trim().optional().or(z.literal("")),
  program: z.string().trim().min(1, "Sélectionnez un programme"),
  amount: z.coerce.number().positive("Montant invalide"),
  currency: z.string().min(2),
  description: z.string().trim().min(20, "Décrivez votre projet (min 20 caractères)"),
  goals: z.string().trim().min(10, "Précisez vos objectifs"),
  accept: z.literal(true, { message: "Vous devez accepter les conditions" }),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/apply")({
  validateSearch: (s: Record<string, unknown>) => ({
    program: typeof s.program === "string" ? s.program : undefined,
  }),
  component: ApplyPage,
});

function ApplyPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ from: "/apply" });
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      last_name: "", first_name: "", gender: "male", birth_date: "",
      country: "", city: "", address: "", phone: "", whatsapp: "", email: "",
      profession: "", company: "", income: "",
      program: search.program ?? "", amount: 0, currency: "EUR",
      description: "", goals: "", accept: undefined as unknown as true,
    },
  });

  useEffect(() => {
    if (search.program) form.setValue("program", search.program);
  }, [search.program, form]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { accept: _accept, ...payload } = values;
      const result = await submitApplication({
        data: {
          ...payload,
          income: payload.income ? Number(payload.income) : null,
          language: lang,
        },
      });
      toast.success("Demande envoyée avec succès");
      navigate({
        to: "/confirmation",
        search: { ref: result.reference } as never,
      });
    } catch (e) {
      console.error(e);
      toast.error("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const err = form.formState.errors;

  return (
    <PageLayout>
      <section className="container-page py-14 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Formulaire sécurisé
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("apply.title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("apply.subtitle")}</p>
        </motion.div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto mt-12 max-w-3xl space-y-8"
          noValidate
        >
          <FormCard title={t("apply.personal")}>
            <Grid>
              <Field label="Nom" error={err.last_name?.message}>
                <Input {...form.register("last_name")} />
              </Field>
              <Field label="Prénom" error={err.first_name?.message}>
                <Input {...form.register("first_name")} />
              </Field>
              <Field label="Sexe" error={err.gender?.message}>
                <Select
                  value={form.watch("gender")}
                  onValueChange={(v) => form.setValue("gender", v as FormValues["gender"])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date de naissance" error={err.birth_date?.message}>
                <Input type="date" {...form.register("birth_date")} />
              </Field>
              <Field label="Pays" error={err.country?.message}>
                <Input {...form.register("country")} />
              </Field>
              <Field label="Ville" error={err.city?.message}>
                <Input {...form.register("city")} />
              </Field>
              <Field label="Adresse" className="sm:col-span-2" error={err.address?.message}>
                <Input {...form.register("address")} />
              </Field>
              <Field label="Téléphone" error={err.phone?.message}>
                <Input type="tel" {...form.register("phone")} />
              </Field>
              <Field label="WhatsApp (optionnel)" error={err.whatsapp?.message}>
                <Input type="tel" {...form.register("whatsapp")} />
              </Field>
              <Field label="Email" className="sm:col-span-2" error={err.email?.message}>
                <Input type="email" {...form.register("email")} />
              </Field>
            </Grid>
          </FormCard>

          <FormCard title={t("apply.professional")}>
            <Grid>
              <Field label="Profession" error={err.profession?.message}>
                <Input {...form.register("profession")} />
              </Field>
              <Field label="Entreprise (optionnel)" error={err.company?.message}>
                <Input {...form.register("company")} />
              </Field>
              <Field label="Revenus mensuels approximatifs" className="sm:col-span-2" error={err.income?.message}>
                <Input type="number" inputMode="decimal" placeholder="Ex: 2500" {...form.register("income")} />
              </Field>
            </Grid>
          </FormCard>

          <FormCard title={t("apply.project")}>
            <Grid>
              <Field label="Programme choisi" error={err.program?.message}>
                <Select
                  value={form.watch("program")}
                  onValueChange={(v) => form.setValue("program", v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Devise" error={err.currency?.message}>
                <Select
                  value={form.watch("currency")}
                  onValueChange={(v) => form.setValue("currency", v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} — {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Montant demandé" className="sm:col-span-2" error={err.amount?.message}>
                <Input type="number" inputMode="decimal" {...form.register("amount")} />
              </Field>
              <Field label="Description du projet" className="sm:col-span-2" error={err.description?.message}>
                <Textarea rows={4} {...form.register("description")} />
              </Field>
              <Field label="Objectifs" className="sm:col-span-2" error={err.goals?.message}>
                <Textarea rows={3} {...form.register("goals")} />
              </Field>
            </Grid>
          </FormCard>

          <div className="surface-card p-6">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={!!form.watch("accept")}
                onCheckedChange={(v) =>
                  form.setValue("accept", (v === true) as true, { shouldValidate: true })
                }
                className="mt-0.5"
              />
              <span className="text-muted-foreground">
                J'accepte que mes données soient traitées conformément à la{" "}
                <a href="/privacy" className="text-primary underline-offset-2 hover:underline">
                  politique de confidentialité
                </a>
                .
              </span>
            </label>
            {err.accept?.message && (
              <p className="mt-2 text-xs text-destructive">{err.accept.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="h-12 min-w-52 rounded-full px-6 shadow-[var(--shadow-elegant)]"
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours…</>
              ) : (
                "Envoyer ma demande"
              )}
            </Button>
          </div>
        </form>
      </section>
    </PageLayout>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6 sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({
  label, error, className, children,
}: {
  label: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
