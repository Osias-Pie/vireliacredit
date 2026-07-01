import type { ReactNode } from "react";
import { PageLayout } from "@/components/layout/PageLayout";

export function SimplePage({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <PageLayout>
      <div className="border-b border-border bg-surface">
        <div className="container-page py-14 sm:py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="container-page py-14 sm:py-20">{children}</div>
    </PageLayout>
  );
}
