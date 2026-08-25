"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AuthModal } from "./AuthModal";

interface HeaderProps {
  today: string;
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
}

interface NavItem {
  label: string;
  active: boolean;
  go: () => void;
  badge?: number;
}

export function Header({
  today,
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
}: HeaderProps) {
  const { user, logOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = [
    { label: "Mapa", active: isMap, go: goMap },
    { label: "Catálogo", active: isCatalog, go: goCatalog },
    { label: "Mensajes", active: isChat, go: goChat, badge: unread },
    { label: "Mi estante", active: isShelf, go: goShelf },
  ];
  if (isModerator) items.push({ label: "Moderación", active: isModeration, go: goModeration });

  // El estado activo se marca con aria-current además del subrayado: antes solo
  // lo comunicaba el color, que no llega a un lector de pantalla.
  const desktopLink = (item: NavItem) =>
    `bg-transparent border-none px-0 py-1 font-sans text-body border-b-2 transition-colors ${
      item.active ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
    }`;

  const runFromMenu = (go: () => void) => {
    setMenuOpen(false);
    go();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-10 h-16">
          <div className="flex items-baseline gap-5 min-w-0">
            <button
              onClick={goMap}
              className="flex items-center h-11 bg-transparent border-none p-0 font-serif text-[26px] sm:text-[30px] font-semibold tracking-[-.02em] text-foreground"
            >
              El Canje
            </button>
            <span className="font-sans text-label uppercase text-muted-foreground hidden lg:inline">
              Bogotá · {today}
            </span>
          </div>

          <nav aria-label="Principal" className="hidden md:flex items-center gap-6">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.go}
                aria-current={item.active ? "page" : undefined}
                className={desktopLink(item)}
              >
                {item.label}
                {item.badge !== undefined && <span className="text-destructive"> ·{item.badge}</span>}
              </button>
            ))}
            <Button onClick={goPublish}>Publicar libro</Button>
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

          <div className="flex md:hidden items-center gap-2">
            <Button onClick={goPublish} className="px-4">
              Publicar
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
                  {items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => runFromMenu(item.go)}
                      aria-current={item.active ? "page" : undefined}
                      className={`h-12 flex items-center justify-between gap-3 border-b border-border font-sans text-body text-left ${
                        item.active ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-destructive">·{item.badge}</span>
                      )}
                    </button>
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
        reason="Inicia sesión para acceder a tu cuenta de El Canje."
      />
    </>
  );
}
