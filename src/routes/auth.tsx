import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Virelia runtime]", {
            stage: "ADMIN_AUTH",
            reason: "auth_page_session_read_failed",
            message: error.message?.slice(0, 240),
          });
          return;
        }
        if (!cancelled && data.session) navigate({ to: "/admin" });
      } catch (error) {
        // Keep the login form usable instead of sending configuration/runtime issues
        // to the global error boundary.
        console.error("[Virelia runtime]", {
          stage: "ADMIN_AUTH",
          reason: "auth_page_session_unavailable",
          message: error instanceof Error ? error.message.slice(0, 240) : "unknown",
        });
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("La session administrateur n’a pas pu être créée.");
        toast.success("Connexion réussie");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Compte créé. Un administrateur doit vous attribuer le rôle admin.");
        setMode("signin");
      }
    } catch (err: any) {
      console.error("[Virelia runtime]", {
        stage: "ADMIN_AUTH",
        reason: "sign_in_failed",
        message: typeof err?.message === "string" ? err.message.slice(0, 240) : "unknown",
      });
      toast.error(err?.message ?? "Erreur d'authentification");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageLayout>
      <div className="container-page py-20">
        <div className="mx-auto max-w-md">
          <div className="surface-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Espace administrateur</h1>
                <p className="text-sm text-muted-foreground">
                  {mode === "signin" ? "Connectez-vous à votre compte." : "Créer un compte."}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full rounded-full">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === "signin" ? "Se connecter" : "Créer le compte"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  Pas de compte ?{" "}
                  <button type="button" onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{" "}
                  <button type="button" onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">
                    Se connecter
                  </button>
                </>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">← Retour au site</Link>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
