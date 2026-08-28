import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveInitialLocale } from "./locale-core";

export const detectInitialLocale = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const country =
    request?.headers.get("x-vercel-ip-country") ||
    request?.headers.get("x-country-code") ||
    null;
  const acceptLanguage = request?.headers.get("accept-language") || null;
  const locale = resolveInitialLocale({ country, acceptLanguage, fallback: "fr" });

  return {
    locale,
    country: country?.toUpperCase() || null,
    source: country ? ("country" as const) : acceptLanguage ? ("browser" as const) : ("fallback" as const),
  };
});
