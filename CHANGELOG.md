# Changelog

## 2026-10-21 — Rediseño del portal (rama `feature/rediseno-portal-2026-10-21`)

- Diseño: fondo gris `#E2E2DF` en toda la página, título único `clamp(56px,7vw,100px)`, columnas con línea de puntos, animaciones livianas (ver `docs/SISTEMA_DE_DISENO.md`).
- Tipografías Anton, Archivo y Space Mono guardadas en `public/fonts/`; se sacó Google Fonts de los layouts del portal, back office y login.
- Se sacaron: números grandes de página y de bloque, rótulo vertical rojo, mail del pie y las temperaturas de las 4 sedes de la portada.
- «Mantiene … actualizado …» pasa a un componente único (`MaintLine`), a la derecha, pegado al pie. Teléfono del pie en una sola línea.
- Editor: renombrar (✎) y reordenar (↑ ↓) bloques. Nuevo `POST portal/groups/{group}/move` con pruebas.
- Contenido: comandos `portal:exportar-contenido` / `portal:importar-contenido` (idempotentes) y foto de producción del 21/10 en `database/content/`. Ver `docs/CONTENIDO_Y_DESPLIEGUE.md`.
- Pendientes documentados: Tipo de Cambio para Tarifario (CPT), auditoría en Configuración.
