export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Advanced Markers require a Map ID. Google's public demo ID works for
// development without creating one, but real styling needs a project-owned ID.
export const GOOGLE_MAPS_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_API_KEY);

// Centro aproximado de los barrios cubiertos (Bogotá).
export const BOGOTA_CENTER = { lat: 4.629, lng: -74.072 };
