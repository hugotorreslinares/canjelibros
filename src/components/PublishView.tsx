import { chip, condPill, divider, input, linkBtn, primaryBtn, sectionLabel, smallOutlineBtn, tagPill } from "@/lib/ui";
import { BookCover } from "./BookCover";

interface Chip {
  label: string;
  active: boolean;
  pick: () => void;
}

interface PublishViewProps {
  isEditing: boolean;
  nextSlot: number;
  totalSlots: number;
  form: { t: string; a: string; desc: string; cond: string; cat: string };
  setTitle: (v: string) => void;
  setAuthor: (v: string) => void;
  setDesc: (v: string) => void;
  condChips: Chip[];
  catChips: Chip[];
  pickCover: (file: File) => void;
  clearCover: () => void;
  previewCover: string | null;
  previewPlate: string;
  previewShort: string;
  previewTitle: string;
  previewAuthor: string;
  slotNote: string;
  submitBook: () => void;
  cancel: () => void;
}

export function PublishView({
  isEditing,
  nextSlot,
  totalSlots,
  form,
  setTitle,
  setAuthor,
  setDesc,
  condChips,
  catChips,
  pickCover,
  clearCover,
  previewCover,
  previewPlate,
  previewShort,
  previewTitle,
  previewAuthor,
  slotNote,
  submitBook,
  cancel,
}: PublishViewProps) {
  return (
    <div className="px-[24px] sm:px-[40px] pt-[34px] pb-[70px] grid grid-cols-1 lg:[grid-template-columns:minmax(0,1fr)_320px] gap-[60px] max-w-[1180px]">
      <div>
        <div className={sectionLabel}>
          {isEditing ? "Editando publicación" : `Nueva publicación · cupo ${nextSlot} de ${totalSlots}`}
        </div>
        <h1 className="text-[36px] sm:text-[48px] leading-[1.02] mt-[8px] mb-[26px]">
          {isEditing ? "Edita los datos de tu libro" : "Pon un libro en circulación"}
        </h1>
        <div className="grid gap-[24px] max-w-[640px]">
          <label className="grid gap-[6px]">
            <span className="text-[15px] text-[#444141]">Título</span>
            <input value={form.t} onChange={(e) => setTitle(e.target.value)} placeholder="Rayuela" className={input} />
          </label>
          <label className="grid gap-[6px]">
            <span className="text-[15px] text-[#444141]">Autor</span>
            <input value={form.a} onChange={(e) => setAuthor(e.target.value)} placeholder="Julio Cortázar" className={input} />
          </label>
          <label className="grid gap-[6px]">
            <span className="text-[15px] text-[#444141]">Descripción · por qué vale la pena pasarlo</span>
            <textarea
              value={form.desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="Edición de bolsillo, subrayada a lápiz en los capítulos del club de la serpiente."
              className={`${input} resize-y`}
            />
          </label>
          <div className="grid gap-[8px]">
            <span className="text-[15px] text-[#444141]">Estado</span>
            <div className="flex flex-wrap gap-[8px]">
              {condChips.map((c) => (
                <button key={c.label} onClick={c.pick} className={chip(c.active)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-[8px]">
            <span className="text-[15px] text-[#444141]">Categoría</span>
            <div className="flex flex-wrap gap-[8px]">
              {catChips.map((c) => (
                <button key={c.label} onClick={c.pick} className={chip(c.active)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-[8px]">
            <span className="text-[15px] text-[#444141]">Portada (opcional)</span>
            <div className="border border-dashed border-[#201e1d]/40 rounded-[2px] p-[22px] grid gap-[12px] justify-items-center text-center">
              <p className="text-[16px] leading-[1.5] text-[#605d5d] max-w-[34em]">
                Sube una foto <strong className="font-semibold">tomada por ti</strong> del ejemplar que vas a
                intercambiar. Si no hay foto, imprimimos el título como portada tipográfica.
              </p>
              <label className={`${smallOutlineBtn} cursor-pointer`}>
                {previewCover ? "Cambiar foto" : "Elegir foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    // Clearing the input lets the same file be re-picked after an error.
                    e.target.value = "";
                    if (file) pickCover(file);
                  }}
                />
              </label>
              {previewCover && (
                <button onClick={clearCover} className={linkBtn}>
                  Quitar foto
                </button>
              )}
              <p className="text-[14px] leading-[1.45] text-[#605d5d] max-w-[34em]">
                No subas la imagen de portada que encontraste en internet: es del editor o del ilustrador. La foto se
                reduce a 520 px antes de guardarse.
              </p>
            </div>
          </div>
          <div className="flex gap-[14px] items-center flex-wrap mt-[4px]">
            <button onClick={submitBook} className={primaryBtn}>
              {isEditing ? "Guardar cambios" : "Publicar en mi estante"}
            </button>
            <button onClick={cancel} className={linkBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
      <div className="pt-0 lg:pt-[40px]">
        <div className={`${sectionLabel} mb-[12px]`}>Vista previa</div>
        <BookCover
          cover={previewCover}
          plate={previewPlate}
          title={previewShort}
          className="h-[210px] w-full rounded-[1px]"
          textClassName="p-[16px] text-[17px] leading-[1.2]"
        />
        <div className="text-[23px] leading-[1.15] mt-[12px]">{previewTitle}</div>
        <div className="text-[16px] text-[#605d5d]">{previewAuthor}</div>
        <div className="flex gap-[8px] flex-wrap mt-[10px]">
          <span className={tagPill}>{form.cat}</span>
          <span className={condPill}>{form.cond}</span>
        </div>
        <div className={`text-[15px] leading-[1.5] text-[#444141] mt-[20px] border-t ${divider} pt-[14px]`}>{slotNote}</div>
      </div>
    </div>
  );
}
