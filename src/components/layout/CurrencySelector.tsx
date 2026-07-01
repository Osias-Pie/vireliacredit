import { Check, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/lib/currency/context";

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();
  const current = currencies.find((c) => c.code === currency) ?? currencies[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3 text-sm font-medium"
          aria-label="Currency"
        >
          <CircleDollarSign className="h-4 w-4" aria-hidden />
          <span>{current.symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className="cursor-pointer justify-between"
          >
            <span>
              <span className="mr-2 font-semibold">{c.symbol}</span>
              {c.label}
            </span>
            {c.code === currency && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
