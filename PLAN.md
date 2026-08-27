# PLAN — Librocambio

Estado del proyecto y trabajo pendiente. Complementa a [AGENTS.md](AGENTS.md), que describe **cómo está hecho**; aquí va **qué falta y en qué orden**.

Última revisión: 25 de agosto de 2026 · rama `feat/interests-recommendations`.

## 1. Estado actual

Funciona de punta a punta contra Firestore, sin backend propio:

- Mapa con lectores reales y geolocalización, catálogo con filtros y recomendados por intereses.
- Publicar, editar y eliminar libros del propio estante, con cupos ligados a intercambios cerrados.
- Propuesta de canje, hilo de chat por pareja de lectores, cierre del canje con intercambio real de dueño de ambos libros y calificación.
- Portada opcional por libro: foto propia, reducida a 520 px y guardada como data URL dentro del documento.
- Panel de moderación: editar o eliminar cualquier publicación, con motivo obligatorio y bitácora append-only.
- Página pública de políticas del sitio.

Autenticación con Firebase (Google y correo). Solo publicar/editar/eliminar y proponer canje exigen sesión; navegar es abierto.

## 2. Pendiente inmediato

1. **Recorrer la aplicación con sesión iniciada.** Todo el rediseño (fases 0 a 9 de [UI-PLAN.md](UI-PLAN.md)) se verificó vista por vista en el navegador, pero **sin cuenta**: estante, publicar, mensajes y moderación se comprobaron por código, por piezas sueltas o con datos de prueba. El recorrido que falta es publicar → proponer → chatear → confirmar canje → calificar, y moderar un libro.
2. **Reemplazar `moderacion@librocambio.com`** por una dirección real antes de exponer el sitio: hoy la página de políticas promete un canal de reporte que no existe.
3. **Ver la presencia en verde.** `lastSeenAt` solo existe para quien haya entrado después del latido; los perfiles antiguos no dicen nada hasta que su dueño vuelva a entrar. Es lo correcto, pero conviene confirmarlo con dos sesiones.

## 3. Backlog priorizado

### P0 — la interfaz afirma cosas que no son ciertas

Al 25 de agosto de 2026 queda **solo el punto 1**: los demás se cerraron junto con el trabajo de interfaz.

| # | Qué | Por qué importa | Nota de implementación |
|---|-----|-----------------|------------------------|
| 1 | `readers/{uid}.trades` solo sube para quien confirma el canje | La otra parte cierra un intercambio y su contador no se mueve; además de eso dependen los cupos del estante | Nadie puede escribir el documento de otro lector sin backend. Salidas: Cloud Function con Admin SDK (exige plan Blaze), o derivar el conteo en cliente contando hilos cerrados, como ya se hace con `rating` |
| ~~2~~ | ~~`online` se escribe `true` al crear el perfil y nunca cambia~~ | **Hecho.** `lastSeenAt` con latido cada 2 min con la pestaña visible; la presencia se deriva contra una ventana de 5 min y, si nunca hubo latido, no se dice nada | |
| ~~3~~ | ~~"Racha: 4" escrito a mano~~ | **Hecho.** La tarjeta se quitó | |
| ~~4~~ | ~~Las etiquetas de calificación se recogen y se descartan~~ | **Hecho.** Se guardan en `ratings.tags` y se muestran las tres más repetidas en el panel del lector | |
| ~~5~~ | ~~`readers/{uid}.rating` es un `5` legado~~ | **Hecho.** Ya no se escribe ni se lee | |

### P1 — la moderación está a medias

| # | Qué | Nota |
|---|-----|------|
| 6 | No hay botón de reportar | Las políticas mandan a un correo. Falta `reports/{id}`: creable por cualquier autenticado, legible solo por moderadores, y una pestaña de cola en el panel |
| 7 | Moderación solo alcanza libros | Los mensajes de chat son el otro lugar donde puede aparecer contenido prohibido, y las reglas los hacen inmutables. Tampoco hay forma de suspender una cuenta reincidente, que es justo lo que las políticas prometen |
| 8 | La bitácora muestra las últimas 50 entradas, sin paginación ni filtro | Suficiente hoy; se queda corta apenas haya volumen |
| 9 | El rol de moderador se otorga creando `moderators/{uid}` a mano en la consola | Aceptable para un equipo de una persona; documentar el procedimiento si entra alguien más |

### P2 — escala y deuda

| # | Qué | Cuándo actuar |
|---|-----|---------------|
| 10 | Las portadas viajan dentro de cada snapshot de `books` | Al pasar de unos cientos de libros. Mover a Storage o un CDN implica cuenta de facturación (ver §4) |
| 11 | `subscribeBooks` y `subscribeReaders` traen la colección completa, sin límite ni paginación; el filtro de distancia es de cliente | Mismo umbral que el anterior. Requiere consultas geográficas reales, no un filtro post-lectura |
| 12 | No hay suite de pruebas | Antes de que toque el flujo de canje alguien que no escribió ese código. Los candidatos naturales son `diffBook`, `fileToCoverDataUrl` y el cálculo de cupos |
| 13 | Las reglas no se despliegan desde el repo | Cada cambio en `firestore.rules` exige publicar a mano; el repo y la consola pueden divergir sin que nada avise. Instalar Firebase CLI y `firebase deploy --only firestore:rules` lo cierra |

## 4. Restricciones que condicionan el diseño

- **Sin backend.** No hay Admin SDK ni Cloud Functions, así que toda regla de negocio que exija escribir datos ajenos está bloqueada (de ahí el P0 #1 y la calificación promediada en cliente).
- **Plan gratuito.** Desde febrero de 2026 un bucket de Cloud Storage exige cuenta de facturación aunque no se gaste nada; por eso las portadas van dentro del documento del libro y hay un tope de tamaño en las reglas.
- **Derechos de imagen.** La portada debe ser una foto tomada por el propio lector. No se buscan imágenes en bancos gratuitos: no dan la tapa real del libro, y las fuentes que sí la dan (Open Library) no declaran licencia. La verificación es reactiva, vía moderación.
- **Reglas publicadas a mano.** Cualquier cambio en `firestore.rules` dentro de un diff hay que anunciarlo: nada se despliega solo.

## 5. Cómo se verifica

No hay pruebas automatizadas. Antes de dar por terminado un cambio:

```bash
npx tsc --noEmit && npx eslint .
```

Las dos herramientas necesitan **Node ≥ 20**; con el v14 que a veces queda por defecto en esta máquina ni siquiera arranca `next dev`.

Antes de dar por completa una funcionalidad, además `npm run build` y una revisión manual en el navegador con el servidor de desarrollo. No decir "probado" sin haber ejercitado el camino real en la aplicación.

## 6. Fuera de alcance

Pagos, envíos, valoración monetaria de los libros, apps nativas y cualquier funcionalidad que convierta el canje en una venta. La aplicación es un intercambio vecinal de ejemplares físicos entre personas que se encuentran en Bogotá.
