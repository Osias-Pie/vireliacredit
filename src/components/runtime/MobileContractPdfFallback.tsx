import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { dossierValues } from "@/lib/i18n/application-values";

function isPhoneLikeViewport() {
  if (typeof window === "undefined") return false;
  const narrow = window.matchMedia?.("(max-width: 767px)")?.matches ?? false;
  const mobileUa = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent || "");
  return narrow || mobileUa;
}

/**
 * Mobile browsers are inconsistent when rendering blob: PDF URLs in iframes.
 * The application form still keeps its desktop inline iframe, while this runtime
 * guard exposes explicit user-gesture links to open/download the exact same blob
 * on phone-sized Android/iOS browsers.
 */
export function MobileContractPdfFallback() {
  const { activeLocale } = useI18n();
  const copy = dossierValues(activeLocale);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof URL === "undefined" || !isPhoneLikeViewport()) return;

    const originalCreateObjectURL = URL.createObjectURL.bind(URL);

    URL.createObjectURL = ((object: Blob | MediaSource) => {
      const url = originalCreateObjectURL(object);
      const isContractPreview =
        window.location.pathname === "/apply" &&
        typeof Blob !== "undefined" &&
        object instanceof Blob &&
        object.type === "application/pdf";

      if (isContractPreview) {
        setPdfUrl(url);
        console.info("[Virelia runtime]", { stage: "CONTRACT_PREVIEW", mode: "mobile_blob_fallback_ready" });
      }
      return url;
    }) as typeof URL.createObjectURL;

    return () => {
      URL.createObjectURL = originalCreateObjectURL;
    };
  }, []);

  if (!pdfUrl) return null;

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[90] rounded-2xl border border-[#D4AF37]/35 bg-[#0B2A5B] p-4 text-white shadow-2xl md:hidden"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#D4AF37]/30 bg-white/5">
          <FileText className="h-5 w-5 text-[#D4AF37]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{copy.preparingPdf.replace("…", "")}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#D4AF37]/45 px-3 text-center text-xs font-semibold text-[#D4AF37]"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {copy.openPdf}
            </a>
            <a
              href={pdfUrl}
              download={`Virelia-contract-preview-${activeLocale}.pdf`}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#D4AF37] px-3 text-center text-xs font-semibold text-[#0B2A5B]"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {copy.downloadPdf}
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPdfUrl(null)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/65 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
