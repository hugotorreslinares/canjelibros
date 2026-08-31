import { useState } from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

interface ThreadSummary {
  id: string;
  name: string;
  time: string;
  last: string;
  state: string;
  closed: boolean;
  active: boolean;
  open: () => void;
}

interface Message {
  text: string;
  time: string;
  side: "start" | "end";
  mine: boolean;
}

interface ChatViewProps {
  hasThreads: boolean;
  threads: ThreadSummary[];
  thread: { id: string; name: string; barrio: string; dist: number | null; deal: string; statusLine: string };
  messages: Message[];
  canConfirm: boolean;
  threadClosed: boolean;
  confirmNote: string;
  openRating: () => void;
  sendMessage: (text: string) => void;
}

export function ChatView({
  hasThreads,
  threads,
  thread,
  messages,
  canConfirm,
  threadClosed,
  confirmNote,
  openRating,
  sendMessage,
}: ChatViewProps) {
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft("");
  };

  if (!hasThreads) {
    return (
      <div className="flex-1 grid place-items-center px-6 py-16 text-center">
        <div className="max-w-[420px]">
          <h2 className="font-sans text-label uppercase text-muted-foreground">Mensajes</h2>
          <p className="font-serif text-title mt-2 mb-2.5">Todavía no tienes conversaciones</p>
          <p className="font-serif text-body text-foreground/85">
            Cuando propongas o recibas un intercambio, la conversación aparece aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-shell grid grid-cols-1 md:[grid-template-columns:330px_minmax(0,1fr)] flex-1 items-stretch">
      <div className="border-b md:border-b-0 md:border-r border-border px-6 py-6">
        <h2 className="font-sans text-label uppercase text-muted-foreground mb-3.5">Mensajes</h2>
        <div className="flex flex-col">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={t.open}
              aria-current={t.active ? "true" : undefined}
              className={`text-left border-none border-t border-border px-2.5 py-3.5 flex flex-col gap-1 ${
                t.active ? "bg-muted" : "bg-transparent"
              }`}
            >
              <span className="flex justify-between gap-2.5 items-baseline">
                <span className="font-serif text-subtitle">{t.name}</span>
                <span className="font-sans text-small text-muted-foreground">{t.time}</span>
              </span>
              <span className="font-serif text-small text-foreground/85 truncate">{t.last}</span>
              <span className={`font-sans text-small ${t.closed ? "text-muted-foreground" : "text-destructive"}`}>
                {t.state}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col px-5 sm:px-8 pt-6 pb-6">
        <div className="flex justify-between gap-5 items-start border-b border-border pb-4">
          <div>
            <h2 className="font-serif text-title m-0">{thread.name}</h2>
            <p className="font-sans text-small text-muted-foreground">
              {thread.barrio}
              {thread.dist !== null && <> · {thread.dist} km</>} · {thread.statusLine}
            </p>
          </div>
          <div className="text-right">
            <p className="font-sans text-label uppercase text-muted-foreground">Canje acordado</p>
            <p className="font-serif text-body max-w-[22em]">{thread.deal}</p>
          </div>
        </div>

        {/* role="log" y aria-relevant="additions" los pone el propio
            componente: anuncia el mensaje nuevo sin releer la conversación
            entera, sigue el borde vivo y suelta el seguimiento cuando el lector
            sube a releer. */}
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="h-[min(60vh,560px)]">
            <MessageScrollerViewport aria-label={`Conversación con ${thread.name}`}>
              <MessageScrollerContent className="gap-3 py-6">
                {messages.map((m, i) => (
                  <MessageScrollerItem key={i} messageId={`msg-${i}`} scrollAnchor={m.mine} className="flex flex-col">
                    <Bubble
                      align={m.side}
                      variant={m.mine ? "default" : "outline"}
                      className={
                        m.mine
                          ? "*:data-[slot=bubble-content]:bg-foreground *:data-[slot=bubble-content]:text-background"
                          : undefined
                      }
                    >
                      <BubbleContent className="font-serif text-body rounded-sm">
                        {m.text}
                        <div
                          className={`font-sans text-label mt-1.5 ${
                            m.mine ? "text-background/70" : "text-muted-foreground"
                          }`}
                        >
                          {m.time}
                        </div>
                      </BubbleContent>
                    </Bubble>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="end" size="icon" variant="outline" />
          </MessageScroller>
        </MessageScrollerProvider>

        <div className="border-t border-border pt-4 flex flex-col gap-3.5">
          <div className="flex gap-3 items-center flex-wrap">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Escribe un mensaje…"
              aria-label="Mensaje"
              className="flex-1 min-w-[240px] border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
            />
            {/* Enviar es lo que se hace cien veces: va lleno. Confirmar el canje
                transfiere los dos libros y no se deshace: va secundario. */}
            <Button onClick={send} disabled={!draft.trim()}>
              Enviar
            </Button>
          </div>
          {canConfirm && (
            <div className="flex gap-3.5 items-center flex-wrap">
              <Button variant="outline" onClick={openRating}>
                Marcar intercambio como realizado
              </Button>
              <span className="font-sans text-small text-muted-foreground">{confirmNote}</span>
            </div>
          )}
          {threadClosed && (
            <p className="font-sans text-small text-muted-foreground">
              Canje cerrado y calificado. Los libros ya cambiaron de estante.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
