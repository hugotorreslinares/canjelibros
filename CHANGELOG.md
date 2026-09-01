# Changelog

Las entradas a partir de aquí las genera release-please leyendo los commits.
No edites este archivo a mano: se regenera y tu cambio se pierde.

## [0.3.0](https://github.com/hugotorreslinares/canjelibros/compare/v0.2.0...v0.3.0) (2026-09-01)


### Novedades

* eliminar un libro cancela el canje y libera el que te ofrecían ([63b4606](https://github.com/hugotorreslinares/canjelibros/commit/63b46069f8b6b9118fa0868fddbbadabebb52ad3))


### Correcciones

* el catálogo dice que no muestra tus propios libros ([78fb9f3](https://github.com/hugotorreslinares/canjelibros/commit/78fb9f333a7d3060434009362741ea1825a371e1))
* el hero ya no tapa el encabezado al desplazar ([bc7221d](https://github.com/hugotorreslinares/canjelibros/commit/bc7221d68cb44589c85729816806894c427bf74c))
* la maquetación deja de depender del tamaño de letra del navegador ([03c58d3](https://github.com/hugotorreslinares/canjelibros/commit/03c58d309cb3320888ffda180a6c386c5ddac2fd))

## [0.2.0](https://github.com/hugotorreslinares/canjelibros/compare/v0.1.1...v0.2.0) (2026-08-31)


### Novedades

* añade un hero a la portada ([2af43a4](https://github.com/hugotorreslinares/canjelibros/commit/2af43a426f77f808ca2e40488c3ce8dfb7d7503c))
* el catálogo pasa a ser la portada ([d0a6421](https://github.com/hugotorreslinares/canjelibros/commit/d0a6421cd6494143b62a0f31ce9821ac371e1d3e))


### Correcciones

* aprieta el hero en móvil para que asomen los libros ([9bf0919](https://github.com/hugotorreslinares/canjelibros/commit/9bf0919769120c1bf917f6d1e24604172d211248))
* limita el ancho del contenido en pantallas grandes ([1030b35](https://github.com/hugotorreslinares/canjelibros/commit/1030b35145d2f9cc5ecbceee8f8cd5f8f9bcb4bb))

## [0.1.1](https://github.com/hugotorreslinares/canjelibros/compare/v0.1.0...v0.1.1) (2026-08-28)


### Correcciones

* el mapa ya no tapa el menú lateral en móvil ([d6d1fd1](https://github.com/hugotorreslinares/canjelibros/commit/d6d1fd13b336ed3d8dd6347061523e8a1e65e995))

## 0.1.0 — línea base (27 de agosto de 2026)

Estado de la aplicación cuando se adoptó el versionado. Los commits anteriores
a esta fecha no siguen Conventional Commits, así que no aparecen desglosados.

### Novedades

- Mapa de lectores en Bogotá con agrupación de pines por cercanía en pantalla.
- Catálogo con filtros por categoría y estado, y diez recomendaciones ordenadas
  por los intereses del lector. Los libros reservados se marcan y no se ofrecen.
- Estante propio: publicar, editar y eliminar libros, con foto de portada del
  ejemplar tomada por el lector.
- Propuestas de canje con conversación por hilo, cierre del trato con
  intercambio real de dueños y calificación entre las dos partes.
- Panel de moderación para editar o eliminar cualquier libro, con motivo
  obligatorio y bitácora de auditoría que nadie puede alterar.
- Página de políticas del sitio.
- Sistema de diseño «Papel y tinta»: seis pasos de tipografía, rejilla de 4 px,
  color solo por tokens y 44 px mínimos en todo lo pulsable.
- Una URL propia por vista, con 404 real en rutas desconocidas.
- Metadatos, JSON-LD, sitemap, robots, imagen para compartir y `llms.txt`.
- Íconos de la aplicación y manifest para instalar en pantalla de inicio.

### Limitaciones conocidas

- El catálogo se lee desde el navegador, así que el HTML servido no lleva
  libros: ningún buscador ni modelo ve el contenido real.
- `readers/{uid}.trades` solo aumenta para quien confirma el canje; la otra
  parte no se incrementa sin un backend.
- `moderacion@librocambio.com` es un buzón que todavía no existe.
- Nada detrás de autenticación se ha probado de extremo a extremo.
