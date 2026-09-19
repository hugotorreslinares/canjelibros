"use client";

import { useState, type ComponentProps } from "react";
import { useAuth } from "@/lib/auth-context";
import { pathForRoute } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AuthModal } from "./AuthModal";

interface HeaderProps {
  unread: number;
  isMap: boolean;
  isCatalog: boolean;
  isChat: boolean;
  isShelf: boolean;
  isModerator: boolean;
  isModeration: boolean;
  goModeration: () => void;
  goMap: () => void;
  goCatalog: () => void;
  goChat: () => void;
  goShelf: () => void;
  goPublish: () => void;
  /** Destino del enlace «Saltar al contenido»: un ancla de la página actual. */
  skipTo: string;
}

interface NavItem {
  label: string;
  href: string;
  active: boolean;
  go: () => void;
  badge?: number;
}

// Enlace real —se abre en otra pestaña y lo rastrea un buscador— que en un clic
// normal sigue navegando por `go`: un `<Link>` de Next remontaría el árbol y
// perdería filtros y borradores (ver AGENTS.md, «Routing»).
function NavLink({ href, go, ...props }: { href: string; go: () => void } & ComponentProps<"a">) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        go();
      }}
      {...props}
    />
  );
}

export function Header({
  unread,
  isMap,
  isCatalog,
  isChat,
  isShelf,
  isModerator,
  isModeration,
  goModeration,
  goMap,
  goCatalog,
  goChat,
  goShelf,
  goPublish,
  skipTo,
}: HeaderProps) {
  const { user, logOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = [
    { label: "Explorar", href: pathForRoute("catalog"), active: isCatalog, go: goCatalog },
    { label: "Mapa", href: pathForRoute("map"), active: isMap, go: goMap },
    { label: "Mensajes", href: pathForRoute("chat"), active: isChat, go: goChat, badge: unread },
    { label: "Mi estante", href: pathForRoute("shelf"), active: isShelf, go: goShelf },
  ];

  // Moderación vive solo en el menú lateral. Es un destino administrativo que
  // usan dos o tres personas, y como quinto enlace del menú de escritorio
  // ensanchaba la barra hasta montarse encima del logotipo. Por eso un
  // moderador conserva el botón de menú también en escritorio: es su única
  // puerta al panel.
  const menuItems: NavItem[] = isModerator
    ? [...items, { label: "Moderación", href: pathForRoute("moderation"), active: isModeration, go: goModeration }]
    : items;

  // El estado activo se marca con aria-current además del subrayado: antes solo
  // lo comunicaba el color, que no llega a un lector de pantalla.
  const desktopLink = (item: NavItem) =>
    `px-0 py-1 font-sans text-body whitespace-nowrap border-b-2 transition-colors ${
      item.active ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
    }`;

  const runFromMenu = (go: () => void) => {
    setMenuOpen(false);
    go();
  };

  return (
    <>
      {/* Fuera de pantalla hasta que recibe el foco: el primer tabulador del sitio. */}
      <a
        href={skipTo}
        className="fixed left-4 top-3 z-50 -translate-y-[200%] rounded-sm border border-border bg-background px-4 py-3 font-sans text-small text-foreground focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="w-full mx-auto max-w-shell flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-10 h-16 sm:h-17">
          <div className="flex items-baseline min-w-0">
            {/* Dos pasos más pequeños por debajo de 375 px (hasta los 320 px de la
                pauta de reflujo): «Librocambio» a 26 px se
                monta encima de «Publicar libro» y del botón de menú, que ya están en el
                mínimo de 44 px y no pueden ceder ancho. */}
            <NavLink
              href={pathForRoute("catalog")}
              go={goCatalog}
              className="flex items-center h-11 min-h-[44px] shrink-0 whitespace-nowrap font-display text-[18px] min-[340px]:text-[21px] min-[375px]:text-[26px] sm:text-[30px] font-semibold tracking-[-.02em] text-foreground"
            >
              Librocambio
            </NavLink>
          </div>

          {/* Un moderador suma el botón de menú a la derecha, y con separaciones
              de 24px el menú se monta sobre el logotipo a 1024px. Vuelven a 24px
              en xl, donde sí sobra ancho. */}
          <nav aria-label="Principal" className="hidden lg:flex items-center gap-4 xl:gap-6">
            {items.map((item) => (
              <NavLink
                key={item.label}
                href={item.href}
                go={item.go}
                aria-current={item.active ? "page" : undefined}
                className={desktopLink(item)}
              >
                {item.label}
                {!!item.badge && <span className="text-primary-text"> ·{item.badge}</span>}
              </NavLink>
            ))}
            <Button variant="outline" onClick={goPublish}>Publicar libro</Button>
            <Separator orientation="vertical" className="h-6" />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-sans text-small text-muted-foreground max-w-[16ch] truncate">
                  {user.displayName || user.email}
                </span>
                <Button variant="link" onClick={() => logOut()}>
                  Salir
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setLoginOpen(true)}>
                Iniciar sesión
              </Button>
            )}
          </nav>

          <div className={`flex items-center gap-2 ${isModerator ? "" : "lg:hidden"}`}>
            <Button variant="outline" onClick={goPublish} className="px-3 lg:hidden">
              Publicar libro
            </Button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menú">
                  <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
                    <path d="M3 6h16M3 11h16M3 16h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <SheetHeader>
                  <SheetTitle className="font-serif text-title">Menú</SheetTitle>
                </SheetHeader>
                <nav aria-label="Principal" className="flex flex-col px-4 pb-4">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.label}
                      href={item.href}
                      go={() => runFromMenu(item.go)}
                      aria-current={item.active ? "page" : undefined}
                      className={`h-12 flex items-center justify-between gap-3 border-b border-border font-sans text-body text-left ${
                        item.active ? "text-primary-text" : "text-foreground"
                      }`}
                    >
                      <span>{item.label}</span>
                      {!!item.badge && <span className="text-primary-text">·{item.badge}</span>}
                    </NavLink>
                  ))}
                  <div className="pt-6">
                    {user ? (
                      <div className="flex flex-col gap-3">
                        <span className="font-sans text-small text-muted-foreground truncate">
                          {user.displayName || user.email}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMenuOpen(false);
                            logOut();
                          }}
                        >
                          Cerrar sesión
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setMenuOpen(false);
                          setLoginOpen(true);
                        }}
                      >
                        Iniciar sesión
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => setLoginOpen(false)}
        reason="Inicia sesión para acceder a tu cuenta de Librocambio."
      />
    </>
  );
}
