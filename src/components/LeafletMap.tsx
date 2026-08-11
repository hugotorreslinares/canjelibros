"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export const BOGOTA_CENTER: [number, number] = [4.629, -74.072];

interface MapPinUser {
  id: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  ink: string;
  haloInk: string;
  pulse: number;
  statusLine: string;
  select: () => void;
}

interface SelectedLocation {
  lat: number;
  lng: number;
}

function pinIcon(u: MapPinUser) {
  const html = renderToStaticMarkup(
    <div className="grid justify-items-center gap-[6px] cursor-pointer">
      <div className="relative w-[132px] h-[132px] grid place-items-center">
        <div
          style={{
            background: `radial-gradient(circle, ${u.haloInk} 0%, rgba(0,136,176,0) 68%)`,
            animation: u.pulse ? `breathe ${u.pulse}s ease-in-out infinite` : undefined,
          }}
          className="absolute inset-0 rounded-full blur-[7px]"
        />
        <div
          style={{ borderColor: u.ink, color: u.ink }}
          className="relative w-[46px] h-[46px] rounded-full bg-[#f8f4f4] border-[1.5px] grid place-items-center text-[19px] shadow-[0_3px_10px_rgba(45,43,43,.16)]"
        >
          {u.count}
        </div>
      </div>
      <div className="bg-[#f8f4f4] border border-[#201e1d]/16 rounded-[2px] px-[9px] py-[4px] grid gap-[1px] justify-items-center shadow-[0_1px_2px_rgba(45,43,43,.14)]">
        <span className="text-[15px] text-[#201e1d]">{u.name}</span>
        <span className="text-[12px] text-[#605d5d]">{u.statusLine}</span>
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: "cambialibros-marker",
    iconSize: [132, 178],
    iconAnchor: [66, 89],
  });
}

function LocateUser() {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 14),
      () => {
        // Sin permiso o sin soporte: el mapa se queda centrado en Bogotá.
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [map]);

  return null;
}

function FlyToSelection({ selected }: { selected: SelectedLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], 15);
  }, [selected, map]);

  return null;
}

export function LeafletMap({ users, selected }: { users: MapPinUser[]; selected: SelectedLocation | null }) {
  return (
    <MapContainer center={BOGOTA_CENTER} zoom={13} scrollWheelZoom className="absolute inset-0 w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocateUser />
      <FlyToSelection selected={selected} />
      {users.map((u) => (
        <Marker key={u.id} position={[u.lat, u.lng]} icon={pinIcon(u)} eventHandlers={{ click: () => u.select() }} />
      ))}
    </MapContainer>
  );
}
