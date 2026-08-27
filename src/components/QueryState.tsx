import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

interface QueryStateProps {
  loading: boolean;
  error: boolean;
  isEmpty: boolean;
  skeleton: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle?: string;
  children: ReactNode;
}

// Cargando, roto y vacío se veían exactamente igual: una lista sin nada. Los
// hooks de datos ya exponían `loading` y `error` y la capa de estado los tiraba,
// así que el primer segundo de la aplicación —y una consulta fallida— se leían
// como «aquí no hay libros».
export function QueryState({
  loading,
  error,
  isEmpty,
  skeleton,
  emptyTitle,
  emptyDescription,
  errorTitle = "No pudimos cargar esta información",
  children,
}: QueryStateProps) {
  if (loading) return <>{skeleton}</>;

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-[46em] p-4">
        <AlertTitle className="font-serif text-subtitle">{errorTitle}</AlertTitle>
        <AlertDescription className="font-serif text-body">
          Revisa tu conexión y vuelve a intentarlo. Si el problema sigue, escríbenos a moderacion@librocambio.com.
        </AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Empty className="border border-dashed border-border p-8">
        <EmptyHeader>
          <EmptyTitle className="font-serif text-subtitle">{emptyTitle}</EmptyTitle>
          <EmptyDescription className="font-serif text-body text-muted-foreground">
            {emptyDescription}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <>{children}</>;
}
