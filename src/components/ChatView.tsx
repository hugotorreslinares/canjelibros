import { useState } from "react";
import { divider, input, outlineBtn, sectionLabel } from "@/lib/ui";

interface ThreadSummary {
  id: string;
  name: string;
  time: string;
  last: string;
  state: string;
  stateColor: string;
  active: boolean;
  open: () => void;
}

interface Message {
  text: string;
  time: string;
  side: "start" | "end";
  bg: string;
  fg: string;
  metaColor: string;
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
      <div className="flex-1 grid place-items-center px-[24px] py-[60px] text-center">
        <div className="max-w-[420px]">
          <div className={sectionLabel}>Mensajes</div>
          <h2 className="text-[28px] leading-[1.2] mt-[8px] mb-[10px]">Todavía no tienes conversaciones</h2>
          <p className="text-[16px] leading-[1.5] text-[#444141]">
            Cuando propongas o recibas un intercambio, la conversación aparece aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:[grid-template-columns:330px_minmax(0,1fr)] flex-1 items-stretch">
      <div className="border-b md:border-b-0 md:border-r border-[#201e1d]/16 px-[24px] py-[26px]">
        <div className={`${sectionLabel} mb-[14px]`}>Mensajes</div>
        <div className="grid gap-[2px]">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={t.open}
              className={`text-left border-none border-t ${divider} px-[10px] py-[15px] grid gap-[3px] ${
                t.active ? "bg-[#eae7e7]" : "bg-transparent"
              }`}
            >
              <div className="flex justify-between gap-[10px] items-baseline">
                <span className="text-[19px]">{t.name}</span>
                <span className="text-[13px] text-[#605d5d]">{t.time}</span>
              </div>
              <div className="text-[15px] text-[#444141] overflow-hidden text-ellipsis whitespace-nowrap">{t.last}</div>
              <div style={{ color: t.stateColor }} className="text-[13px]">
                {t.state}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col px-[20px] sm:px-[34px] pt-[24px] pb-[26px]">
        <div className={`flex justify-between gap-[20px] items-start border-b ${divider} pb-[16px]`}>
          <div>
            <div className="text-[27px]">{thread.name}</div>
            <div className="text-[15px] text-[#605d5d]">
              {thread.barrio}
              {thread.dist !== null && <> · {thread.dist} km</>} · {thread.statusLine}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[14px] text-[#605d5d]">Canje acordado</div>
            <div className="text-[17px] max-w-[22em]">{thread.deal}</div>
          </div>
        </div>
        <div className="flex-1 grid gap-[16px] content-start py-[24px] overflow-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              style={{ background: m.bg, color: m.fg, justifySelf: m.side }}
              className="max-w-[62%] border border-[#201e1d]/16 rounded-[2px] px-[15px] py-[12px] text-[17px] leading-[1.45]"
            >
              {m.text}
              <div style={{ color: m.metaColor }} className="text-[12px] mt-[6px]">
                {m.time}
              </div>
            </div>
          ))}
        </div>
        <div className={`border-t ${divider} pt-[18px] grid gap-[14px]`}>
          <div className="flex gap-[12px] items-center flex-wrap">
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
              className={`${input} flex-1 min-w-[240px]`}
            />
            <button onClick={send} disabled={!draft.trim()} className={outlineBtn}>
              Enviar
            </button>
          </div>
          {canConfirm && (
            <div className="flex gap-[14px] items-center flex-wrap">
              <button
                onClick={openRating}
                className="bg-[#d6006c] text-white border-none rounded-[2px] px-[22px] py-[12px] text-[17px] transition-colors hover:bg-[#d82071] active:bg-[#aa0b56]"
              >
                Marcar intercambio como realizado
              </button>
              <span className="text-[15px] text-[#605d5d]">{confirmNote}</span>
            </div>
          )}
          {threadClosed && (
            <div className="text-[16px] text-[#605d5d]">Canje cerrado y calificado. Los libros ya cambiaron de estante.</div>
          )}
        </div>
      </div>
    </div>
  );
}
