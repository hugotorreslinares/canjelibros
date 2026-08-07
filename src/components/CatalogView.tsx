import { condPill, divider, sectionLabel, smallOutlineBtn, tagPill } from "@/lib/ui";

interface CatalogItem {
  t: string;
  a: string;
  cat: string;
  cond: string;
  desc: string;
  owner: string;
  barrio: string;
  dist: number;
  starsLabel: string;
  plate: string;
  short: string;
  selectOwner: () => void;
  propose: () => void;
}

interface Option {
  label: string;
  active: boolean;
  pick: () => void;
}

interface CatalogViewProps {
  items: CatalogItem[];
  empty: boolean;
  count: string;
  sortLabel: string;
  catOptions: (Option & { n: number })[];
  condOptions: Option[];
  sortOptions: Option[];
  maxDist: number;
  maxDistLabel: string;
  setDist: (v: number) => void;
}

function filterBtnClass(active: boolean) {
  return `text-left bg-transparent border-none py-[3px] text-[17px] ${active ? "text-[#0088b0]" : "text-[#201e1d]"}`;
}

export function CatalogView({
  items,
  empty,
  count,
  sortLabel,
  catOptions,
  condOptions,
  sortOptions,
  maxDist,
  maxDistLabel,
  setDist,
}: CatalogViewProps) {
  return (
    <div className="px-[24px] sm:px-[40px] pt-[34px] pb-[60px]">
      <div className="flex items-baseline justify-between gap-[30px] flex-wrap mb-[6px]">
        <h1 className="text-[40px] sm:text-[52px] leading-none m-0">Catálogo</h1>
        <div className="text-[16px] text-[#605d5d]">
          {count} libros disponibles · ordenados por {sortLabel}
        </div>
      </div>
      <div className="h-[5px] bg-[#201e1d] mt-[14px] mb-[2px]" />
      <div className="h-px bg-[#201e1d] mb-[26px]" />
      <div className="grid grid-cols-1 md:[grid-template-columns:230px_minmax(0,1fr)] gap-[44px] items-start">
        <div className="grid gap-[26px] md:sticky md:top-[20px]">
          <div>
            <div className={`${sectionLabel} mb-[10px]`}>Categoría</div>
            <div className="grid gap-[4px]">
              {catOptions.map((o) => (
                <button key={o.label} onClick={o.pick} className={filterBtnClass(o.active)}>
                  {o.label} <span className="text-[#7d7979] text-[14px]">{o.n}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={`${sectionLabel} mb-[10px]`}>Estado</div>
            <div className="grid gap-[4px]">
              {condOptions.map((o) => (
                <button key={o.label} onClick={o.pick} className={filterBtnClass(o.active)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className={`${sectionLabel} mb-[10px]`}>Distancia máxima</div>
            <div className="text-[19px] mb-[6px]">{maxDistLabel}</div>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.5}
              value={maxDist}
              onChange={(e) => setDist(parseFloat(e.target.value))}
              className="w-full accent-[#0088b0]"
            />
          </div>
          <div>
            <div className={`${sectionLabel} mb-[10px]`}>Orden</div>
            <div className="grid gap-[4px]">
              {sortOptions.map((o) => (
                <button key={o.label} onClick={o.pick} className={filterBtnClass(o.active)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-0">
          {items.map((b, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 sm:grid-cols-[74px_minmax(0,1fr)_210px] gap-[22px] border-t ${divider} py-[22px] items-start`}
            >
              <div
                style={{ background: b.plate }}
                className="h-[106px] rounded-[1px] p-[8px] flex items-end text-[11px] leading-[1.15] text-[#f8f4f4] overflow-hidden"
              >
                {b.short}
              </div>
              <div className="grid gap-[6px]">
                <div className="flex gap-[10px] flex-wrap items-baseline">
                  <span className="text-[25px] leading-[1.1]">{b.t}</span>
                  <span className="text-[16px] text-[#605d5d]">{b.a}</span>
                </div>
                <div className="text-[16px] leading-[1.5] text-[#444141] max-w-[46em]">{b.desc}</div>
                <div className="flex gap-[8px] flex-wrap mt-[2px]">
                  <span className={tagPill}>{b.cat}</span>
                  <span className={condPill}>{b.cond}</span>
                </div>
              </div>
              <div className="grid gap-[6px] justify-items-start">
                <button onClick={b.selectOwner} className="bg-transparent border-none p-0 text-[18px] text-[#006786] text-left hover:text-[#d6006c]">
                  {b.owner}
                </button>
                <div className="text-[14px] text-[#605d5d]">
                  {b.barrio} · {b.dist} km · {b.starsLabel}
                </div>
                <button onClick={b.propose} className={`${smallOutlineBtn} mt-[6px]`}>
                  Proponer intercambio
                </button>
              </div>
            </div>
          ))}
          {empty && (
            <div className={`border-t ${divider} py-[40px] text-[20px] text-[#605d5d]`}>
              Nada con esos filtros. Amplía la distancia o cambia de categoría.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
