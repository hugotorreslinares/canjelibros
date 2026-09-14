export interface Book {
  id: string;
  ownerId: string;
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
  cover: string | null;
  resUid: string | null;
  createdAt: number;
}

export type NewBook = Pick<Book, "t" | "a" | "cat" | "cond" | "desc" | "cover">;

export interface Reader {
  id: string;
  name: string;
  barrio: string;
  lat: number;
  lng: number;
  // Presencia real: el sello del último latido. El `online: true` que se
  // escribía al crear el perfil no volvía a cambiar nunca, así que todo el
  // mundo aparecía «en línea ahora» para siempre.
  lastSeenAt: number | null;
  bio: string;
  spot: string;
  interests: string[];
  // Cuenta suspendida por moderación: no puede publicar, proponer canjes ni
  // escribir mensajes nuevos. No cierra sesión ni oculta lo ya publicado.
  suspended: boolean;
}

// Un canje cerrado, con ambos participantes. Público y de solo creación, como
// `Rating`: así cualquiera puede contar cuántos canjes cerró cada lector sin
// que el conteo dependa de que la otra parte escriba en su propio documento,
// que es justo el hueco que tenía `readers/{uid}.trades`.
export interface CompletedTrade {
  id: string;
  participants: [string, string];
  threadId: string;
  createdAt: number;
}

export interface ChatThread {
  id: string;
  participants: [string, string];
  dealText: string;
  lastMessage: string;
  lastMessageAt: number;
  closed: boolean;
  fromUid: string;
  toUid: string;
  fromBookId: string;
  toBookId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export interface Rating {
  id: string;
  raterUid: string;
  ratedUid: string;
  stars: number;
  tags: string[];
  createdAt: number;
}

export type ModerationAction = "edit" | "delete" | "delete-message" | "suspend" | "unsuspend";

export interface ModerationLogEntry {
  id: string;
  action: ModerationAction;
  bookId: string;
  bookTitle: string;
  ownerId: string;
  ownerName: string;
  moderatorUid: string;
  moderatorName: string;
  reason: string;
  changes: string[];
  createdAt: number;
}

export type ReportKind = "book" | "message";
export type ReportStatus = "open" | "resolved";

// Un reporte apunta a un libro o a un mensaje de chat, nunca a los dos. Para
// un mensaje se guarda una copia del texto en el momento del reporte, en vez
// de dar a moderación permiso para leer el hilo completo: las reglas siguen
// restringiendo `threads/*` a sus dos participantes.
export interface Report {
  id: string;
  kind: ReportKind;
  targetOwnerId: string;
  targetOwnerName: string;
  bookId: string | null;
  bookTitle: string;
  threadId: string | null;
  messageId: string | null;
  messageText: string;
  reporterUid: string;
  reason: string;
  status: ReportStatus;
  createdAt: number;
}

export type Route = "map" | "catalog" | "shelf" | "publish" | "chat" | "moderation" | "policies";
export type SortOption = "distancia" | "estado" | "título";
