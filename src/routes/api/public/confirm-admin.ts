import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/confirm-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: list, error: le } = await supabaseAdmin.auth.admin.listUsers();
        if (le) return new Response(le.message, { status: 500 });
        const user = list.users.find((u) => u.email === "enestic7@gmail.com");
        if (!user) return new Response("not found", { status: 404 });
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });
        if (error) return new Response(error.message, { status: 500 });
        return new Response(JSON.stringify({ ok: true, id: user.id }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
