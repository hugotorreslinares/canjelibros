"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// En el teléfono abre la hoja nativa de compartir (WhatsApp, Facebook, correo…);
// donde el navegador no la tiene, copia el texto con el enlace. El enlace es el
// canónico, no `window.location`, para que un libro compartido desde una vista
// previa apunte siempre a librocambio.com. Lo que se ve al pegarlo —la portada
// y la invitación— lo pone `opengraph-image.tsx` de la ficha.
export function ShareBook({ title, url }: { title: string; url: string }) {
  const text = `Te invito a intercambiar libros usados en librocambio.com. Mira este: «${title}».`;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} · Librocambio`, text, url });
        return;
      } catch (err) {
        // Cerrar la hoja sin elegir nada no es un fallo: no se copia nada.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("Enlace copiado. Pégalo donde quieras compartirlo.");
    } catch {
      toast("No se pudo copiar el enlace. Cópialo de la barra de direcciones.");
    }
  };

  return (
    <Button variant="link" onClick={share} className="px-0 text-muted-foreground">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4"
      >
        <path d="M10 13V3M6.5 6.5 10 3l3.5 3.5M5 10H4v7h12v-7h-1" />
      </svg>
      Compartir
    </Button>
  );
}
