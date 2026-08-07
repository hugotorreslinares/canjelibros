"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { linkBtn } from "@/lib/ui";
import { AuthModal } from "./AuthModal";

interface HeaderProps {
  today: string;
  unread: number;
  isMap: boolean;
  isCatalog: boolean;
  isChat: boolean;
  isShelf: boolean;
  goMap: () => void;
  goCatalog: () => void;
  goChat: () => void;
  goShelf: () => void;
  goPublish: () => void;
}

export function Header({
  today,
  unread,
  isMap,
  isCatalog,
  isChat,
  isShelf,
  goMap,
  goCatalog,
  goChat,
  goShelf,
  goPublish,
}: HeaderProps) {
  const { user, logOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const navClass = (active: boolean) =>
    `bg-transparent border-none px-0 py-[4px] text-[17px] border-b-2 transition-colors ${
      active ? "text-[#201e1d] border-[#0088b0]" : "text-[#605d5d] border-transparent"
    }`;

  return (
    <>
      <header className="flex items-center justify-between gap-[30px] px-[24px] sm:px-[40px] py-[14px] border-b border-[#201e1d]/16 flex-wrap">
        <div className="flex items-baseline gap-[20px]">
          <button
            onClick={goMap}
            className="bg-transparent border-none p-0 font-[inherit] text-[26px] sm:text-[30px] font-semibold tracking-[-.02em] text-[#201e1d]"
          >
            El Canje
          </button>
          <span className="text-[12px] tracking-[.16em] uppercase text-[#605d5d] hidden sm:inline">
            Bogotá · {today}
          </span>
        </div>
        <nav className="flex items-center gap-[22px] sm:gap-[26px] text-[17px] flex-wrap">
          <button onClick={goMap} className={navClass(isMap)}>
            Mapa
          </button>
          <button onClick={goCatalog} className={navClass(isCatalog)}>
            Catálogo
          </button>
          <button onClick={goChat} className={navClass(isChat)}>
            Mensajes <span className="text-[#d6006c]">·{unread}</span>
          </button>
          <button onClick={goShelf} className={navClass(isShelf)}>
            Mi estante
          </button>
          <button
            onClick={goPublish}
            className="bg-[#0088b0] text-white border-none rounded-[2px] px-[18px] py-[9px] text-[16px] transition-colors hover:bg-[#1186ac] active:bg-[#006786]"
          >
            Publicar libro
          </button>

          <div className="w-px h-[22px] bg-[#201e1d]/16" />

          {user ? (
            <div className="flex items-center gap-[12px]">
              <span className="text-[14px] text-[#605d5d]">{user.displayName || user.email}</span>
              <button onClick={() => logOut()} className={linkBtn}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button onClick={() => setLoginOpen(true)} className={linkBtn}>
              Iniciar sesión
            </button>
          )}
        </nav>
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
