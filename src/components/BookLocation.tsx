"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchPlace } from "@/lib/firestore-data";
import { distanceKm, snapCoord } from "@/lib/geo";
import { formatDistance } from "./DistanceLabel";

const BookLocationMap = dynamic(() => import("./BookLocationMap").then((m) => m.BookLocationMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[260px] w-full" />,
});

interface Point {
  lat: number;
  lng: number;
}

// La ficha es pública, así que un lector normal sale como una zona: la
// coordenada ya viene redondeada (ver `snapCoord`) y el círculo de 500 m cubre
// hasta el peor caso, ~390 m. Un Punto Librocambio sí sale exacto: es un lugar
// de encuentro que el equipo eligió mostrar.

export function BookLocation({ ownerId, official }: { ownerId: string; official: boolean }) {
  // undefined = cargando; null = sin ubicación que mostrar.
  const [place, setPlace] = useState<Point | null | undefined>(isFirebaseConfigured ? undefined : null);
  const [me, setMe] = useState<Point | null>(null);
  const [denied, setDenied] = useState(false);

  // Se lee en el navegador y no en el servidor a propósito: así la coordenada
  // de un lector nunca queda en el HTML que indexa un buscador.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    fetchPlace(ownerId, official)
      .then((p) => {
        if (!cancelled) setPlace(p && (official ? p : { lat: snapCoord(p.lat), lng: snapCoord(p.lng) }));
      })
      .catch((err) => {
        console.error("no se pudo leer la ubicación del libro", err);
        if (!cancelled) setPlace(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ownerId, official]);

  const locate = () => {
    setDenied(false);
    if (!navigator.geolocation) {
      setDenied(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setDenied(true),
      { timeout: 8000 }
    );
  };

  if (place === null) return null;

  const km = place && me ? distanceKm(me.lat, me.lng, place.lat, place.lng) : null;
  const dist = formatDistance(km);

  return (
    <section aria-labelledby="ubicacion" className="mt-10 border-t border-border pt-6">
      <h2 id="ubicacion" className="font-sans text-label uppercase text-muted-foreground m-0">
        {official ? "Punto de entrega" : "Zona aproximada"}
      </h2>
      <p className="font-serif text-body text-foreground/85 mt-2 mb-4 max-w-[52ch]">
        {official
          ? "Aquí se entrega el libro."
          : "La ubicación exacta se acuerda por mensaje cuando propones el canje."}
      </p>

      {place ? (
        <div className="overflow-hidden rounded-sm border border-border">
          <BookLocationMap place={place} exact={official} me={me} />
        </div>
      ) : (
        <Skeleton className="h-[260px] w-full" />
      )}

      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap mt-3">
        {dist ? (
          <p className="font-sans text-body text-foreground m-0">Queda {dist}.</p>
        ) : (
          <Button variant="outline" onClick={locate} disabled={!place}>
            Ver a qué distancia está de ti
          </Button>
        )}
        <span className="font-sans text-small text-muted-foreground">
          {denied
            ? "No pudimos ver tu ubicación: revisa el permiso del navegador."
            : "Tu ubicación se queda en tu navegador."}
        </span>
      </div>
    </section>
  );
}
