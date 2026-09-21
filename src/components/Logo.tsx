import { cn } from "@/lib/utils";

interface LogoProps {
  /** `ink` para fondos oscuros (el pie): la cinta clara y el «cambio» en terracota claro. */
  tone?: "paper" | "ink";
  className?: string;
  /** Clases del símbolo, para quitarlo en anchos donde no cabe. */
  markClassName?: string;
}

// Dos marcapáginas, uno que baja y otro que sube: das un libro y recibes otro.
// Es el mismo marcapáginas del favicon, y el nombre va en dos mitades —libro en
// tinta, cambio en terracota— como en los titulares del sitio. El tamaño lo
// manda `font-size`: el símbolo mide 1,15 veces el cuerpo de la letra.
export function Logo({ tone = "paper", className, markClassName }: LogoProps) {
  const ink = tone === "ink";

  return (
    <span className={cn("inline-flex items-center gap-[0.32em] font-display font-bold leading-none tracking-[-.02em]", className)}>
      <svg viewBox="4 4 142 182" aria-hidden="true" className={cn("h-[1.15em] w-auto shrink-0", markClassName)}>
        <path d="M6 6 H58 V126 L32 102 L6 126 Z" className={ink ? "fill-primary-soft" : "fill-primary"} />
        <path d="M92 64 L118 88 L144 64 V184 H92 Z" className={ink ? "fill-background" : "fill-accent-foreground"} />
      </svg>
      <span className={ink ? "text-background" : "text-foreground"}>
        Libro<span className={ink ? "text-primary-soft" : "text-primary"}>cambio</span>
      </span>
    </span>
  );
}
