# Changelog

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
