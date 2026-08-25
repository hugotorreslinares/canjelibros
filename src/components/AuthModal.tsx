"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { friendlyAuthError } from "@/lib/auth-errors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  reason?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const fieldClass =
  "border border-input rounded-sm bg-card px-3.5 py-3 font-serif text-body text-foreground w-full outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 placeholder:text-placeholder";

export function AuthModal({ open, reason, onClose, onSuccess }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-8">
        <DialogHeader>
          <p className="font-sans text-label uppercase text-muted-foreground">Cuenta</p>
          <DialogTitle className="font-serif text-title">
            {mode === "signin" ? "Inicia sesión" : "Crea tu cuenta"}
          </DialogTitle>
          <DialogDescription className="font-serif text-body text-foreground/85">
            {reason || "Necesitas una cuenta para continuar."}
          </DialogDescription>
        </DialogHeader>

        <Button type="button" onClick={withGoogle} disabled={busy} size="lg" className="w-full">
          Continuar con Google
        </Button>

        <div className="flex items-center gap-3 font-sans text-small text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          o con tu correo
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={withEmail} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-small text-foreground/85">Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tú@correo.com"
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-small text-foreground/85">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={fieldClass}
            />
          </label>

          {error && (
            <Alert variant="destructive" className="p-3">
              <AlertDescription className="font-serif text-small">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={busy} size="lg" className="w-full mt-1">
            {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
          </Button>
        </form>

        {/* Solo una salida secundaria: cerrar ya lo resuelven la X, Escape y el
            clic fuera, así que «Cancelar» no compite con cambiar de modo. */}
        <DialogFooter className="border-t border-border pt-4 sm:justify-start">
          <Button
            type="button"
            variant="link"
            className="px-0"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin" ? "Crear una cuenta nueva" : "Ya tengo cuenta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
