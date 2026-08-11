# El Canje

Intercambio de libros usados entre lectores de Bogotá. Implementación en Next.js (App Router) del diseño `design_source/El Canje.dc.html`, con autenticación de Firebase requerida para publicar libros o proponer intercambios.

## Configurar Firebase

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. En **Authentication → Sign-in method**, habilita **Google** y **Correo/contraseña**.
3. En **Configuración del proyecto → Tus apps**, registra una app web y copia sus credenciales.
4. Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

5. En **Authentication → Settings → Authorized domains**, agrega `localhost` (ya suele estar) y el dominio donde despliegues la app.

Sin estas variables, la app carga igual pero los botones de inicio de sesión mostrarán un error explicando que falta configurar Firebase.

## Configurar el mapa (Google Maps)

1. En [Google Cloud Console](https://console.cloud.google.com/google/maps-apis), crea o elige un proyecto y habilita **Maps JavaScript API**.
2. Crea una **API key** (restríngela a tu dominio y a Maps JavaScript API).
3. Opcional: crea un **Map ID** en *Google Maps Platform → Map Management* para poder personalizar el estilo del mapa; si no creas uno, se usa el `DEMO_MAP_ID` público de Google (solo para desarrollo).
4. Agrega los valores a `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
```

Sin `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, la vista de mapa muestra un mapa ilustrativo estático en su lugar.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Qué requiere sesión iniciada

- Publicar un libro (botón "Publicar libro" / "+" en Mi estante).
- Proponer un intercambio (botón "Proponer intercambio" en el mapa o el catálogo).

El resto de la navegación (mapa, catálogo, mensajes de ejemplo) es de solo lectura sin cuenta. Los datos de usuarios, libros y conversaciones son datos de ejemplo en memoria (no hay backend de datos todavía); solo la autenticación está conectada a un servicio real (Firebase).
