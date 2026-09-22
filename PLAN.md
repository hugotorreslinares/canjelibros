# PLAN — Librocambio

Estado del proyecto y trabajo pendiente. Complementa a [AGENTS.md](AGENTS.md), que describe **cómo está hecho**; aquí va **qué falta y en qué orden**.

Última revisión: 11 de septiembre de 2026 · rama `main`.

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
2. **Reemplazar `moderacion@librocambio.com`** por una dirección real antes de exponer el sitio: hoy la página de políticas promete un canal de correo que ya no es el único — ver #6 más abajo — pero sigue siendo la vía para quien no tiene cuenta.
3. **Ver la presencia en verde.** `lastSeenAt` solo existe para quien haya entrado después del latido; los perfiles antiguos no dicen nada hasta que su dueño vuelva a entrar. Es lo correcto, pero conviene confirmarlo con dos sesiones.
4. **Crear los Puntos Librocambio** (Milenta y Calle 93 con 11) y publicar la regla de `officials/{uid}` (`npx firebase-tools deploy --only firestore:rules`; sin publicarla, la etiqueta no aparece). Pasos en AGENTS.md, sección de `officials/{uid}`. Antes de anunciar el sitio, que cada punto tenga días y horas reales en `spot` y libros que de verdad se puedan entregar.
5. **Publicar las reglas de Firestore de la revisión anterior** (ya hecho el 11 de sept 2026; se deja como registro). `firestore.rules` ganó `completedTrades`, `reports`, la suspensión de cuentas (`readers.suspended`) y el borrado de mensajes por moderación — ninguna de las cuatro funciona en producción hasta correr `npx firebase-tools deploy --only firestore:rules` desde una terminal con sesión iniciada (no lo puede hacer un agente). Sin publicar, el conteo de intercambios cae a cero para todos, reportar da error de permisos y el build de `/libro/[slug]` falla al intentar contar canjes cerrados.

## 3. Backlog priorizado

### P0 — la interfaz afirma cosas que no son ciertas

Al 11 de septiembre de 2026, **cerrado por completo** — sujeto a publicar las reglas nuevas (ver #4 arriba).

| # | Qué | Por qué importa | Nota de implementación |
|---|-----|-----------------|------------------------|
| ~~1~~ | ~~`readers/{uid}.trades` solo sube para quien confirma el canje~~ | **Hecho.** `completedTrades/{id}` guarda los dos participantes de cada canje cerrado (pública, de solo creación, igual que `ratings`); `tradesFor` en `use-app-state.ts` cuenta sobre esa colección en vez de leer el campo. El campo `readers.trades` ya no se escribe ni se lee — mismo tratamiento que tuvo `rating` (#5) | |
| ~~2~~ | ~~`online` se escribe `true` al crear el perfil y nunca cambia~~ | **Hecho.** `lastSeenAt` con latido cada 2 min con la pestaña visible; la presencia se deriva contra una ventana de 5 min y, si nunca hubo latido, no se dice nada | |
| ~~3~~ | ~~"Racha: 4" escrito a mano~~ | **Hecho.** La tarjeta se quitó | |
| ~~4~~ | ~~Las etiquetas de calificación se recogen y se descartan~~ | **Hecho.** Se guardan en `ratings.tags` y se muestran las tres más repetidas en el panel del lector | |
| ~~5~~ | ~~`readers/{uid}.rating` es un `5` legado~~ | **Hecho.** Ya no se escribe ni se lee | |

### P1 — la moderación está a medias

| # | Qué | Nota |
|---|-----|------|
| ~~6~~ | ~~No hay botón de reportar~~ | **Hecho.** `reports/{id}`, creable por cualquier autenticado y legible solo por moderadores. Botón «Reportar» en cada fila del catálogo y en cada mensaje ajeno del chat; una copia del texto del mensaje viaja dentro del reporte, para no tener que abrirle el hilo completo a moderación. Pestaña «Reportes» en el panel, con conteo de abiertos junto a «Publicaciones» |
| ~~7~~ | ~~Moderación solo alcanza libros~~ | **Hecho.** Un moderador puede borrar un mensaje reportado (`allow delete: if isModerator()` en `threads/*/messages`, sin necesitar leer el resto del hilo) y suspender o reactivar una cuenta (`readers.suspended`, el único campo que un moderador puede tocar en el documento de otro lector). Suspendida, una cuenta no puede publicar libros nuevos, proponer canjes ni enviar mensajes — bloqueado en cliente y también en las reglas (`isSuspended()`), para que no dependa solo de la interfaz |
| 8 | La bitácora muestra las últimas 50 entradas, sin paginación real | Se sumó un filtro de texto en cliente sobre esas 50 (11 sept 2026), que cubre el uso de hoy. Paginación real con cursor sigue pendiente para cuando haya volumen |
| 9 | El rol de moderador se otorga creando `moderators/{uid}` a mano en la consola | Aceptable para un equipo de una persona; documentar el procedimiento si entra alguien más |
| ~~14~~ | ~~Sin forma de subir los cupos de un Punto Librocambio que llenó sus 40~~ | **Hecho** (22 sept 2026). `readers.slotOverride`, el único otro campo que un moderador puede tocar en el documento de otro lector; reemplaza al cálculo automático mientras no sea `null`. Control «Ajustar» junto a «Suspender cuenta» en cada fila del panel, para cualquier lector, no solo los oficiales |

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
