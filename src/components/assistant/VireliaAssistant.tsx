import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/lib/i18n/context";
import { chatWithAssistant } from "@/lib/assistant.functions";

export interface AssistantPageContext {
  page?: string;
  step?: number;
  professionalStatus?: string;
  missingFields?: string[];
  reference?: string;
  status?: string;
  public_messages?: string[];
  missing_public_requirements?: string;
}

const Ctx = createContext<{
  setContext: (c: AssistantPageContext) => void;
  context: AssistantPageContext;
} | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AssistantPageContext>({});
  const value = useMemo(() => ({ context, setContext }), [context]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssistantContext() {
  return useContext(Ctx);
}

const VISIBLE_ON = ["/eligibility", "/apply", "/suivi", "/confirmation"];

export function VireliaAssistant() {
  const { t, locale } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bag = useAssistantContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  const visible = VISIBLE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!visible) return null;

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setPending(true);
    try {
      const res = await chatWithAssistant({
        data: { message: text, locale, context: bag?.context ?? { page: pathname.slice(1) } },
      });
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t("assistant.error") }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">{t("assistant.title")}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("assistant.empty")}</p>
            )}
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "ml-8 bg-primary/10" : "mr-4 bg-muted"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("assistant.placeholder")}
            />
            <Button type="submit" size="icon" disabled={pending} className="shrink-0">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
      <Button
        type="button"
        className="rounded-full shadow-lg"
        onClick={() => setOpen((o) => !o)}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        {t("assistant.need_help")}
      </Button>
    </div>
  );
}
