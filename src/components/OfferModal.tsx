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

        <div className="grid grid-cols-1 sm:[grid-template-columns:1fr_46px_1fr] gap-6 items-start">
          <div>
            <h3 className="font-sans text-label uppercase text-muted-foreground mb-3">Pides</h3>
            <div className="grid grid-cols-[66px_minmax(0,1fr)] gap-3.5">
              <BookCover
                cover={bookCover}
                plate={bookPlate}
                title={bookTitle}
                className="h-[99px] w-[66px] rounded-sm"
                textClassName="p-2 text-label leading-tight"
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
            <div className="flex flex-col gap-0.5">
              {myOfferables.map((b, i) => (
                <button
                  key={i}
                  onClick={b.choose}
                  aria-pressed={b.active}
                  className={`text-left border rounded-sm px-3.5 py-3 flex flex-col gap-0.5 min-h-11 ${
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
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-5 sm:justify-start items-center">
          <Button onClick={send} size="lg">
            Enviar propuesta
          </Button>
          <span className="font-sans text-small text-muted-foreground">{hint}</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
