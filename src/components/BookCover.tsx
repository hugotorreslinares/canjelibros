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
const PLATE_LAYOUT: Record<
  CoverSize,
  { pad: string; corto: string; medio: string; largo: string; lines: number; author: boolean; rule: boolean }
> = {
  sm: { pad: "p-2", corto: "text-[15px]", medio: "text-[12px]", largo: "text-[11px]", lines: 3, author: false, rule: false },
  md: { pad: "p-3", corto: "text-[24px]", medio: "text-[19px]", largo: "text-[15px]", lines: 4, author: true, rule: true },
  lg: { pad: "p-5", corto: "text-[34px]", medio: "text-[27px]", largo: "text-[21px]", lines: 5, author: true, rule: true },
};

// Un cajista no compone «Rayuela» y «El libro negro de la brujería en Colombia»
// en el mismo cuerpo. Con un tamaño fijo, el título corto quedaba perdido en el
// medio de la placa y el largo se recortaba a la tercera palabra.
function cuerpoDelTitulo(titulo: string, layout: (typeof PLATE_LAYOUT)[CoverSize]): string {
  const n = titulo.trim().length;
  if (n <= 14) return layout.corto;
  if (n <= 34) return layout.medio;
  return layout.largo;
}

// Grano de papel: dos tramas finísimas cruzadas, no una imagen. Sin esto la
// placa es un rectángulo de color plano, y junto a una fotografía real se nota
// que es un relleno y no una portada.
const GRANO =
  "pointer-events-none absolute inset-0 opacity-[0.07] " +
  "bg-[repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_3px)," +
  "repeating-linear-gradient(90deg,#fff_0px,#fff_1px,transparent_1px,transparent_4px)]";

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
      <div className={GRANO} />
      {/* El filete doble —macizo y capilar— es la firma de los encabezados del
          sitio. En la placa hace de sello de imprenta y ata las portadas
          compuestas a la marca, en vez de dejarlas como bloques de color. */}
      {layout.rule ? (
        <div className="relative flex flex-col gap-0.5">
          <div className="h-[3px] w-8 bg-[#f8f4f4]/70" />
          <div className="h-px w-8 bg-[#f8f4f4]/70" />
        </div>
      ) : (
        <span />
      )}
      <div className="relative flex flex-col gap-1 text-[#f8f4f4]">
        <span
          className={`font-serif ${cuerpoDelTitulo(title, layout)} leading-[1.1] [text-wrap:balance] overflow-hidden`}
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
