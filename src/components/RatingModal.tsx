import { chip, linkBtn, modalOverlay, modalPanel, primaryBtn, sectionLabel } from "@/lib/ui";

interface StarPick {
  filled: boolean;
  pick: () => void;
}

interface TagOption {
  label: string;
  active: boolean;
  toggle: () => void;
}

interface RatingModalProps {
  open: boolean;
  name: string;
  starPicks: StarPick[];
  ratingTags: TagOption[];
  submit: () => void;
  close: () => void;
}

export function RatingModal({ open, name, starPicks, ratingTags, submit, close }: RatingModalProps) {
  if (!open) return null;
  return (
    <div className={modalOverlay} onClick={close}>
      <div className={`${modalPanel} max-w-[560px] px-[24px] sm:px-[38px] py-[32px]`} onClick={(e) => e.stopPropagation()}>
        <div className={sectionLabel}>Canje cerrado</div>
        <h2 className="text-[30px] sm:text-[34px] leading-[1.05] mt-[8px] mb-[10px]">¿Cómo te fue con {name}?</h2>
        <p className="text-[17px] leading-[1.5] text-[#444141] mb-[22px]">
          Solo pueden calificarse las personas que completaron un intercambio. Tu nota es pública en su perfil.
        </p>
        <div className="flex gap-[10px] mb-[20px]">
          {starPicks.map((s, i) => (
            <button
              key={i}
              onClick={s.pick}
              className={`bg-transparent border-none p-0 text-[42px] leading-none ${s.filled ? "text-[#d6006c]" : "text-[#d7d3d3]"}`}
            >
              ★
            </button>
          ))}
        </div>
        <div className="flex gap-[8px] flex-wrap mb-[24px]">
          {ratingTags.map((t) => (
            <button key={t.label} onClick={t.toggle} className={chip(t.active)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-[16px] items-center flex-wrap">
          <button onClick={submit} className={primaryBtn}>
            Enviar calificación
          </button>
          <button onClick={close} className={linkBtn}>
            Después
          </button>
        </div>
      </div>
    </div>
  );
}
