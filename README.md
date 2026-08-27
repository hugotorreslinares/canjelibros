# Librocambio

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

## Configurar Firestore (base de datos)

Los lectores y sus libros se guardan en Firestore, en el mismo proyecto de Firebase de arriba (no requiere variables de entorno adicionales).

1. En la [consola de Firebase](https://console.firebase.google.com/) → **Build → Firestore Database → Create database**. Elige modo producción y la región que prefieras. **Este paso es obligatorio**: si no se crea la base de datos, el mapa/catálogo/estante quedan vacíos y la consola del navegador muestra `Database '(default)' not found`.
2. Publica las reglas de seguridad de [`firestore.rules`](firestore.rules) (pestaña **Reglas** en Firestore, o `firebase deploy --only firestore:rules` si usas la CLI). **Si ya las habías publicado antes, vuelve a pegarlas** — cambiaron (se agregó `ratings` y la condición para transferir libros al cerrar un canje). Resumen: cualquiera puede leer lectores/libros/calificaciones; cada usuario solo puede escribir su propio perfil (`readers/{uid}`) y sus propios libros (`books` con `ownerId == uid`), salvo para reclamar un libro que quedó reservado a su nombre (necesario para que el intercambio transfiera el libro al cerrar).
3. Colecciones que crea la app automáticamente (no hace falta crearlas a mano):
   - `readers/{uid}`: perfil del lector (nombre, barrio, lat/lng, bio, punto de encuentro, intercambios). Se crea la primera vez que alguien inicia sesión, con su ubicación real (si da permiso de geolocalización) o el centro de Bogotá.
   - `books/{bookId}`: cada libro publicado (`ownerId`, título, autor, categoría, estado, descripción, `resUid` si está reservado para un intercambio).
   - `threads/{threadId}`: una conversación por par de lectores (`threadId` = sus dos uids ordenados y unidos con `_`), con `participants`, `fromUid`/`toUid` (quién propuso, quién recibe), `fromBookId`/`toBookId` (qué libro pone cada quien), `dealText`, `lastMessage`, `closed`. Solo los dos participantes pueden leer/escribir.
   - `threads/{threadId}/messages/{messageId}`: mensajes de esa conversación (`senderId`, `text`, `createdAt`), mismo control de acceso que el hilo.
   - `ratings/{ratingId}`: una calificación (`raterUid`, `ratedUid`, `stars`). Cualquiera puede leer; solo se puede crear la propia (nunca editar ni borrar). La calificación que se ve en el perfil de un lector es el promedio de sus `ratings`, calculado en el cliente — no un campo que alguien más pueda sobreescribir en su perfil.

## Mapa

La vista de mapa usa [Leaflet](https://leafletjs.com/) con tiles de [OpenStreetMap](https://www.openstreetmap.org/copyright): no requiere API key ni cuenta de facturación. Los pines usan las coordenadas reales de cada barrio en Bogotá.

Para producción con más tráfico, conviene revisar la [política de uso de tiles de OSM](https://operations.osmfoundation.org/policies/tiles/) y considerar un proveedor con capa gratuita más generosa (por ejemplo MapTiler o Stadia Maps) cambiando la URL del `TileLayer` en [src/components/LeafletMap.tsx](src/components/LeafletMap.tsx).

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Qué requiere sesión iniciada

- Publicar un libro (botón "Publicar libro" / "+" en Mi estante).
- Proponer un intercambio (botón "Proponer intercambio" en el mapa o el catálogo).

El resto de la navegación (mapa, catálogo) es de solo lectura sin cuenta.

## Qué es real y qué sigue siendo de ejemplo

Todo lo relevante para el uso real de la app ya está en Firestore: perfiles de lectores, libros (publicar/editar/eliminar/reservar), conversaciones y mensajes, y el cierre de un intercambio. Nada de esto se pierde al recargar ni depende de quién sigue con sesión abierta en la pestaña.

Cómo se cierra un intercambio: solo quien **recibió** la propuesta puede pulsar "Marcar intercambio como realizado" (quien propuso no ve ese botón). Al confirmarlo: el libro que ofreció quien propuso pasa al estante de quien recibió, el libro pedido pasa al estante de quien propuso, se guarda una calificación real (`ratings`) a nombre de quien propuso, y sube en 1 el contador de intercambios de quien confirma.

Limitación conocida: el contador de intercambios (`readers/{uid}.trades`) solo sube para quien confirma el cierre, no para ambas partes — cada usuario solo puede escribir su propio documento en Firestore, así que no hay forma de que quien confirma le sume un intercambio a la otra persona sin un backend con permisos de administrador (fuera del alcance actual).
