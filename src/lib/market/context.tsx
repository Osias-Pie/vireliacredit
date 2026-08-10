import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MARKETS,
  MARKET_CODES,
  isSupportedMarket,
  pickLanguageForMarket,
  type MarketCode,
  type MarketConfig,
} from "@/config/markets";
import { useI18n } from "@/lib/i18n/context";
import { useCurrency, type CurrencyCode as AppCurrency } from "@/lib/currency/context";

const MARKET_KEY = "app.market";
const CONFIRMED_KEY = "app.market.confirmed";
const LOCALE_KEY = "app.locale";

/** Fallback used only for display while nothing is known yet. */
const FALLBACK: MarketCode = "FR";

interface MarketContextValue {
  /** Market currently used for display. Never null so the UI stays renderable. */
  market: MarketConfig;
  marketCode: MarketCode;
  /** True while the IP lookup is running. */
  detecting: boolean;
  /** Raw ISO country code returned by the IP lookup (may be unsupported). */
  detectedCountry: string | null;
  /** True when the detected country is not served by Virelia Crédit. */
  unsupportedCountry: boolean;
  /** The user explicitly confirmed his country of residence. */
  confirmed: boolean;
  setMarket: (code: MarketCode, opts?: { confirm?: boolean }) => void;
  confirmMarket: (code: MarketCode) => void;
  markets: MarketConfig[];
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const { setLocale } = useI18n();
  const { setCurrency } = useCurrency();

  const [marketCode, setMarketCode] = useState<MarketCode>(FALLBACK);
  const [detecting, setDetecting] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [unsupportedCountry, setUnsupportedCountry] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  /** Apply currency + (optionally) language of a market. */
  const applyMarket = (code: MarketCode, alignLanguage: boolean) => {
    const m = MARKETS[code];
    setCurrency(m.currency as AppCurrency);
    if (alignLanguage && typeof window !== "undefined") {
      const stored = window.localStorage.getItem(LOCALE_KEY);
      if (!stored) {
        setLocale(pickLanguageForMarket(m, window.navigator.languages ?? []));
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const stored = window.localStorage.getItem(MARKET_KEY);
    if (isSupportedMarket(stored)) {
      const code = stored.toUpperCase() as MarketCode;
      setMarketCode(code);
      setConfirmed(window.localStorage.getItem(CONFIRMED_KEY) === "1");
      applyMarket(code, true);
      setDetecting(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("ip_lookup_failed");
        const json = (await res.json()) as { country_code?: string };
        const country = (json.country_code ?? "").toUpperCase();
        if (cancelled) return;
        setDetectedCountry(country || null);
        if (isSupportedMarket(country)) {
          const code = country as MarketCode;
          setMarketCode(code);
          window.localStorage.setItem(MARKET_KEY, code);
          applyMarket(code, true);
        } else if (country) {
          setUnsupportedCountry(true);
        }
      } catch {
        /* detection is best-effort: keep the fallback market */
      } finally {
        if (!cancelled) setDetecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMarket: MarketContextValue["setMarket"] = (code, opts) => {
    setMarketCode(code);
    setUnsupportedCountry(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MARKET_KEY, code);
      if (opts?.confirm) window.localStorage.setItem(CONFIRMED_KEY, "1");
    }
    if (opts?.confirm) setConfirmed(true);
    applyMarket(code, false);
  };

  const value = useMemo<MarketContextValue>(
    () => ({
      market: MARKETS[marketCode],
      marketCode,
      detecting,
      detectedCountry,
      unsupportedCountry,
      confirmed,
      setMarket,
      confirmMarket: (code: MarketCode) => setMarket(code, { confirm: true }),
      markets: MARKET_CODES.map((c) => MARKETS[c]).filter((m) => m.enabled),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marketCode, detecting, detectedCountry, unsupportedCountry, confirmed],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside MarketProvider");
  return ctx;
}
