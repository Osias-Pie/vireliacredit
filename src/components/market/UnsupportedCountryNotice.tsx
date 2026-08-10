import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useMarket } from "@/lib/market/context";
import { MARKET_FLAGS } from "@/config/markets";
import { countryName } from "@/lib/market/country-name";

/** Shown when the detected IP country is not served by Virelia Crédit. */
export function UnsupportedCountryNotice() {
  const { t, locale } = useI18n();
  const { unsupportedCountry, detectedCountry, markets } = useMarket();
  if (!unsupportedCountry) return null;

  return (
    <div className="border-b border-destructive/25 bg-destructive/5">
      <div className="container-page flex flex-col gap-3 py-5 sm:flex-row sm:items-start">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-destructive">
            {t("market.unsupported.title")}
            {detectedCountry ? ` (${detectedCountry})` : ""}
          </p>
          <p className="mt-1 text-muted-foreground">{t("market.unsupported.text")}</p>
          <p className="mt-2 text-muted-foreground">
            {t("market.unsupported.list")}{" "}
            {markets.map((m) => `${MARKET_FLAGS[m.code]} ${countryName(m.code, locale)}`).join(" · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
