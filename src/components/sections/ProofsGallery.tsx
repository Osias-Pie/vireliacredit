import { useState } from "react";
import { motion } from "framer-motion";
import { X, ZoomIn, MessageSquare, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import proof2 from "@/assets/proofs/proof2.png";
import proof3 from "@/assets/proofs/proof3.png";
import proof4 from "@/assets/proofs/proof4.png";
import proof5 from "@/assets/proofs/proof5.png";
import proof6 from "@/assets/proofs/proof6.png";
import proof7 from "@/assets/proofs/proof7.png";
import proof8 from "@/assets/proofs/proof8.png";

interface Proof {
  src: string;
  label: string;
  type: "chat" | "bank";
}

const PROOFS: Proof[] = [
  { src: proof2, label: "Marie — 50 000 € reçus", type: "chat" },
  { src: proof3, label: "Nathalie — 20 000 € reçus", type: "chat" },
  { src: proof4, label: "Lyana — 17 000 € reçus", type: "chat" },
  { src: proof5, label: "Cassandra — 10 000 € reçus", type: "chat" },
  { src: proof8, label: "Inès — 50 000 € reçus", type: "chat" },
  { src: proof6, label: "Virement bancaire — 50 370 €", type: "bank" },
  { src: proof7, label: "Virement bancaire — 20 000 €", type: "bank" },
];

export function ProofsGallery() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="preuves" className="bg-surface py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldBadge /> Preuves & Résultats
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ils nous ont fait confiance
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Conversations et virements réels partagés par nos bénéficiaires après l'obtention de leur aide.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PROOFS.map((p, i) => (
            <motion.button
              key={p.src}
              type="button"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
              aria-label={`Agrandir : ${p.label}`}
            >
              <img
                src={p.src}
                alt={p.label}
                loading="lazy"
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.08_258)]/85 via-transparent to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-left text-white">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.88_0.13_82)]">
                    {p.type === "chat" ? <MessageSquare className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                    {p.type === "chat" ? "Témoignage" : "Virement"}
                  </div>
                  <div className="mt-0.5 truncate text-xs font-semibold">{p.label}</div>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Prénoms modifiés pour préserver l'anonymat. Captures partagées avec l'accord des bénéficiaires.
        </p>
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">
            {open !== null ? PROOFS[open].label : "Preuve"}
          </DialogTitle>
          {open !== null && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="absolute -top-3 -right-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-foreground shadow-lg transition hover:scale-105"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={PROOFS[open].src}
                alt={PROOFS[open].label}
                className="mx-auto max-h-[85vh] w-auto rounded-2xl border border-border bg-card object-contain shadow-2xl"
              />
              <p className="mt-3 text-center text-sm font-medium text-white drop-shadow">
                {PROOFS[open].label}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ShieldBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
