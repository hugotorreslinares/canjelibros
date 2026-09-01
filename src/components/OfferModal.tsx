import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookCover } from "./BookCover";

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
  bookCover: string | null;
  bookPlate: string;
  myOfferables: Offerable[];
  hint: string;
  close: () => void;
  send: () => void;
  goPublish: () => void;
}

export function OfferModal({
  open,
  owner,
  bookTitle,
  bookAuthor,
  bookCond,
  bookCat,
  bookCover,
  bookPlate,
  myOfferables,
  hint,
  goPublish,
  close,
  send,
}: OfferModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-[900px] p-8">
        <DialogHeader>
          <p className="font-sans text-label uppercase text-muted-foreground">Propuesta de canje con {owner}</p>
          <DialogTitle className="font-serif text-title">Uno por uno</DialogTitle>
          <DialogDescription className="sr-only">
            Elige cuál de tus libros ofreces a cambio de {bookTitle}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 min-[640px]:[grid-template-columns:1fr_46px_1fr] gap-6 items-start">
          <div>
            <h3 className="font-sans text-label uppercase text-muted-foreground mb-3">Pides</h3>
            <div className="grid grid-cols-[66px_minmax(0,1fr)] gap-3.5">
              <BookCover
                cover={bookCover}
                plate={bookPlate}
                title={bookTitle}
                size="sm"
                className="h-[99px] w-[66px] rounded-sm"
              />
              <div>
                <p className="font-serif text-subtitle">{bookTitle}</p>
                <p className="font-sans text-small text-muted-foreground">{bookAuthor}</p>
                <p className="font-sans text-small text-foreground/85 mt-1.5">
                  {bookCond} · {bookCat}
                </p>
              </div>
            </div>
          </div>

          <div className="text-[34px] text-primary text-center pt-8" aria-hidden="true">
            ⇄
          </div>

          <div>
            <h3 className="font-sans text-label uppercase text-muted-foreground mb-3">Ofreces uno de los tuyos</h3>
            {/* Sin libros publicados esta columna quedaba vacía y el pie pedía
                elegir uno, que es imposible. El canje es uno por uno: si no
                tienes nada que dar, lo que falta no es elegir sino publicar. */}
            {myOfferables.length === 0 ? (
              <div className="flex flex-col items-start gap-4">
                <p className="font-serif text-body text-foreground/85 m-0">
                  El canje es libro por libro, y todavía no tienes ninguno publicado.
                </p>
                <Button variant="outline" onClick={goPublish}>
                  Publicar mi primer libro
                </Button>
              </div>
            ) : (
            <div className="flex flex-col gap-0.5">
              {myOfferables.map((b, i) => (
                <button
                  key={i}
                  onClick={b.choose}
                  aria-pressed={b.active}
                  className={`text-left border rounded-sm px-3.5 py-3 flex flex-col gap-0.5 min-h-[max(44px,2.75rem)] ${
                    b.active ? "bg-accent border-primary" : "bg-transparent border-border-strong hover:bg-muted"
                  }`}
                >
                  <span className="font-serif text-body">{b.t}</span>
                  <span className="font-sans text-small text-muted-foreground">
                    {b.a} · {b.cond}
                  </span>
                </button>
              ))}
            </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-5 sm:justify-start items-center">
          <Button onClick={send} size="lg" disabled={!myOfferables.some((b) => b.active)}>
            Enviar propuesta
          </Button>
          <span className="font-sans text-small text-muted-foreground">{hint}</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
