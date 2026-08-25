import type { Route } from "./types";

// La URL es el estado de navegación, no una copia suya. Antes todo vivía en un
// `route` de React y la aplicación entera era una sola dirección: no se podía
// compartir un lector ni citar las políticas, y «atrás» sacaba del sitio.
const ROUTE_PATHS: Record<Route, string> = {
  map: "/",
  catalog: "/catalogo",
  shelf: "/estante",
  publish: "/publicar",
  chat: "/mensajes",
  moderation: "/moderacion",
  policies: "/politicas",
};

const READER_PREFIX = "/lector/";

export interface Location {
  route: Route;
  readerId: string | null;
}

export function pathForRoute(route: Route): string {
  return ROUTE_PATHS[route];
}

export function pathForReader(readerId: string): string {
  return `${READER_PREFIX}${encodeURIComponent(readerId)}`;
}

export function locationFromPath(pathname: string): Location {
  const clean = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if (clean.startsWith(READER_PREFIX)) {
    const readerId = decodeURIComponent(clean.slice(READER_PREFIX.length));
    return { route: "map", readerId: readerId || null };
  }

  const entry = (Object.entries(ROUTE_PATHS) as [Route, string][]).find(([, path]) => path === clean);
  return { route: entry ? entry[0] : "map", readerId: null };
}
