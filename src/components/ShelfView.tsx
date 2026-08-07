import { condPill, divider, sectionLabel, smallOutlineBtn, tagPill } from "@/lib/ui";

interface ShelfBook {
  t: string;
  a: string;
  cat: string;
  cond: string;
  plate: string;
  short: string;
  state: string;
  stateColor: string;
}

interface ShelfViewProps {
  myBooks: ShelfBook[];
  myStars: string;
  myRating: number;
  myTrades: number;
  usedSlots: number;
  totalSlots: number;
  slotPips: { filled: boolean }[];
  slotNote: string;
  addSlotLabel: string;
  hasPending: boolean;
  nextCupoNote: string;
  goPublish: () => void;
  goChat: () => void;
}

export function ShelfView({
  myBooks,
  myStars,
  myRating,
  myTrades,
  usedSlots,
  totalSlots,
  slotPips,
  slotNote,
  addSlotLabel,
  hasPending,
  nextCupoNote,
  goPublish,
  goChat,
}: ShelfViewProps) {
  return (
    <div className="px-[24px] sm:px-[40px] pt-[34px] pb-[60px] max-w-[1180px]">
      <div className={sectionLabel}>Mi estante</div>
      <h1 className="text-[40px] sm:text-[52px] leading-none mt-[8px] mb-0">Camila Ordóñez</h1>
      <div className="text-[17px] text-[#444141] mt-[8px]">
        Chapinero Alto · {myStars} {myRating} de 5 · desde marzo de 2026
      </div>
      <div className="h-[5px] bg-[#201e1d] mt-[20px] mb-[2px]" />
      <div className="h-px bg-[#201e1d] mb-[30px]" />

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))] gap-[34px] mb-[44px]">
        <div>
          <div className={`${sectionLabel} mb-[8px]`}>Cupos</div>
          <div className="text-[60px] leading-none text-[#0088b0]">
            {usedSlots}
            <span className="text-[#201e1d] text-[30px]">/{totalSlots}</span>
          </div>
          <div className="flex gap-[5px] mt-[12px]">
            {slotPips.map((p, i) => (
              <div
                key={i}
                className={`w-[26px] h-[12px] rounded-[1px] border ${
                  p.filled ? "bg-[#0088b0] border-[#0088b0]" : "bg-transparent border-[#201e1d]/30"
                }`}
              />
            ))}
          </div>
          <div className="text-[15px] text-[#444141] mt-[12px] max-w-[22em]">{slotNote}</div>
        </div>
        <div>
          <div className={`${sectionLabel} mb-[8px]`}>Intercambios</div>
          <div className="text-[60px] leading-none">{myTrades}</div>
          <div className="text-[15px] text-[#444141] mt-[12px] max-w-[22em]">
            Cada intercambio confirmado por las dos partes abre un cupo permanente.
          </div>
        </div>
        <div>
          <div className={`${sectionLabel} mb-[8px]`}>Racha</div>
          <div className="text-[60px] leading-none text-[#d6006c]">4</div>
          <div className="text-[15px] text-[#444141] mt-[12px] max-w-[22em]">
            Semanas seguidas con al menos un canje. Dos más y llegas a «Lector de barrio».
          </div>
        </div>
        <div>
          <div className={`${sectionLabel} mb-[8px]`}>Siguiente cupo</div>
          <div className="text-[22px] leading-[1.3] max-w-[15em]">{nextCupoNote}</div>
          {hasPending && (
            <button onClick={goChat} className={`${smallOutlineBtn} mt-[14px]`}>
              Ver conversación
            </button>
          )}
        </div>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] gap-[26px]">
        {myBooks.map((b, i) => (
          <div key={i} className={`border-t ${divider} pt-[16px] grid gap-[8px]`}>
            <div
              style={{ background: b.plate }}
              className="h-[150px] rounded-[1px] p-[12px] flex items-end text-[14px] leading-[1.2] text-[#f8f4f4]"
            >
              {b.short}
            </div>
            <div className="text-[21px] leading-[1.15]">{b.t}</div>
            <div className="text-[15px] text-[#605d5d]">{b.a}</div>
            <div className="flex gap-[8px] flex-wrap">
              <span className={tagPill}>{b.cat}</span>
              <span className={condPill}>{b.cond}</span>
            </div>
            <div style={{ color: b.stateColor }} className="text-[14px]">
              {b.state}
            </div>
          </div>
        ))}
        <button
          onClick={goPublish}
          className="border border-dashed border-[#201e1d]/40 bg-transparent rounded-[2px] min-h-[240px] grid place-items-center gap-[6px] p-[20px] text-[19px] text-[#444141] hover:bg-[#eae7e7]"
        >
          <span className="text-[34px] text-[#0088b0]">+</span>
          <span>{addSlotLabel}</span>
        </button>
      </div>
    </div>
  );
}
