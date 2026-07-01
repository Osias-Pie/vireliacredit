import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSelector() {
  const { locale, setLocale, locales } = useI18n();
  const current = locales.find((l) => l.code === locale) ?? locales[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-3 text-sm font-medium"
          aria-label="Language"
        >
          <Globe className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{current.flag}</span>
          <span className="uppercase">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLocale(l.code)}
            className="cursor-pointer justify-between"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>{l.flag}</span>
              {l.label}
            </span>
            {l.code === locale && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
