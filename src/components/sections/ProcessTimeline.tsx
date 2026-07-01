import { motion } from "framer-motion";
import { CheckCircle2, ClipboardEdit, MailCheck, ScanSearch } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export function ProcessTimeline() {
  const { t } = useI18n();
  const steps = [
    { icon: CheckCircle2, title: t("process.step1.title"), text: t("process.step1.text") },
    { icon: ClipboardEdit, title: t("process.step2.title"), text: t("process.step2.text") },
    { icon: ScanSearch, title: t("process.step3.title"), text: t("process.step3.text") },
    { icon: MailCheck, title: t("process.step4.title"), text: t("process.step4.text") },
  ];

  return (
    <section className="container-page py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("process.title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("process.subtitle")}</p>
      </div>

      <ol className="relative mt-16 grid gap-8 md:grid-cols-4">
        <div
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 md:block"
          aria-hidden
        />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-background ring-2 ring-primary/20">
                <span className="grid h-full w-full place-items-center rounded-[inherit] bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">
                Étape {i + 1}
              </span>
              <h3 className="mt-1.5 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{s.text}</p>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
