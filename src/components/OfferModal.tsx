import { divider, linkBtn, modalOverlay, modalPanel, primaryBtn, sectionLabel } from "@/lib/ui";

interface Offerable {
  t: string;
  a: string;
  cond: string;
  active: boolean;
  choose: () => void;
}

interface OfferModalProps {
  open: boolean;
  owner: string;
  bookTitle: string;
  bookAuthor: string;
  bookCond: string;
  bookCat: string;
  bookPlate: string;
  myOfferables: Offerable[];
  hint: string;
  close: () => void;
  send: () => void;
}

export function OfferModal({
  open,
  owner,
  bookTitle,
  bookAuthor,
  bookCond,
  bookCat,
  bookPlate,
  myOfferables,
  hint,
  close,
  send,
}: OfferModalProps) {
  if (!open) return null;
  return (
    <div className={modalOverlay} onClick={close}>
      <div className={`${modalPanel} max-w-[900px] px-[24px] sm:px-[38px] py-[32px]`} onClick={(e) => e.stopPropagation()}>
        <div className={sectionLabel}>Propuesta de canje con {owner}</div>
        <h2 className="text-[32px] sm:text-[36px] leading-[1.05] mt-[8px] mb-[22px]">Uno por uno</h2>
        <div className="grid grid-cols-1 sm:[grid-template-columns:1fr_46px_1fr] gap-[24px] items-start">
          <div>
            <div className={`${sectionLabel} mb-[12px]`}>Pides</div>
            <div className="grid grid-cols-[66px_minmax(0,1fr)] gap-[14px]">
              <div
                style={{ background: bookPlate }}
                className="h-[96px] rounded-[1px] p-[8px] flex items-end text-[11px] leading-[1.15] text-[#f8f4f4]"
              >
                {bookTitle}
              </div>
              <div>
                <div className="text-[21px] leading-[1.15]">{bookTitle}</div>
                <div className="text-[15px] text-[#605d5d]">{bookAuthor}</div>
                <div className="text-[14px] text-[#444141] mt-[6px]">
                  {bookCond} · {bookCat}
                </div>
              </div>
            </div>
          </div>
          <div className="text-[34px] text-[#0088b0] text-center pt-[34px] sm:pt-[34px]">⇄</div>
          <div>
            <div className={`${sectionLabel} mb-[12px]`}>Ofreces uno de los tuyos</div>
            <div className="grid gap-[2px]">
              {myOfferables.map((b, i) => (
                <button
                  key={i}
                  onClick={b.choose}
                  className={`text-left border rounded-[2px] px-[13px] py-[11px] grid gap-[2px] ${
                    b.active ? "bg-[#cbeeff] border-[#0088b0]" : "bg-transparent border-[#201e1d]/30"
                  }`}
                >
                  <span className="text-[18px]">{b.t}</span>
                  <span className="text-[14px] text-[#605d5d]">
                    {b.a} · {b.cond}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`flex gap-[16px] items-center mt-[30px] flex-wrap border-t ${divider} pt-[22px]`}>
          <button onClick={send} className={primaryBtn}>
            Enviar propuesta
          </button>
          <button onClick={close} className={linkBtn}>
            Cancelar
          </button>
          <span className="text-[15px] text-[#605d5d]">{hint}</span>
        </div>
      </div>
    </div>
  );
}
