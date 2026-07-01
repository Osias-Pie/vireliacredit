import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";

export const Route = createFileRoute("/process")({ component: () => (
  <SimplePage title="Notre processus" subtitle="Quatre étapes claires, du dépôt à la réponse.">
    <ProcessTimeline />
  </SimplePage>
) });
