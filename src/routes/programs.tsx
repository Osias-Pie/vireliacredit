import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { CTABand } from "@/components/sections/CTABand";

export const Route = createFileRoute("/programs")({ component: ProgramsPage });

function ProgramsPage() {
  return (
    <PageLayout>
      <div className="border-b border-border bg-surface">
        <div className="container-page py-14 sm:py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Nos programmes</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Six programmes de financement conçus pour répondre à chaque étape de vie et d'activité,
            avec des conditions transparentes et un accompagnement dédié.
          </p>
        </div>
      </div>
      <ProgramsSection />
      <CTABand />
    </PageLayout>
  );
}
