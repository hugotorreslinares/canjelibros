import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonProps {
  rows?: number;
}

// Las proporciones imitan las filas reales (portada 2:3 más tres líneas), no un
// bloque gris genérico: así el salto al contenido real no mueve la página.
export function BookRowsSkeleton({ rows = 4 }: SkeletonProps) {
  // Mismas proporciones que la tarjeta real de CatalogView: superficie bg-card sin
  // filete, y portada dominante bajo 640px que se compacta desde ahí. Antes calcaba
  // la fila vieja (línea divisoria, portada siempre pequeña), así que el primer
  // instante de cada visita mostraba el lenguaje visual anterior.
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 min-[640px]:grid-cols-[74px_minmax(0,1fr)] gap-4 min-[640px]:gap-6 bg-card rounded-sm p-4 sm:p-5 border border-border/60"
        >
          <Skeleton className="w-32 h-[192px] min-[640px]:w-[74px] min-[640px]:h-[111px] rounded-sm" />
          <div className="flex flex-col gap-2 pt-1">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReaderListSkeleton({ rows = 4 }: SkeletonProps) {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex flex-col gap-2 border-t border-border pt-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/5" />
        </div>
      ))}
    </div>
  );
}
