# PLAN — El Canje

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

1. **Republicar `firestore.rules`** en la consola: la última versión agrega `coverOk()` (rechaza portadas que no sean string o pasen de 140 000 caracteres). Sin eso, guardar un libro con foto falla.
2. **Probar la subida de portada** con sesión iniciada: elegir foto, publicar, verificar que aparece en catálogo y mapa, y que "Quitar foto" la borra. Es el único camino de la funcionalidad que no se ha ejercitado contra Firestore real.
3. **Commit de portadas** una vez probado (moderación y políticas ya están en `7e6172c`).
4. **Reemplazar `moderacion@elcanje.co`** por una dirección real antes de exponer el sitio: hoy la página de políticas promete un canal de reporte que no existe.

## 3. Backlog priorizado

### P0 — la interfaz afirma cosas que no son ciertas

| # | Qué | Por qué importa | Nota de implementación |
|---|-----|-----------------|------------------------|
| 1 | `readers/{uid}.trades` solo sube para quien confirma el canje | La otra parte cierra un intercambio y su contador no se mueve; además de eso dependen los cupos del estante | Nadie puede escribir el documento de otro lector sin backend. Salidas: Cloud Function con Admin SDK (exige plan Blaze), o derivar el conteo en cliente contando hilos cerrados, como ya se hace con `rating` |
| 2 | `online` se escribe `true` al crear el perfil y nunca cambia; la UI muestra "en línea ahora" o "visto hace 2 h" | Texto falso en mapa y chat | Guardar `lastSeenAt` con un heartbeat y derivar el estado con un umbral (p. ej. 5 min) |
| 3 | "Racha: 4" está escrito a mano en `ShelfView` | Métrica inventada frente al usuario | Calcularla de los canjes cerrados o quitar la tarjeta |
| 4 | Las etiquetas de calificación (`tagList`) se recogen en el modal y se descartan | El usuario cree que aporta información que nadie guarda | Persistirlas en el documento de `ratings`, o quitar el control |
| 5 | `readers/{uid}.rating` es un `5` legado que nadie actualiza | Confunde a quien lea los datos; la calificación real se promedia desde `ratings` | Dejar de escribirlo en `ensureReaderProfile` |

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
| 14 | Todo el ruteo es estado de cliente: una sola URL | La página de políticas no se puede enlazar ni citar, que es la mitad de para qué sirve un documento legal. Convertir al menos `/politicas` en una ruta real de Next |

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

Antes de dar por completa una funcionalidad, además `npm run build` y una revisión manual en el navegador con el servidor de desarrollo. No decir "probado" sin haber ejercitado el camino real en la aplicación.

## 6. Fuera de alcance

Pagos, envíos, valoración monetaria de los libros, apps nativas y cualquier funcionalidad que convierta el canje en una venta. La aplicación es un intercambio vecinal de ejemplares físicos entre personas que se encuentran en Bogotá.
