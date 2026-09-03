"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export const BOGOTA_CENTER: [number, number] = [4.629, -74.072];

// Dos pines más cerca que esto en pantalla se tapan entre sí, así que se
// agrupan. Es la distancia en píxeles del círculo del pin más un respiro.
const CLUSTER_RADIUS_PX = 76;

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

interface Cluster {
  key: string;
  lat: number;
  lng: number;
  users: MapPinUser[];
}

function readerIcon(u: MapPinUser, selected: boolean) {
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
          className="relative w-[46px] h-[46px] rounded-full bg-card border-[1.5px] grid place-items-center text-subtitle shadow-[0_3px_10px_rgba(45,43,43,.16)]"
        >
          {u.count}
        </div>
      </div>
      {/* La etiqueta ya no está siempre encendida: aparece al pasar el cursor,
          al enfocar con teclado y en el pin seleccionado. Con cinco lectores
          cercanos las etiquetas permanentes ya se encaballaban entre sí. */}
      <div className="marker-label bg-card border border-border rounded-sm px-2 py-1 grid gap-px justify-items-center shadow-[0_1px_2px_rgba(45,43,43,.14)]">
        <span className="font-serif text-small text-foreground whitespace-nowrap">{u.name}</span>
        <span className="font-sans text-small text-muted-foreground whitespace-nowrap">{u.statusLine}</span>
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: `cambialibros-marker${selected ? " is-selected" : ""}`,
    iconSize: [132, 178],
    iconAnchor: [66, 89],
  });
}

function clusterIcon(c: Cluster) {
  const books = c.users.reduce((sum, u) => sum + u.count, 0);
  const html = renderToStaticMarkup(
    <div className="grid justify-items-center gap-[6px] cursor-pointer">
      <div className="relative w-[132px] h-[132px] grid place-items-center">
        <div
          style={{ background: "radial-gradient(circle, rgba(0,118,154,.28) 0%, rgba(0,136,176,0) 68%)" }}
          className="absolute inset-0 rounded-full blur-[7px]"
        />
        <div className="relative w-[54px] h-[54px] grid place-items-center">
          <div className="absolute inset-0 rounded-full bg-card border-[1.5px] border-primary/45 translate-x-[3px] translate-y-[3px]" />
          <div className="relative w-[54px] h-[54px] rounded-full bg-card border-[1.5px] border-primary grid place-items-center text-subtitle text-primary shadow-[0_3px_10px_rgba(45,43,43,.16)]">
            {c.users.length}
          </div>
        </div>
      </div>
      <div className="marker-label bg-card border border-border rounded-sm px-2 py-1 grid gap-px justify-items-center shadow-[0_1px_2px_rgba(45,43,43,.14)]">
        <span className="font-serif text-small text-foreground whitespace-nowrap">{c.users.length} lectores aquí</span>
        <span className="font-sans text-small text-muted-foreground whitespace-nowrap">
          {books === 1 ? "1 libro" : `${books} libros`} · toca para ver quiénes son
        </span>
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: "cambialibros-marker cambialibros-cluster",
    iconSize: [132, 178],
    iconAnchor: [66, 89],
  });
}

// Agrupación por cercanía en pantalla: se proyecta cada lector al zoom actual y
// se junta con el primer grupo que le quede a menos de CLUSTER_RADIUS_PX.
function buildClusters(map: L.Map, users: MapPinUser[], zoom: number): Cluster[] {
  const groups: { users: MapPinUser[]; point: L.Point }[] = [];

  users.forEach((u) => {
    const point = map.project([u.lat, u.lng], zoom);
    const near = groups.find((g) => g.point.distanceTo(point) < CLUSTER_RADIUS_PX);
    if (near) near.users.push(u);
    else groups.push({ users: [u], point });
  });

  return groups.map((g) => ({
    key: g.users.map((u) => u.id).join("_"),
    lat: g.users.reduce((sum, u) => sum + u.lat, 0) / g.users.length,
    lng: g.users.reduce((sum, u) => sum + u.lng, 0) / g.users.length,
    users: g.users,
  }));
}

function ReaderMarkers({ users, selectedId }: { users: MapPinUser[]; selectedId: string | null }) {
  const map = useMap();
  // El zoom es la variable de la que depende qué pines se tapan, así que es
  // estado de verdad y no un contador para invalidar el memo.
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on("zoomend", sync);
    return () => {
      map.off("zoomend", sync);
    };
  }, [map]);

  const clusters = useMemo(() => buildClusters(map, users, zoom), [map, users, zoom]);

  return (
    <>
      {clusters.map((c) =>
        c.users.length === 1 ? (
          <Marker
            key={c.key}
            position={[c.users[0].lat, c.users[0].lng]}
            icon={readerIcon(c.users[0], c.users[0].id === selectedId)}
            title={`${c.users[0].name} · ${c.users[0].count} libros`}
            riseOnHover
            eventHandlers={{ click: () => c.users[0].select() }}
          />
        ) : (
          // Acercar no siempre separa el grupo: varios lectores comparten punto
          // porque el perfil se crea con la ubicación del dispositivo. La lista
          // sí resuelve siempre, y es la elección que el usuario venía a hacer.
          <Marker key={c.key} position={[c.lat, c.lng]} icon={clusterIcon(c)} title={`${c.users.length} lectores en esta zona`} riseOnHover>
            <Popup>
              <div className="flex flex-col gap-1 min-w-[180px]">
                <span className="font-sans text-label uppercase text-muted-foreground">
                  {c.users.length} lectores aquí
                </span>
                {c.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={u.select}
                    className="flex h-11 min-h-[44px] items-center justify-between gap-3 border-t border-border bg-transparent text-left"
                  >
                    <span className="font-serif text-body text-foreground">{u.name}</span>
                    <span className="font-sans text-small text-muted-foreground">
                      {u.count === 1 ? "1 libro" : `${u.count} libros`}
                    </span>
                  </button>
                ))}
              </div>
            </Popup>
          </Marker>
        )
      )}
    </>
  );
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

export function LeafletMap({
  users,
  selected,
  selectedId,
}: {
  users: MapPinUser[];
  selected: SelectedLocation | null;
  selectedId: string | null;
}) {
  return (
    <MapContainer center={BOGOTA_CENTER} zoom={13} scrollWheelZoom className="absolute inset-0 w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocateUser />
      <FlyToSelection selected={selected} />
      <ReaderMarkers users={users} selectedId={selectedId} />
    </MapContainer>
  );
}
