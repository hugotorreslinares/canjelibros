import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDialogProps {
  open: boolean;
  isModeration: boolean;
  title: string;
  bookTitle: string;
  warning: string | null;
  reason: string;
  setReason: (v: string) => void;
  confirm: () => void;
  cancel: () => void;
}

// AlertDialog, no Dialog: un borrado es una confirmación destructiva, y esta
// variante ancla el foco en la salida segura y no se cierra al hacer clic fuera.
export function DeleteDialog({
  open,
  isModeration,
  title,
  bookTitle,
  warning,
  reason,
  setReason,
  confirm,
  cancel,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && cancel()}>
      <AlertDialogContent className="p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-title">{title}</AlertDialogTitle>
          <AlertDialogDescription className="font-serif text-body text-foreground/85">
            «{bookTitle}» desaparece del catálogo y del mapa. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {warning && (
          <p className="font-sans text-small text-destructive border-l-2 border-destructive pl-3">{warning}</p>
        )}

        {isModeration && (
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-label uppercase text-muted-foreground">Motivo</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Queda registrado en la bitácora, junto a tu nombre"
              className="border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full resize-y outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder"
            />
          </label>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Sin motivo el borrado de moderación no procede, así que el
              // diálogo tiene que seguir abierto para poder escribirlo.
              if (isModeration && !reason.trim()) e.preventDefault();
              confirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
