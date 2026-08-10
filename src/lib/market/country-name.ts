import type { MarketCode } from "@/config/markets";

/** Localised country name — no hardcoded translation table. */
export function countryName(code: MarketCode, locale: string): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}
