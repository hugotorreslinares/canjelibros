import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  coverBusy: boolean;
  previewCover: string | null;
  previewPlate: string;
  previewShort: string;
  previewTitle: string;
  previewAuthor: string;
  slotNote: string;
  submitBook: () => void;
  cancel: () => void;
}

const fieldClass =
  "border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder";

function ChipRow({ chips }: { chips: Chip[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={c.pick}
          aria-pressed={c.active}
          className={`h-11 px-4 rounded-sm border font-sans text-small transition-colors ${
            c.active
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border-strong bg-transparent text-foreground/85 hover:bg-muted"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
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
  coverBusy,
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
    <div className="w-full mx-auto max-w-[1180px] px-6 sm:px-10 pt-8 pb-16 grid grid-cols-1 lg:[grid-template-columns:minmax(0,1fr)_320px] gap-14">
      <div>
        <h2 className="font-sans text-label uppercase text-muted-foreground">
          {isEditing ? "Editando publicación" : `Nueva publicación · cupo ${nextSlot} de ${totalSlots}`}
        </h2>
        <h1 className="font-serif text-display mt-2 mb-6">
          {isEditing ? "Edita los datos de tu libro" : "Pon un libro en circulación"}
        </h1>

        <div className="flex flex-col gap-6 max-w-[640px]">
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-small text-foreground/85">Título</span>
            <input value={form.t} onChange={(e) => setTitle(e.target.value)} placeholder="Rayuela" className={fieldClass} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-small text-foreground/85">Autor</span>
            <input
              value={form.a}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Julio Cortázar"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-small text-foreground/85">Descripción · por qué vale la pena pasarlo</span>
            <textarea
              value={form.desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="Edición de bolsillo, subrayada a lápiz en los capítulos del club de la serpiente."
              className={`${fieldClass} resize-y`}
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="font-sans text-small text-foreground/85">Estado</span>
            <ChipRow chips={condChips} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-sans text-small text-foreground/85">Categoría</span>
            <ChipRow chips={catChips} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-sans text-small text-foreground/85">Portada (opcional)</span>
            <div className="border border-dashed border-border-strong rounded-sm p-5 flex flex-col gap-3 items-center text-center">
              <p className="font-serif text-body text-foreground/85 max-w-[34em]">
                Sube una foto <strong className="font-semibold">tomada por ti</strong> del ejemplar que vas a
                intercambiar. Si no hay foto, imprimimos el título como portada tipográfica.
              </p>
              <Button variant="outline" asChild disabled={coverBusy}>
                <label className={coverBusy ? "pointer-events-none opacity-60" : "cursor-pointer"}>
                  {coverBusy ? "Procesando foto…" : previewCover ? "Cambiar foto" : "Elegir foto"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // Limpiar el input permite volver a elegir el mismo archivo tras un error.
                      e.target.value = "";
                      if (file) pickCover(file);
                    }}
                  />
                </label>
              </Button>
              {previewCover && (
                <Button variant="link" onClick={clearCover}>
                  Quitar foto
                </Button>
              )}
              <p className="font-sans text-small text-muted-foreground max-w-[34em]">
                No subas la imagen de portada que encontraste en internet: es del editor o del ilustrador. La foto se
                reduce a 520 px antes de guardarse.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-center flex-wrap mt-1">
            <Button size="lg" onClick={submitBook}>
              {isEditing ? "Guardar cambios" : "Publicar en mi estante"}
            </Button>
            <Button variant="link" onClick={cancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-0 lg:pt-10">
        <h2 className="font-sans text-label uppercase text-muted-foreground mb-3">Vista previa</h2>
        <BookCover
          cover={previewCover}
          plate={previewPlate}
          title={previewShort}
          author={previewAuthor}
          size="lg"
          className="h-[420px] w-[280px] rounded-sm"
        />
        <p className="font-serif text-subtitle mt-3">{previewTitle}</p>
        <p className="font-sans text-small text-muted-foreground">{previewAuthor}</p>
        <div className="flex gap-2 flex-wrap mt-2.5">
          <Badge variant="secondary">{form.cat}</Badge>
          <Badge variant="outline">{form.cond}</Badge>
        </div>
        <p className="font-sans text-small text-foreground/85 mt-5 border-t border-border pt-3.5">{slotNote}</p>
      </div>
    </div>
  );
}
