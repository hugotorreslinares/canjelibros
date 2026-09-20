"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { pathForRoute } from "@/lib/routes";
import { useIsModerator, useMyThreads, useOfficialName } from "@/hooks/use-firestore-data";
import { Header } from "./Header";

// La ficha de un libro (`/libro/[slug]`) es una ruta real fuera del catch-all
// de la aplicación (ver AGENTS.md): no hay un `useAppState` con `route` y
// `pushState` de dónde colgar el encabezado. Este envoltorio reusa el mismo
// `Header` con navegación real de Next en vez de las funciones `go*` de la
// SPA — cada destino sigue siendo una vista real del catch-all al llegar.
export function BookPageHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const isModerator = useIsModerator(uid);
  const accountName = useOfficialName(uid);
  const { threads } = useMyThreads(uid);

  const go = (path: string) => router.push(path);

  return (
    <Header
      unread={threads.filter((t) => !t.closed).length}
      isMap={false}
      isCatalog={false}
      isChat={false}
      isShelf={false}
      isModerator={isModerator}
      isModeration={false}
      goModeration={() => go(pathForRoute("moderation"))}
      goMap={() => go(pathForRoute("map"))}
      goCatalog={() => go(pathForRoute("catalog"))}
      goChat={() => go(pathForRoute("chat"))}
      goShelf={() => go(pathForRoute("shelf"))}
      goPublish={() => go(pathForRoute("publish"))}
      skipTo="#contenido"
      accountName={accountName}
    />
  );
}
