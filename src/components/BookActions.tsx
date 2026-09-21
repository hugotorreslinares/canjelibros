"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { createReport } from "@/lib/firestore-data";
import { AuthModal } from "./AuthModal";
import { ReportDialog } from "./ReportDialog";
import { ShareBook } from "./ShareBook";

interface BookActionsProps {
  bookId: string;
  bookTitle: string;
  ownerId: string;
  ownerName: string;
  reserved: boolean;
  /** Dirección canónica de la ficha, la que se comparte. */
  shareUrl: string;
}

// Proponer el canje y reportar viven aquí y no en la portada: la portada solo
// ayuda a elegir. La ficha es una ruta fuera de la SPA, sin el estado de
// `use-app-state`, así que proponer manda a la portada con `#proponer=<id>` (allí
// está el modal, con sus libros y su sesión) y reportar se resuelve en la propia
// ficha, que solo necesita la sesión y un documento.
export function BookActions({ bookId, bookTitle, ownerId, ownerName, reserved, shareUrl }: BookActionsProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");

  const mine = user?.uid === ownerId;

  const closeReport = () => {
    setReportOpen(false);
    setReason("");
  };

  const submitReport = async () => {
    if (!user) return;
    const motivo = reason.trim();
    if (!motivo) {
      toast("Escribe el motivo del reporte.");
      return;
    }
    try {
      await createReport({
        kind: "book",
        targetOwnerId: ownerId,
        targetOwnerName: ownerName,
        bookId,
        bookTitle,
        threadId: null,
        messageId: null,
        messageText: "",
        reporterUid: user.uid,
        reason: motivo,
      });
      toast("Reporte enviado. Un moderador lo revisará.");
      closeReport();
    } catch {
      toast("No se pudo enviar el reporte. Intenta de nuevo.");
    }
  };

  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {!mine &&
          (reserved ? (
            <Button disabled>Reservado</Button>
          ) : (
            <Button asChild>
              <Link href={`/#proponer=${bookId}`}>Proponer canje</Link>
            </Button>
          ))}
        <ShareBook title={bookTitle} url={shareUrl} />
      </div>
      <p className="font-sans text-small text-muted-foreground max-w-[40ch] m-0">
        {mine
          ? "Este libro es tuyo."
          : reserved
            ? "Alguien ya propuso un canje por este libro. Vuelve a estar libre si la propuesta no cierra."
            : "El canje es libro por libro: necesitas uno publicado para ofrecer a cambio."}
      </p>

      {!mine && (
        <Button
          variant="link"
          onClick={() => (user ? setReportOpen(true) : setAuthOpen(true))}
          className="px-0 text-muted-foreground"
        >
          Reportar
        </Button>
      )}

      <AuthModal
        open={authOpen}
        reason="Inicia sesión para reportar una publicación."
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          setReportOpen(true);
        }}
      />
      <ReportDialog
        open={reportOpen}
        kind="book"
        title={bookTitle}
        ownerName={ownerName}
        messageText=""
        reason={reason}
        setReason={setReason}
        close={closeReport}
        submit={submitReport}
      />
    </div>
  );
}
