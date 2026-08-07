import { FirebaseError } from "firebase/app";
import { FirebaseNotConfiguredError } from "./firebase";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "Ese correo no parece válido.",
  "auth/user-not-found": "No hay ninguna cuenta con ese correo.",
  "auth/wrong-password": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicia sesión.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
  "auth/invalid-api-key": "Firebase no está configurado todavía. Revisa las variables NEXT_PUBLIC_FIREBASE_* en .env.local.",
  "auth/configuration-not-found": "Falta habilitar el método de acceso en la consola de Firebase.",
  "auth/network-request-failed": "Fallo de red. Revisa tu conexión e intenta de nuevo.",
};

export function friendlyAuthError(err: unknown): string | null {
  if (err instanceof FirebaseNotConfiguredError) return err.message;
  if (err instanceof FirebaseError) {
    if (err.code in MESSAGES) return MESSAGES[err.code] || null;
    return "No se pudo completar el inicio de sesión. Intenta de nuevo.";
  }
  return "No se pudo completar el inicio de sesión. Intenta de nuevo.";
}
