import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "Euro", rate: 1 },
  { code: "USD", symbol: "$", label: "US Dollar", rate: 1.08 },
  { code: "GBP", symbol: "£", label: "British Pound", rate: 0.85 },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", rate: 0.96 },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar", rate: 1.47 },
  { code: "XOF", symbol: "FCFA", label: "Franc CFA", rate: 655.957 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (amountEUR: number) => string;
  currencies: typeof CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "app.currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("EUR");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && CURRENCIES.some((c) => c.code === stored)) setCurrencyState(stored);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, c);
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const cur = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
    return {
      currency,
      setCurrency,
      currencies: CURRENCIES,
      format: (amountEUR: number) => {
        const converted = amountEUR * cur.rate;
        const rounded = cur.code === "XOF" ? Math.round(converted / 1000) * 1000 : Math.round(converted);
        const formatted = new Intl.NumberFormat("fr-FR").format(rounded);
        return cur.code === "XOF" || cur.code === "CHF" || cur.code === "CAD"
          ? `${formatted} ${cur.symbol}`
          : `${cur.symbol}${formatted}`;
      },
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
