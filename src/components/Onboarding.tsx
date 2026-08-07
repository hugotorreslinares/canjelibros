import { outlineBtn, primaryBtn } from "@/lib/ui";

interface OnboardingProps {
  allowLocation: () => void;
}

export function Onboarding({ allowLocation }: OnboardingProps) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:[grid-template-columns:minmax(420px,1fr)_minmax(320px,0.7fr)] gap-[60px] px-[60px] pt-[50px] pb-[40px] items-start">
      <div className="max-w-[720px]">
        <div className="flex items-baseline gap-[15px] text-[13px] tracking-[.16em] uppercase text-[#605d5d]">
          <span>Bogotá</span>
          <span>·</span>
          <span>Edición del lector</span>
          <span>·</span>
          <span>Nº 001</span>
        </div>
        <div className="h-[6px] bg-[#201e1d] mt-[10px] mb-[3px]" />
        <div className="h-px bg-[#201e1d] mb-[20px]" />
        <h1 className="text-[64px] lg:text-[96px] leading-[.92] tracking-[-.03em] mb-[20px] font-semibold [text-wrap:pretty]">
          El Canje
        </h1>
        <p className="text-[22px] lg:text-[27px] leading-[1.34] mb-[30px] max-w-[20em] [text-wrap:pretty]">
          El conocimiento es libertad. No se compra: se pasa de mano en mano, en la esquina de siempre, a las siete
          de la tarde.
        </p>
        <p className="text-[17px] leading-[1.6] text-[#444141] max-w-[34em] mb-[15px] [text-wrap:pretty]">
          Cinco libros en tu estante para empezar. Cada intercambio que completes te abre un cupo más: quien más
          comparte, más muestra.
        </p>
        <p className="text-[17px] leading-[1.6] text-[#444141] max-w-[34em] mb-[40px] [text-wrap:pretty]">
          Para verte con quien tienes cerca necesitamos una idea de dónde estás. Nunca tu dirección: una zona
          difusa de 600 metros, y el punto de encuentro lo eliges tú.
        </p>
        <div className="flex flex-wrap gap-[15px] items-center">
          <button onClick={allowLocation} className={primaryBtn}>
            Compartir mi zona aproximada
          </button>
          <button onClick={allowLocation} className={outlineBtn}>
            Marcarla yo en el mapa
          </button>
        </div>
        <p className="text-[14px] text-[#605d5d] mt-[25px]">
          Sin publicidad, sin venta de datos, sin precios. Solo libros usados que ya leyó alguien.
        </p>
      </div>
      <div className="pt-0 lg:pt-[60px]">
        <div className="text-[12px] tracking-[.18em] uppercase text-[#605d5d] mb-[15px]">En circulación hoy</div>
        <div className="grid gap-[20px]">
          <div>
            <div className="text-[54px] leading-none text-[#0088b0]">1.284</div>
            <div className="text-[15px] text-[#444141]">libros en estantes de Bogotá</div>
          </div>
          <div>
            <div className="text-[54px] leading-none text-[#d6006c]">317</div>
            <div className="text-[15px] text-[#444141]">intercambios cerrados este mes</div>
          </div>
          <div>
            <div className="text-[54px] leading-none">0</div>
            <div className="text-[15px] text-[#444141]">pesos que cambiaron de manos</div>
          </div>
        </div>
        <p className="text-[17px] leading-[1.5] italic mt-[40px] border-t border-[#201e1d]/16 pt-[20px] max-w-[20em]">
          «Cambié un García Márquez por un libro de botánica y ahora tengo un huerto en la terraza.»
          <span className="block not-italic text-[14px] text-[#605d5d] mt-[8px]">
            Diana P. — Teusaquillo, 9 intercambios
          </span>
        </p>
      </div>
    </div>
  );
}
