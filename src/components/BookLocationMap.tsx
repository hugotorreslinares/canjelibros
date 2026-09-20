"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";

interface Point {
  lat: number;
  lng: number;
}

// Con el visitante en el mapa se encuadran los dos; sin él, manda el zoom inicial.
function Frame({ place, me }: { place: Point; me: Point | null }) {
  const map = useMap();

  useEffect(() => {
    if (me) {
      map.fitBounds(
        [
          [place.lat, place.lng],
          [me.lat, me.lng],
        ],
        { padding: [40, 40], maxZoom: 15 }
      );
    }
  }, [map, place, me]);

  return null;
}

export function BookLocationMap({ place, exact, me }: { place: Point; exact: boolean; me: Point | null }) {
  return (
    <MapContainer
      center={[place.lat, place.lng]}
      zoom={exact ? 16 : 14}
      scrollWheelZoom={false}
      className="h-[260px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {exact ? (
        <CircleMarker center={[place.lat, place.lng]} radius={9} pathOptions={{ className: "loc-pin" }} />
      ) : (
        <Circle center={[place.lat, place.lng]} radius={500} pathOptions={{ className: "loc-zone" }} />
      )}
      {me && <CircleMarker center={[me.lat, me.lng]} radius={7} pathOptions={{ className: "loc-me" }} />}
      <Frame place={place} me={me} />
    </MapContainer>
  );
}
