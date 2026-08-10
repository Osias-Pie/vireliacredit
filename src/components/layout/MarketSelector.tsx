import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarket } from "@/lib/market/context";
import { MARKET_FLAGS } from "@/config/markets";
import { useI18n } from "@/lib/i18n/context";
import { countryName } from "@/lib/market/country-name";

/** Country selector — fully independent from the language selector. */
export function MarketSelector() {
  const { marketCode, markets, setMarket } = useMarket();
  const { t, locale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3 text-sm font-medium"
          aria-label={t("market.country")}
        >
          <MapPin className="h-4 w-4" aria-hidden />
          <span aria-hidden>{MARKET_FLAGS[marketCode]}</span>
          <span className="uppercase">{marketCode}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t("market.country")}
        </DropdownMenuLabel>
        {markets.map((m) => (
          <DropdownMenuItem
            key={m.code}
            onClick={() => setMarket(m.code)}
            className="cursor-pointer justify-between"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>{MARKET_FLAGS[m.code]}</span>
              {countryName(m.code, locale)}
              <span className="text-xs text-muted-foreground">{m.currency}</span>
            </span>
            {m.code === marketCode && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
