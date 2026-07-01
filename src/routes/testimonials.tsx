import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { Testimonials } from "@/components/sections/Testimonials";

export const Route = createFileRoute("/testimonials")({ component: () => (
  <SimplePage title="Témoignages" subtitle="Ils nous ont fait confiance.">
    <Testimonials />
  </SimplePage>
) });
