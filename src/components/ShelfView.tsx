import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookCover } from "./BookCover";
import { Reputation } from "./Reputation";

interface ShelfBook {
  cover: string | null;
  t: string;
  a: string;
  cat: string;
  cond: string;
  plate: string;
  state: string;
  reserved: boolean;
  canRemove: boolean;
  edit: () => void;
  remove: () => void;
}

interface InterestOption {
  label: string;
  active: boolean;
  toggle: () => void;
}

interface ShelfViewProps {
  signedIn: boolean;
  readerName: string;
  readerBarrio: string;
  myBooks: ShelfBook[];
  myRating: number | null;
  myTrades: number;
  usedSlots: number;
  totalSlots: number;
  slotPips: { filled: boolean }[];
  slotNote: string;
  addSlotLabel: string;
  hasPending: boolean;
  nextCupoNote: string;
  interestOptions: InterestOption[];
  goPublish: () => void;
  goChat: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="font-sans text-label uppercase text-muted-foreground">{children}</h2>;
}

export function ShelfView({
  signedIn,
  readerName,
  readerBarrio,
  myBooks,
  myRating,
  myTrades,
  usedSlots,
  totalSlots,
  slotPips,
  slotNote,
  addSlotLabel,
  hasPending,
  nextCupoNote,
  interestOptions,
  goPublish,
  goChat,
}: ShelfViewProps) {
  if (!signedIn) {
    return (
      <div className="w-full mx-auto max-w-[720px] px-6 sm:px-10 pt-8 pb-16">
        <SectionLabel>Mi estante</SectionLabel>
        <h1 className="font-serif text-display mt-2 mb-4">Inicia sesión para ver tu estante</h1>
        <p className="font-serif text-body text-foreground/85">
          Tu estante y tus libros publicados están ligados a tu cuenta. Inicia sesión para verlos y para publicar.
        </p>
        <Button variant="outline" onClick={goPublish} className="mt-6">
          Iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-[1180px] px-6 sm:px-10 pt-8 pb-16">
      <SectionLabel>Mi estante</SectionLabel>
      <h1 className="font-serif text-display mt-2 mb-0">{readerName}</h1>
      <p className="font-serif text-body text-foreground/85 mt-2">
        {readerBarrio} · <Reputation rating={myRating} />
      </p>
      <div className="h-[5px] bg-foreground mt-5 mb-0.5" />
      <div className="h-px bg-foreground mb-8" />

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))] gap-8 mb-11">
        <div>
          <SectionLabel>Cupos</SectionLabel>
          <p className="font-serif text-[60px] leading-none text-primary mt-2">
            {usedSlots}
            <span className="text-foreground text-title">/{totalSlots}</span>
          </p>
          <div className="flex gap-1.5 mt-3" role="img" aria-label={`${usedSlots} de ${totalSlots} cupos usados`}>
            {slotPips.map((p, i) => (
              <div
                key={i}
                className={`w-6 h-3 rounded-sm border ${p.filled ? "bg-primary border-primary" : "bg-transparent border-border-strong"}`}
              />
            ))}
          </div>
          <p className="font-sans text-small text-foreground/85 mt-3 max-w-[22em]">{slotNote}</p>
        </div>
        <div>
          <SectionLabel>Intercambios</SectionLabel>
          <p className="font-serif text-[60px] leading-none mt-2">{myTrades}</p>
          <p className="font-sans text-small text-foreground/85 mt-3 max-w-[22em]">
            Cada intercambio confirmado por las dos partes abre un cupo permanente.
          </p>
        </div>
        <div>
          <SectionLabel>Siguiente cupo</SectionLabel>
          <p className="font-serif text-subtitle mt-2 max-w-[15em]">{nextCupoNote}</p>
          {hasPending && (
            <Button variant="outline" size="sm" onClick={goChat} className="mt-3">
              Ver conversación
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-6 mb-11">
        <SectionLabel>Categorías que te interesan</SectionLabel>
        <p className="font-serif text-body text-foreground/85 mt-2 mb-4 max-w-[40em]">
          Úsalas para que te recomendemos lectores y libros afines. Toca para agregar o quitar.
        </p>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((o) => (
            <button
              key={o.label}
              onClick={o.toggle}
              aria-pressed={o.active}
              className={`h-11 min-h-[44px] px-4 rounded-sm border font-sans text-small transition-colors ${
                o.active
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border-strong bg-transparent text-foreground/85 hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] gap-6">
        {myBooks.map((b, i) => (
          <article key={i} className="border-t border-border pt-4 flex flex-col gap-2">
            <BookCover
              cover={b.cover}
              plate={b.plate}
              title={b.t}
              author={b.a}
              size="lg"
              className="h-[264px] w-full rounded-sm"
            />
            <h3 className="font-serif text-subtitle m-0">{b.t}</h3>
            <p className="font-sans text-small text-muted-foreground">{b.a}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{b.cat}</Badge>
              <Badge variant="outline">{b.cond}</Badge>
            </div>
            <p className="font-sans text-small text-muted-foreground">{b.state}</p>
            <div className="flex gap-1 items-center mt-0.5">
              <Button variant="link" onClick={b.edit} className="px-0">
                Editar
              </Button>
              <Button
                variant="ghost"
                onClick={b.remove}
                disabled={!b.canRemove}
                title={b.canRemove ? undefined : "Reservado en un intercambio activo"}
                className="text-destructive hover:text-destructive"
              >
                Eliminar
              </Button>
            </div>
          </article>
        ))}
        <button
          onClick={goPublish}
          className="border border-dashed border-border-strong bg-transparent rounded-sm min-h-[240px] grid place-items-center gap-1.5 p-5 font-serif text-body text-foreground/85 hover:bg-muted"
        >
          <span className="text-[34px] text-primary leading-none">+</span>
          <span>{addSlotLabel}</span>
        </button>
      </div>
    </div>
  );
}
