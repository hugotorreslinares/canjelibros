import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonProps {
  rows?: number;
}

// Las proporciones imitan las filas reales (portada 2:3 más tres líneas), no un
// bloque gris genérico: así el salto al contenido real no mueve la página.
export function BookRowsSkeleton({ rows = 4 }: SkeletonProps) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid grid-cols-[74px_minmax(0,1fr)] gap-4 border-t border-border py-6">
          <Skeleton className="h-[111px] w-[74px]" />
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
