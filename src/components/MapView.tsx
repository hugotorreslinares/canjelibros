import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { BOGOTA_CENTER, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID, isGoogleMapsConfigured } from "@/lib/google-maps";
import { condPill, divider, sectionLabel, smallPrimaryBtn, tagPill } from "@/lib/ui";

interface MapUser {
  id: string;
  name: string;
  barrio: string;
  dist: number;
  lat: number;
  lng: number;
  count: number;
  starsLabel: string;
  rating: number;
  trades: number;
  ink: string;
  haloInk: string;
  pulse: number;
  statusLine: string;
  teaser: string;
  select: () => void;
}

interface SelBook {
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
  plate: string;
  short: string;
  propose: () => void;
}

interface MapViewProps {
  users: MapUser[];
  noSelection: boolean;
  hasSelection: boolean;
  sel: {
    name: string;
    barrio: string;
    dist: number;
    starsLabel: string;
    rating: number;
    trades: number;
    bio: string;
    spot: string;
    count: number;
    statusLine: string;
  } | null;
  selBooks: SelBook[];
  clearSelection: () => void;
  nearCount: number;
}

function MapPin({ u }: { u: MapUser }) {
  return (
    <button
      onClick={u.select}
      className="bg-transparent border-none p-0 grid justify-items-center gap-[6px] cursor-pointer"
    >
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
    </button>
  );
}

function StaticFallbackMap() {
  return (
    <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <g stroke="#201e1d" strokeOpacity=".13" fill="none">
        <path d="M0 120 H1000 M0 250 H1000 M0 380 H1000 M0 510 H1000 M0 630 H1000" strokeWidth="1" />
        <path d="M120 0 V700 M260 0 V700 M400 0 V700 M540 0 V700 M680 0 V700 M820 0 V700" strokeWidth="1" />
      </g>
      <g stroke="#201e1d" strokeOpacity=".38" fill="none">
        <path d="M300 0 V700" strokeWidth="5" />
        <path d="M0 300 H1000" strokeWidth="5" />
        <path d="M640 0 L900 700" strokeWidth="3" />
      </g>
      <g fill="#201e1d" fillOpacity=".06">
        <rect x="700" y="60" width="220" height="150" />
        <rect x="130" y="470" width="150" height="120" />
      </g>
      <g stroke="#201e1d" strokeOpacity=".2" strokeWidth="1">
        <path d="M700 60 L920 210 M700 110 L920 260 M700 160 L870 210" />
      </g>
      <g fill="#605d5d" fontFamily="Source Serif 4, serif" fontSize="13" letterSpacing="1.5">
        <text x="310" y="30">CRA 7</text>
        <text x="14" y="292">CALLE 26</text>
        <text x="712" y="52">PARQUE NACIONAL</text>
        <text x="140" y="462">CEMENTERIO CENTRAL</text>
        <text x="820" y="660">AV. CIRCUNVALAR</text>
      </g>
      <g stroke="#0088b0" strokeWidth="1" fill="none">
        <path d="M20 20 h18 M20 20 v18 M980 680 h-18 M980 680 v-18" />
      </g>
      <g stroke="#d6006c" strokeWidth="1" fill="none">
        <path d="M980 20 h-18 M980 20 v18 M20 680 h18 M20 680 v-18" />
      </g>
    </svg>
  );
}

