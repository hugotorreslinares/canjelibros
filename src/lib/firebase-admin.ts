import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase con privilegios de administrador — solo para el servidor, nunca se
 * importa desde un componente de cliente. Hoy lo usa un único endpoint
 * (`/api/notify-message`) para leer el correo de quien recibe un mensaje, algo
 * que las reglas de Firestore no dejan hacer al propio remitente.
 *
 * Solo `firebase-admin/firestore`, no `firebase-admin/auth`: ese módulo
 * arrastra `jwks-rsa` → `jose`, cuya build ESM no carga bajo el `require()`
 * nativo que usa Next para los paquetes externos (`ERR_REQUIRE_ESM` en
 * producción). El correo del destinatario se guarda aparte, en
 * `readerEmails/{uid}` (ver `ensureReaderProfile`), así que no hace falta
 * Admin Auth para nada.
 *
 * El proyecto es el mismo de siempre (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, no es
 * secreto); lo que falta es una cuenta de servicio — Consola de Firebase →
 * Configuración del proyecto → Cuentas de servicio → Generar nueva clave
 * privada — cuyos `client_email` y `private_key` van en variables de entorno
 * del servidor. Sin ellas, `isFirebaseAdminConfigured` es `false` y el
 * endpoint no hace nada: el resto del sitio sigue sin necesitar esto.
 *
 * Este módulo se evalúa durante el build (Next ejecuta la ruta para recoger
 * su configuración), así que una clave con un formato inválido no puede
 * lanzar sin más: tumbaría el build entero, no solo este endpoint. `cert()`
 * va en un try/catch — si falla, `adminDb` queda en `null` como si faltaran
 * las variables, y el build sigue.
 */
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
// Vercel guarda los saltos de línea de la clave como `\n` literal.
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isFirebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey);

const ADMIN_APP_NAME = "librocambio-admin";

function initAdminApp(): App | null {
  if (!isFirebaseAdminConfigured) return null;
  const existing = getApps().find((a) => a.name === ADMIN_APP_NAME);
  if (existing) return existing;
  try {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }, ADMIN_APP_NAME);
  } catch (err) {
    console.error("no se pudo iniciar Firebase admin — revisa FIREBASE_ADMIN_PRIVATE_KEY", err);
    return null;
  }
}

const app = initAdminApp();

export const adminDb: Firestore | null = app ? getFirestore(app) : null;
