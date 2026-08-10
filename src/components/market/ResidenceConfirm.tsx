import { useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { useMarket } from "@/lib/market/context";
import { MARKET_FLAGS, type MarketCode } from "@/config/markets";
import { countryName } from "@/lib/market/country-name";

/** Asks the applicant to confirm the country of residence before applying. */
export function ResidenceConfirm() {
  const { t, locale } = useI18n();
  const { markets, marketCode, confirmMarket, unsupportedCountry, detectedCountry } = useMarket();
  const [choice, setChoice] = useState<MarketCode>(marketCode);

  return (
    <div className="mx-auto max-w-xl">
      <div className="surface-card p-7 sm:p-9">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MapPin className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{t("market.confirm.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("market.confirm.text")}
        </p>

        {unsupportedCountry && detectedCountry && (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">{t("market.unsupported.title")}</p>
            <p className="mt-1 text-muted-foreground">{t("market.unsupported.text")}</p>
          </div>
        )}

        <div className="mt-6">
          <label className="text-sm font-medium">{t("market.confirm.select")}</label>
          <Select value={choice} onValueChange={(v) => setChoice(v as MarketCode)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {markets.map((m) => (
                <SelectItem key={m.code} value={m.code}>
                  {MARKET_FLAGS[m.code]} {countryName(m.code, locale)} — {m.currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="mt-6 w-full rounded-full" size="lg" onClick={() => confirmMarket(choice)}>
          {t("market.confirm.action")}
        </Button>

        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("process.no_guarantee")}
        </p>
      </div>
    </div>
  );
}
