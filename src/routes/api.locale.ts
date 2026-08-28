import { createFileRoute } from "@tanstack/react-router";
import { resolveInitialLocale } from "@/lib/i18n/locale-core";

export const Route = createFileRoute("/api/locale")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const country =
          request.headers.get("x-vercel-ip-country") ||
          request.headers.get("x-country-code") ||
          null;
        const acceptLanguage = request.headers.get("accept-language") || null;
        const locale = resolveInitialLocale({ country, acceptLanguage, fallback: "fr" });

        return Response.json(
          {
            locale,
            country: country?.toUpperCase() || null,
            source: country ? "country" : acceptLanguage ? "browser" : "fallback",
          },
          {
            headers: {
              "Cache-Control": "private, no-store, max-age=0",
            },
          },
        );
      },
    },
  },
});
