"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { friendlyAuthError } from "@/lib/auth-errors";
import { input, linkBtn, modalOverlay, modalPanel, primaryBtn } from "@/lib/ui";

interface AuthModalProps {
  open: boolean;
  reason?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open, reason, onClose, onSuccess }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function withGoogle() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  async function withEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signin") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      onSuccess();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={modalOverlay} onClick={onClose}>
      <div
        className={`${modalPanel} max-w-[440px] px-[34px] py-[32px]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[12px] tracking-[.18em] uppercase text-[#605d5d]">Cuenta</div>
        <h2 className="text-[30px] leading-[1.05] mt-2 mb-2">
          {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
        </h2>
        <p className="text-[16px] leading-[1.5] text-[#444141] mb-[22px]">
          {reason || "Necesitas una cuenta para continuar."}
        </p>

        <button type="button" onClick={withGoogle} disabled={busy} className={`${primaryBtn} w-full mb-[16px]`}>
          Continuar con Google
        </button>

        <div className="flex items-center gap-[12px] mb-[16px] text-[13px] text-[#605d5d]">
          <div className="h-px flex-1 bg-[#201e1d]/16" />
          o con tu correo
          <div className="h-px flex-1 bg-[#201e1d]/16" />
        </div>

        <form onSubmit={withEmail} className="grid gap-[14px]">
          <label className="grid gap-[6px]">
            <span className="text-[14px] text-[#444141]">Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tú@correo.com"
              className={input}
            />
          </label>
          <label className="grid gap-[6px]">
            <span className="text-[14px] text-[#444141]">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={input}
            />
          </label>

          {error && <div className="text-[14px] text-[#aa0b56]">{error}</div>}

          <button type="submit" disabled={busy} className={`${primaryBtn} w-full mt-[4px]`}>
            {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <div className="flex items-center justify-between mt-[20px] pt-[16px] border-t border-[#201e1d]/16">
          <button
            type="button"
            className={linkBtn}
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin" ? "Crear una cuenta nueva" : "Ya tengo cuenta"}
          </button>
          <button type="button" className={linkBtn} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
