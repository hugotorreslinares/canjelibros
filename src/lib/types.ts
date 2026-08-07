export interface CatalogBook {
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
}

export interface MyBook {
  t: string;
  a: string;
  cat: string;
  cond: string;
  resUid?: string | null;
}

export interface AppUser {
  id: string;
  name: string;
  barrio: string;
  dist: number;
  x: number;
  y: number;
  online: boolean;
  trades: number;
  rating: number;
  bio: string;
  spot: string;
  books: CatalogBook[];
}

export interface ThreadMessage {
  me: boolean;
  text: string;
  time: string;
}

export interface ThreadEntry {
  deal: string;
  state: string;
  time: string;
  msgs: ThreadMessage[];
}

export type Route = "onboarding" | "map" | "catalog" | "shelf" | "publish" | "chat";
export type SortOption = "distancia" | "estado" | "título";
