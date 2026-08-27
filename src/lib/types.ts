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
  trades: number;
  bio: string;
  spot: string;
  interests: string[];
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

export type ModerationAction = "edit" | "delete";

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

export type Route = "map" | "catalog" | "shelf" | "publish" | "chat" | "moderation" | "policies";
export type SortOption = "distancia" | "estado" | "título";
