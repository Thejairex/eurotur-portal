# Back Office — rediseño (octubre 2026)

Rama: `feature/backoffice-rediseno-2026-10-22`. Pedido original: «Prompt para Code - Back Office (2026-10-22)». Este documento cubre las fases 1 y 2 (hechas) y deja el diseño de lo que sigue.

## Qué hay hoy

| Pantalla | Ruta | Quién la ve |
|---|---|---|
| Inicio | `/administracion/inicio` (`admin.inicio`) | todas las personas con sesión en el Back Office |
| Mi perfil | `/administracion/perfil` | cada persona edita el suyo |
| Perfil de otra persona | `/administracion/usuarios/{user}/perfil` | `users.manage` |
| Novedades | `/administracion/novedades` | todas leen; crean/editan/borran con `novedades.manage` |
| Descargas | `/administracion/descargas` | todas bajan; suben/renombran/borran con `descargas.manage` |
| Herramientas | `/administracion/crm` + cada herramienta | según el permiso de cada una |
| Configuración | Usuarios, Roles, etc. | según permisos (sin cambios) |

`/administracion` redirige a `inicio` (antes caía en Usuarios). «Editar páginas» e «Historial» aparecen en el menú como «pronto» y «en planeación».

### Inicio
Saludo, franja de 4 números (páginas a cargo, bloques y links, novedades sin leer, días desde el último cambio), perfil, barras de bloques por página, «Mis páginas» (llena el alto de la columna; el resto con «Ver las N restantes»), y tarjetas de Novedades, Descargas y Herramientas con 3 filas y «Ver más». Todo sale de datos reales; no hay cifras inventadas. Las estadísticas de uso (visitas, clics) no existen porque el portal no las registra.

### Menú lateral
Degradé vino, logo blanco (`public/img/eurotur-logo-blanco.webp`). Herramientas es desplegable y recuerda el estado en el navegador (`localStorage`, clave `bo-tools-open`; si no hay elección guardada se abre sola al estar dentro de una herramienta). Configuración también se pliega. Bienvenida (una vez por sesión del navegador, `sessionStorage` `bo-welcome-shown`) y recorrido guiado (`onboarding-tour`) que arranca recién al cerrar la bienvenida.

## Permisos
Definidos en `App\Enums\Permission` y sincronizados a la base por `RolePermissionSeeder` al arrancar. Administrador los tiene todos.

- `novedades.manage` — **«Crear novedades»**
- `descargas.manage` — **«Subir y gestionar descargas»**

Se asignan por rol en Configuración → Roles. Para que solo algunas personas creen novedades: crear un rol (por ejemplo «Publica novedades») con ese permiso y asignarlo a esas personas.

## Datos y archivos
- Migraciones (todas aditivas): `2026_10_22_150000_add_profile_fields_to_users_table` (foto, puesto, área, sede, interno), `..._150100_create_novedades_tables` (`novedades`, `novedad_lecturas`, con 4 novedades iniciales), `..._150200_create_descargas_table`.
- Modelos: `Novedad`, `Descarga`; campos nuevos documentados en `User`.
- «Nueva» en una novedad = esa persona todavía no la leyó (`novedad_lecturas`). Al abrir Novedades se marcan leídas.
- Fotos de perfil: disco `public`, carpeta `perfiles/`. El navegador recorta y reduce a 400 px WebP (`resources/js/lib/resize-image.ts`); el servidor valida tipo, ≤ 512 KB y 64–600 px.
- Descargas: disco privado `local`; se bajan solo con sesión por `descargas/{id}/archivo` con `nosniff`.
- Puesto, área y sede los cambia RRHH (`users.manage`); cada persona cambia foto e interno. El mail es el del usuario y no se edita.

## Sistema de diseño del Back Office
Variables bajo `.eurotur-backoffice` (claro) y `.dark .eurotur-backoffice` (oscuro), en `resources/css/app.css`:

| Variable | Uso | Claro | Oscuro |
|---|---|---|---|
| `--bo-bg` | fondo de página | gris claro | gris oscuro |
| `--background` | superficie de tarjeta | blanco | gris más claro que el fondo |
| `--bo-red` | acento, activo, tocable | `#E3000F` | `#E3000F` |
| `--bo-redsoft` | fondo suave del acento | `#fbedee` | `#3a1a1d` |
| `--bo-soft` | campos y pistas | `#f4f4f2` | `#2a2a2d` |
| `--bo-side-from/to` | degradé del menú | `#a30010 → #5c0008` | `#7a0008 → #3d0005` |

Reglas: tarjetas blancas de esquinas redondeadas; el rojo solo para lo activo o tocable y para detalles (filete izquierdo de las tarjetas con acento, íconos); los colores de los números del Inicio son decorativos (`bo-tone-*`: rojo, vino, ámbar, gris azulado, con versión oscura). Solo se animan `transform` y `opacity`; se respeta `prefers-reduced-motion`. Solo fuentes del sistema. Clases base: `.bo-app`, `.bo-aside`, `.bo-link`, `.bo-card`, `.bo-stat`, `.bo-row`, `.bo-more`.

El portal es solo de escritorio (se entra por VPN, no hay uso desde celular), así que no se invirtió en diseño móvil.

## Guía corta para quien administra
- **Cargar una novedad:** Novedades → «Publicar una novedad» (fecha, título, texto) → Publicar. Se ve como «NUEVA» para cada persona hasta que la lee. Se edita con el lápiz y se borra con el tacho (pide confirmar).
- **Dar o quitar el permiso de crear novedades:** Roles → elegir el rol → marcar o desmarcar «Crear novedades».
- **Subir un archivo para todos:** Descargas → elegir archivo → nombre visible → Subir. Se renombra o se borra desde la misma lista.
- **Corregir puesto, área o sede de alguien:** Usuarios → abrir el perfil de la persona.

## Pendiente de diseño (no implementado)
- **Auditoría / Historial:** tabla `portal_audit_log` (quién, qué, cuándo, antes/después) alimentada desde el editor de páginas, Usuarios/Roles y novedades/descargas. La pantalla «Historial» y la tarjeta «Actividad reciente» ya existen como espacio reservado.
- **Editor de páginas dentro del Back Office (fase 3):** depende de que se integre la rama `feature/rediseno-portal-2026-10-21`, que ya trae renombrar y reordenar bloques.
- **Organigrama (fase 4):** el correo queda de solo lectura en el perfil. Solo se sincroniza con el organigrama cuando RRHH cargue datos reales, y el aviso «Conectado con el organigrama» aparece solo si la sincronización funciona de verdad.

## Despliegue
Siempre primero preprod (ver `README.md`). Hoy la rama de preprod es `integracion-preprod` (rediseño del portal + Back Office). Al pasar a producción: respaldar la base (3 migraciones nuevas), integrar en `main` en orden y repetir el cambio del botón del `portal-layout` (Back Office → Inicio).
