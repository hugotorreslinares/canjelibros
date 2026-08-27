type CoverSize = "sm" | "md" | "lg";

interface BookCoverProps {
  cover: string | null;
  plate: string;
  title: string;
  author?: string;
  size?: CoverSize;
  className: string;
}

// Cada tamaño trae su composición: a 74 px de ancho el título en 11 px se
// cortaba a la segunda palabra y la placa dejaba de informar. Aquí el texto se
// dimensiona con el recuadro y se recorta por líneas, no a mitad de palabra.
const PLATE_LAYOUT: Record<CoverSize, { pad: string; title: string; lines: number; author: boolean; rule: boolean }> = {
  sm: { pad: "p-2", title: "text-[12px] leading-[1.15]", lines: 3, author: false, rule: false },
  md: { pad: "p-3", title: "text-[17px] leading-[1.15]", lines: 4, author: true, rule: true },
  lg: { pad: "p-5", title: "text-[24px] leading-[1.1]", lines: 5, author: true, rule: true },
};

// Un solo marco para foto y placa: hairline, esquina de 2 px y la sombra del
// lomo a la izquierda. Sin ese puente, en una misma fila convivían dos
// lenguajes —fotografía y bloque de color— y ninguno ganaba.
const FRAME = "relative overflow-hidden border border-foreground/15 bg-muted";
const SPINE =
  "pointer-events-none absolute inset-y-0 left-0 w-[6%] min-w-[3px] bg-gradient-to-r from-black/25 to-transparent";

export function BookCover({ cover, plate, title, author, size = "md", className }: BookCoverProps) {
  if (cover) {
    return (
      <div className={`${FRAME} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={`Portada de ${title}`} className="size-full object-cover" />
        <div className={SPINE} />
      </div>
    );
  }

  const layout = PLATE_LAYOUT[size];

  return (
    <div style={{ background: plate }} className={`${FRAME} ${className} flex flex-col justify-between ${layout.pad}`}>
      {layout.rule ? <div className="h-px w-8 bg-[#f8f4f4]/50" /> : <span />}
      <div className="flex flex-col gap-1 text-[#f8f4f4]">
        <span
          className={`font-serif ${layout.title} overflow-hidden`}
          style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: layout.lines }}
        >
          {title}
        </span>
        {layout.author && author && (
          <span className="font-sans text-[12px] leading-tight text-[#f8f4f4]/75 truncate">{author}</span>
        )}
      </div>
      <div className={SPINE} />
    </div>
  );
}