export function MapView({ users, noSelection, hasSelection, sel, selBooks, clearSelection, nearCount }: MapViewProps) {
  return (
    <div className="grid grid-cols-1 lg:[grid-template-columns:minmax(0,1fr)_400px] flex-1 items-stretch">
      <div className="relative overflow-hidden bg-[#f3f2f2] min-h-[500px] lg:min-h-[640px]">
        {isGoogleMapsConfigured ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string}>
            <Map
              mapId={GOOGLE_MAPS_MAP_ID}
              defaultCenter={BOGOTA_CENTER}
              defaultZoom={13}
              disableDefaultUI
              zoomControl
              gestureHandling="greedy"
              className="absolute inset-0 w-full h-full"
            >
              {users.map((u) => (
                <AdvancedMarker key={u.id} position={{ lat: u.lat, lng: u.lng }}>
                  <MapPin u={u} />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        ) : (
          <>
            <StaticFallbackMap />
            <div className="absolute right-[24px] top-[24px] bg-[#f8f4f4]/92 border border-[#201e1d]/16 rounded-[2px] px-[14px] py-[10px] max-w-[280px] text-[13px] leading-[1.4] text-[#605d5d]">
              Mapa de ejemplo. Configura <code className="text-[#201e1d]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> para ver el mapa real de Google.
            </div>
          </>
        )}

        <div className="absolute left-[24px] bottom-[24px] bg-[#f8f4f4]/92 border border-[#201e1d]/16 rounded-[2px] px-[16px] py-[12px] max-w-[300px] pointer-events-none">
          <div className="text-[12px] tracking-[.16em] uppercase text-[#605d5d] mb-[6px]">Tu zona</div>
          <div className="text-[16px] leading-[1.4]">Chapinero Alto · radio de 600 m. Nadie ve tu dirección exacta.</div>
        </div>
      </div>

      <aside className="border-l-0 lg:border-l border-[#201e1d]/16 px-[24px] lg:px-[30px] pt-[28px] pb-[40px] overflow-auto">
        {noSelection && (
          <div>
            <div className={sectionLabel}>Cerca de ti</div>
            <h2 className="text-[34px] leading-[1.05] my-[8px] mb-[14px]">{nearCount} lectores en 3 km</h2>
            <p className="text-[17px] leading-[1.5] text-[#444141] mb-[26px] [text-wrap:pretty]">
              Toca una zona en el mapa para ver el estante de esa persona. El número dentro del círculo es cuántos
              libros tiene disponibles.
            </p>
            <div className="grid gap-[18px]">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={u.select}
                  className={`text-left bg-transparent border-none border-t ${divider} pt-[16px] grid gap-[4px] hover:bg-[#eae7e7]`}
                >
                  <div className="flex justify-between items-baseline gap-[12px]">
                    <span className="text-[21px]">{u.name}</span>
                    <span className="text-[14px] text-[#605d5d]">{u.dist} km</span>
                  </div>
                  <div className="text-[14px] text-[#605d5d]">
                    {u.barrio} · {u.starsLabel} {u.rating} · {u.trades} intercambios
                  </div>
                  <div className="text-[16px] text-[#201e1d]">{u.teaser}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {hasSelection && sel && (
          <div>
            <button onClick={clearSelection} className="bg-transparent border-none p-0 pb-[18px] text-[15px] text-[#006786] hover:text-[#d6006c]">
              ← Volver a la lista
            </button>
            <div className={sectionLabel}>
              {sel.barrio} · {sel.dist} km
            </div>
            <h2 className="text-[36px] leading-[1.05] mt-[8px] mb-[6px]">{sel.name}</h2>
            <div className="text-[16px] text-[#444141] mb-[6px]">
              {sel.starsLabel} {sel.rating} de 5 · {sel.trades} intercambios · {sel.statusLine}
            </div>
            <div className="text-[16px] leading-[1.5] text-[#444141] mb-[8px] italic">{sel.bio}</div>
            <div className={`text-[14px] text-[#605d5d] border-t ${divider} pt-[10px] mb-[22px]`}>
              Punto de encuentro que propone: {sel.spot}
            </div>
            <div className={`${sectionLabel} mb-[14px]`}>Su estante · {sel.count} disponibles</div>
            <div className="grid gap-[20px]">
              {selBooks.map((b, i) => (
                <div key={i} className={`grid grid-cols-[56px_minmax(0,1fr)] gap-[14px] border-t ${divider} pt-[16px]`}>
                  <div
                    style={{ background: b.plate }}
                    className="h-[82px] rounded-[1px] p-[6px] flex items-end text-[10px] leading-[1.15] text-[#f8f4f4] overflow-hidden"
                  >
                    {b.short}
                  </div>
                  <div className="grid gap-[5px]">
                    <div className="text-[20px] leading-[1.15]">{b.t}</div>
                    <div className="text-[15px] text-[#605d5d]">{b.a}</div>
                    <div className="text-[15px] leading-[1.45] text-[#444141]">{b.desc}</div>
                    <div className="flex gap-[8px] flex-wrap mt-[3px]">
                      <span className={tagPill}>{b.cat}</span>
                      <span className={condPill}>{b.cond}</span>
                    </div>
                    <button onClick={b.propose} className={`${smallPrimaryBtn} justify-self-start mt-[8px]`}>
                      Proponer intercambio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
