export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Un perfil se crea con la ubicación del dispositivo, que muchas veces es la
// casa de su dueño. Lo que se publica es la zona: la coordenada redondeada a
// una cuadrícula de ~550 m, cuyo peor caso queda a ~390 m del punto real.
const GRID = 0.005;

export const snapCoord = (v: number): number => Math.round(v / GRID) * GRID;

export const isSnapped = (v: number): boolean => Math.abs(snapCoord(v) - v) < 1e-9;
