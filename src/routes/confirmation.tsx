import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { ref } = Route.useSearch();
  return (
    <PageLayout>
      <section className="container-page py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl text-center"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Demande enregistrée
          </h1>
          <p className="mt-3 text-muted-foreground">
            Merci ! Votre dossier a bien été transmis à notre équipe.
          </p>

          {ref && (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Numéro de dossier
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">{ref}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Conservez cette référence — elle sera rappelée dans toutes nos communications.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-background p-5 text-left">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Le suivi de votre demande se fera <strong className="text-foreground">uniquement par e-mail</strong>.
              Un premier accusé de réception vous a été envoyé. Notre équipe reviendra vers vous
              sous 24 à 72 heures ouvrées.
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/programs">Voir les programmes</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}
