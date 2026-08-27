import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-[560px] p-8">
        <DialogHeader>
          <p className="font-sans text-label uppercase text-muted-foreground">Canje cerrado</p>
          <DialogTitle className="font-serif text-title">¿Cómo te fue con {name}?</DialogTitle>
          <DialogDescription className="font-serif text-body text-foreground/85">
            Solo pueden calificarse las personas que completaron un intercambio. Tu nota es pública en su perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1" role="group" aria-label="Estrellas">
          {starPicks.map((s, i) => (
            <button
              key={i}
              onClick={s.pick}
              aria-label={`${i + 1} ${i === 0 ? "estrella" : "estrellas"}`}
              aria-pressed={s.filled}
              className={`bg-transparent border-none size-11 grid place-items-center text-[38px] leading-none ${
                s.filled ? "text-destructive" : "text-border-strong"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {ratingTags.map((t) => (
            <button
              key={t.label}
              onClick={t.toggle}
              aria-pressed={t.active}
              className={`h-11 px-4 rounded-sm border font-sans text-small transition-colors ${
                t.active
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border-strong bg-transparent text-foreground/85 hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button onClick={submit} size="lg">
            Enviar calificación
          </Button>
          <Button variant="link" onClick={close}>
            Después
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
