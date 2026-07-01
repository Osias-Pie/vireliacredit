import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/data/content";
import { useI18n } from "@/lib/i18n/context";

interface Props { compact?: boolean }

export function FAQSection({ compact = false }: Props) {
  const { t } = useI18n();
  const items = compact ? FAQS.slice(0, 6) : FAQS;
  return (
    <section className="container-page py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("faq.title")}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{t("faq.subtitle")}</p>
      </div>
      <div className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="surface-card border-none px-5 py-1"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
