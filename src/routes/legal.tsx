import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";

export const Route = createFileRoute("/legal")({ component: () => (
  <SimplePage title="Mentions légales">
    <div className="prose prose-slate mx-auto max-w-3xl">
      <p><strong>Éditeur :</strong> Golden Grant Hub International</p>
      <p><strong>Siège social :</strong> Paris, France</p>
      <p><strong>Directeur de la publication :</strong> Direction Générale</p>
      <p><strong>Hébergeur :</strong> Supabase / Lovable Cloud</p>
    </div>
  </SimplePage>
) });
