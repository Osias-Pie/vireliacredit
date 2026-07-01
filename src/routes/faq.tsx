import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { FAQSection } from "@/components/sections/FAQSection";

export const Route = createFileRoute("/faq")({ component: () => (
  <SimplePage title="Questions fréquentes" subtitle="Retrouvez les réponses aux principales interrogations.">
    <FAQSection />
  </SimplePage>
) });
