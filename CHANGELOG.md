# Changelog

## 2026-10-23 — Rediseño del Back Office (rama `feature/backoffice-rediseno-2026-10-22`)

- Menú lateral con degradé vino y logo blanco; Herramientas desplegable (recuerda el estado); `/administracion` entra en Inicio.
- Inicio nuevo: franja de números, barras de bloques por página, «Mis páginas» que llena la columna, tarjetas con 3 filas y «Ver más». Bienvenida y recorrido guiado.
- Mi perfil (foto, interno; puesto, área y sede por RRHH) en modo lectura con botón Editar. Novedades con «nueva» por persona. Descargas de archivos con sesión.
- Permisos nuevos «Crear novedades» (`novedades.manage`) y «Subir y gestionar descargas» (`descargas.manage`). Tres migraciones aditivas.
- Documentación: `docs/BACKOFFICE.md`.

## 2026-10-22 (2) — Acomodo, franja superior, sesión, tipo de cambio y rojos

- Tarjetas de dos tamaños (hasta 4 links = chica, 5 o más = grande) con acomodo sin huecos (`packGrid`).
- Franja superior de una línea: buscador a la izquierda (sale de la barra lateral) y bloque de sesión a la derecha («Iniciar sesión», o «Back Office» + menú con el nombre y «Salir de sesión»). Se sacaron Back Office y Salir de la barra lateral.
- Tipo de cambio (dólar IATA, BNA y fecha) arriba a la derecha, debajo de los botones de sesión y a la altura del título; en flujo normal por debajo de 1100 px.
- Esquinas redondeadas en todo el portal: Innovación (frentes en filas desplegables, contadores), Mesa de Información (íconos de línea en lugar de emojis, cuadros redondeados), Qrated (banner y categorías con foto).
- Acentos rojos con variables `--red`, `--redsoft`, `--redtext`: ítem activo del menú, línea roja bajo los títulos, íconos de tarjetas y de Innovación, números de accesos rápidos y marca en los títulos de sección. Criterio: rojo para lo activo o tocable.
- Color de marca unificado en `#E3000F`. Los prompts de esta tanda se copiaron a `docs/`.

## 2026-10-22 — Versión "amigable" del rediseño

- Reemplaza el "mix" del 21/10: tarjetas blancas de 16 px sobre fondo `#E2E2DF`, íconos de línea, fuentes del sistema (se sacaron los woff2 de `public/fonts` y los `@font-face`).
- Menú lateral fijo con íconos, «Inicio» primero y dos estados (abierto / barra angosta que se despliega flotando); la elección se recuerda por persona.
- Portada con accesos rápidos en tarjetas y los sectores con foto en blanco y negro (carga diferida). Sin números en ningún lado.
- Pie: «Mantiene … actualizado …» a la derecha con línea de 1 px; teléfono en una línea; sin mail ni logo repetido.
- Páginas de sector: tarjetas del mismo tamaño con ícono según el tema del bloque.
- `Dockerfile`: `apk upgrade` antes de instalar (arregla el error `musl` vs `musl-dev`).

## 2026-10-21 — Rediseño del portal (rama `feature/rediseno-portal-2026-10-21`)

- Diseño "mix" (reemplazado el 22/10 por la versión amigable, ver arriba): fondo gris, título grande, columnas con línea de puntos.
- Se sacó Google Fonts de los layouts del portal, back office y login.
- Se sacaron: números grandes de página y de bloque, rótulo vertical rojo, mail del pie y las temperaturas de las 4 sedes de la portada.
- «Mantiene … actualizado …» pasa a un componente único (`MaintLine`), a la derecha, pegado al pie. Teléfono del pie en una sola línea.
- Editor: renombrar (✎) y reordenar (↑ ↓) bloques. Nuevo `POST portal/groups/{group}/move` con pruebas.
- Contenido: comandos `portal:exportar-contenido` / `portal:importar-contenido` (idempotentes) y foto de producción del 21/10 en `database/content/`. Ver `docs/CONTENIDO_Y_DESPLIEGUE.md`.
- Pendientes documentados: Tipo de Cambio para Tarifario (CPT), auditoría en Configuración.
