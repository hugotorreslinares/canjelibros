import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

const EXPLORAR: FooterLink[] = [
  { label: "Catálogo", href: "/" },
  { label: "Mapa de lectores", href: "/mapa" },
  { label: "Mi estante", href: "/estante" },
  { label: "Mensajes", href: "/mensajes" },
];

const REGLAS: FooterLink[] = [
  { label: "Políticas del sitio", href: "/politicas" },
  { label: "Puntos Librocambio", href: "/mapa" },
];

// El orden es real —no se propone un canje sin un libro publicado, ni se acuerda
// el encuentro sin propuesta—, así que aquí sí va numerado.
const PASOS = [
  "Publica un libro que ya leíste.",
  "Propón un canje: libro por libro.",
  "Acuerden por mensaje un lugar público.",
];

// Los enlaces heredan `a { @apply text-primary-text }` del CSS base, que sobre
// tinta no se lee: cada uno fija su color, y el hover base (magenta, para lo
// destructivo) tampoco es de este bloque.
const LINK =
  "flex h-11 min-h-[44px] items-center font-sans text-small text-background/80 underline-offset-4 hover:text-background hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-soft";

function LinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-sans text-label uppercase text-background/60 m-0">{title}</h2>
      <ul className="list-none m-0 mt-2 p-0">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className={LINK}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Tinta sobre papel: el pie cierra la página con el color de la letra, y el
// terracota claro queda para el filete y el foco. Todo sale de tokens, así que
// sigue funcionando si algún día se activa el tema oscuro.
export function Footer() {
  return (
    <footer className="mt-auto bg-foreground text-background">
      <div className="w-full mx-auto max-w-shell px-6 sm:px-10 pt-12 pb-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-x-12">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="h-0.5 w-12 bg-primary-soft mb-4" />
            <p className="font-display text-title m-0">Librocambio</p>
            <p className="font-serif text-body text-background/80 mt-3 mb-0 max-w-[30ch]">
              Intercambio vecinal de libros en Bogotá. Sin dinero, sin publicidad.
            </p>
          </div>

          <LinkList title="Explorar" links={EXPLORAR} />
          <LinkList title="Reglas" links={REGLAS} />

          <div className="col-span-2 sm:col-span-1">
            <h2 className="font-sans text-label uppercase text-background/60 m-0">Cómo funciona</h2>
            <ol className="m-0 mt-3 grid gap-3 p-0 list-none">
              {PASOS.map((paso, i) => (
                <li key={paso} className="grid grid-cols-[1.5rem_minmax(0,1fr)] font-serif text-body text-background/80">
                  <span className="font-sans text-small text-primary-soft" aria-hidden="true">
                    {i + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-background/20 pt-5 font-sans text-small text-background/70">
          <span>Librocambio · Bogotá, Colombia</span>
          <span>Los canjes son entre lectores: el sitio no cobra ni intermedia pagos.</span>
        </div>
      </div>
    </footer>
  );
}
