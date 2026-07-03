import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Hero } from "@/components/sections/Hero";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { ProofsGallery } from "@/components/sections/ProofsGallery";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTABand } from "@/components/sections/CTABand";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageLayout>
      <Hero />
      <Stats />
      <ProgramsSection compact />
      <WhyChoose />
      <ProcessTimeline />
      <ProofsGallery />
      <Testimonials />
      <FAQSection compact />
      <CTABand />
    </PageLayout>
  );
}
