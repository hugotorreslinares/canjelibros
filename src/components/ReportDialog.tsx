import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportDialogProps {
  open: boolean;
  kind: "book" | "message";
  title: string;
  ownerName: string;
  messageText: string;
  reason: string;
  setReason: (v: string) => void;
  close: () => void;
  submit: () => void;
}

export function ReportDialog({
  open,
  kind,
  title,
  ownerName,
  messageText,
  reason,
  setReason,
  close,
  submit,
}: ReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-[520px] p-8">
        <DialogHeader>
          <p className="font-sans text-label uppercase text-muted-foreground">
            {kind === "book" ? `Publicación de ${ownerName}` : `Mensaje de ${ownerName}`}
          </p>
          <DialogTitle className="font-serif text-title">
            {kind === "book" ? `Reportar «${title}»` : "Reportar este mensaje"}
          </DialogTitle>
          <DialogDescription className="font-serif text-body text-foreground/85">
            Un moderador revisará el reporte junto a las políticas del sitio.
          </DialogDescription>
        </DialogHeader>

        {kind === "message" && (
          <p className="font-serif text-body text-foreground/85 border-l-2 border-border pl-3 italic">
            «{messageText}»
          </p>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="font-sans text-label uppercase text-muted-foreground">Motivo</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Qué incumple y por qué"
            className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full resize-y outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
          />
        </label>

        <DialogFooter className="border-t border-border pt-5 sm:justify-start">
          <Button onClick={submit} disabled={!reason.trim()}>
            Enviar reporte
          </Button>
          <Button variant="link" onClick={close}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
