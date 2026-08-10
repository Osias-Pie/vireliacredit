import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n/context";
import { BRAND, CONTACT } from "@/config/brand";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Navigation</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/programs" className="hover:text-primary">{t("nav.solutions")}</Link></li>
              <li><Link to="/about" className="hover:text-primary">{t("nav.about")}</Link></li>
              <li><Link to="/process" className="hover:text-primary">{t("nav.process")}</Link></li>
              <li><Link to="/eligibility" className="hover:text-primary">{t("nav.eligibility")}</Link></li>
              <li><Link to="/faq" className="hover:text-primary">{t("nav.faq")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary">{t("nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{CONTACT.email ?? t("contact.pending")}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{CONTACT.phone ?? t("contact.pending")}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{CONTACT.address ?? t("contact.pending")}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Légal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/legal" className="hover:text-primary">{t("footer.legal")}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="hover:text-primary">{t("footer.terms")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {year} {BRAND.name}. {t("footer.rights")}</span>
          <span>{t("footer.warning")}</span>
        </div>
      </div>
    </footer>
  );
}
