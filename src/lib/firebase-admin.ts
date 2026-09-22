import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase con privilegios de administrador — solo para el servidor, nunca se
 * importa desde un componente de cliente. Hoy lo usa un único endpoint
 * (`/api/notify-message`) para leer el correo de quien recibe un mensaje, algo
 * que las reglas de Firestore no dejan hacer al propio remitente.
 *
 * El proyecto es el mismo de siempre (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, no es
 * secreto); lo que falta es una cuenta de servicio — Consola de Firebase →
 * Configuración del proyecto → Cuentas de servicio → Generar nueva clave
 * privada — cuyos `client_email` y `private_key` van en variables de entorno
 * del servidor. Sin ellas, `isFirebaseAdminConfigured` es `false` y el
 * endpoint no hace nada: el resto del sitio sigue sin necesitar esto.
 */
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// Vercel guarda los saltos de línea de la clave como `\n` literal.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isFirebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey);

const ADMIN_APP_NAME = "librocambio-admin";

const app: App | null = isFirebaseAdminConfigured
  ? (getApps().find((a) => a.name === ADMIN_APP_NAME) ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, ADMIN_APP_NAME))
  : null;

export const adminDb: Firestore | null = app ? getFirestore(app) : null;
export const adminAuth: Auth | null = app ? getAuth(app) : null;
