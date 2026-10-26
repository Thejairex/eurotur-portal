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
| Editar páginas | `/administracion/paginas` (`admin.paginas`) | quien tenga el permiso de editar alguna página; lista sus páginas y abre cada una con la edición activa (`?editar=1`) |
| Herramientas | `/administracion/crm` + cada herramienta | según el permiso de cada una |
| Configuración | Usuarios, Roles, etc. | según permisos (sin cambios) |

`/administracion` redirige a `inicio` (antes caía en Usuarios). «Historial» aparece en el menú como «en planeación».

### Editor de páginas
El editor vive en cada página del portal (`resources/js/components/portal/sector-index.tsx`) y se activa con «Editar ✎» o desde «Editar páginas». Agregar, editar y borrar links; agregar, renombrar, mover y borrar bloques. Mover: flechas ↑ ↓, arrastrar el agarrador ⋮⋮ (arrastre propio con el puntero, funciona con mouse y dedo) o Alt + flechas con el agarrador enfocado. `POST portal/groups/{group}/move` acepta `direction` (up/down) o `position` (lugar final, 0 = primero). Borrar un bloque o un link pide confirmación en el mismo lugar. El editor de Innovación (frentes e iniciativas) es otro componente y no se tocó. Esta parte depende de la rama `feature/rediseno-portal-2026-10-21` (que trae renombrar y mover bloques) y por eso va en `feature/backoffice-editor-paginas`, que sale de `integracion-preprod`.

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
- **Organigrama (fase 4):** diseño completo en la sección siguiente. Hasta que RRHH cargue datos reales no se sincroniza nada.

## Diseño: integración con el Organigrama (fase 4)

**Situación actual.** El Organigrama (`Eurotur/organigrama-interactivo`, producción en el puerto 8003, preprod en 8240) es una app aparte con su propia base SQLite. Cada persona es una fila de `nodos` con apellido, nombre, puesto, sector, sede, mail, interno, foto y cumpleaños, cargada por RRHH. Hoy corre con la semilla de ejemplo (`/api/estado` devuelve `quedan_datos_ejemplo: true`). El portal tiene sus propios datos de perfil en `users` (puesto, área, sede, interno, foto). Los dos conviven sin hablarse, y se editan por separado. La edición del Organigrama ya usa la sesión del portal (`organigrama.editar`).

**Principio.** El Organigrama es la fuente de verdad de *quién es quién* (puesto, sector, sede), porque lo mantiene RRHH. El perfil del portal no pelea con eso: lo lee. Lo que es personal (foto e interno que elige cada persona) sigue siendo de la persona.

**Cómo se reconoce a una persona.** Solo por mail exacto (en minúsculas): `nodos.mail` = `users.email`. Si no coincide, no se adivina (criterio del área): queda en el informe como «sin correspondencia».

**Qué se sincroniza (siempre del Organigrama hacia el portal).**

| Dato | Regla |
|---|---|
| Puesto | se copia del Organigrama |
| Área | se copia del sector del Organigrama (los cuatro sectores del panel) |
| Sede | se copia del Organigrama |
| Interno | solo si el portal lo tiene vacío; después manda lo que cargue la persona |
| Foto | no se toca: la sube cada persona |
| Mail | no se toca: es el del usuario y queda de solo lectura |

Nunca se escribe en el Organigrama desde el portal, así que no hay conflictos de ida y vuelta.

**Mecanismo.**
1. El Organigrama expone `GET /api/interno/personas` (mail, puesto, sector, sede, interno de las personas activas), accesible solo desde la red del servidor y con un token compartido en variable de entorno (nunca público: son datos personales).
2. El portal tiene un comando `organigrama:sincronizar` con **vista previa obligatoria** (`--simular`, por defecto): lista qué se cambiaría, a quién, y qué mails no tienen correspondencia. Recién con `--aplicar` escribe.
3. Antes de aplicar se verifica que el Organigrama ya no tenga datos de ejemplo. Si los tiene, el comando se niega a escribir.
4. Cada cambio queda en el registro de auditoría (cuando exista el Historial) y la última sincronización guarda fecha y resultado.
5. Primero a mano desde Back Office (botón «Sincronizar con el organigrama», con `users.manage`). Una tarea diaria programada se evalúa después, con la sincronización ya probada.

**En la pantalla.** En «Mi perfil», puesto, área y sede muestran el aviso «Conectado con el organigrama» y la fecha de la última sincronización, **solo** si esa persona tuvo correspondencia y la última sincronización salió bien. Si no, no aparece nada, y RRHH sigue pudiendo corregir a mano esos tres campos desde Usuarios.

**Estado (23/10/2026): construido y probado en preprod.**
- Organigrama: ruta interna `/api/interno/personas` (token en `ORGANIGRAMA_TOKEN_INTERNO`, sin token la ruta no existe). Rama `preprod` de `Eurotur/organigrama-interactivo`, 115 pruebas.
- Portal: servicio `App\Services\OrganigramaSync`, comando `php artisan organigrama:sincronizar` (simula; `--aplicar` escribe), columna `users.organigrama_sync_at` y el aviso «Conectado con el organigrama» en Mi perfil. 371 pruebas.
- Ya se hizo la carga real de mails e internos en el Organigrama de producción (ver su bitácora del 23/10); las personas que el Organigrama todavía marca con datos de ejemplo se ignoran. Se confirmó que cada persona usa un único mail en todos los sistemas.
- Preprod: la conexión portal → Organigrama (8240) con la clave compartida funciona.

**Para activarlo en producción** (junto con el resto del pase): desplegar el Organigrama con la ruta nueva y la clave (`ORGANIGRAMA_TOKEN_INTERNO` en su entorno y en el `.env` del portal), desplegar el portal con la migración (respaldar la base antes), correr `organigrama:sincronizar` en simulación, revisar y recién ahí `--aplicar`.

## Responsables de página, correo de bienvenida y contraseña (26/10/2026)

**Quién edita qué.** Cada responsable edita **solo** las páginas que se le asignan; nadie edita páginas ajenas. Además del rol, cada persona puede tener permisos propios en la tabla `user_permissions` (hoy: `sector.<página>.edit`, `innovacion.manage` y `exchange-rate.manage`). `User::permissionSlugs()` une los del rol con los propios, así que el botón EDITAR y todas las validaciones del servidor (guardar, agregar, borrar, renombrar, mover) usan los mismos permisos: una página ajena da 403. Los administradores siguen editando todo.
- **Asignarlas:** Configuración → Usuarios → casillas «Páginas que puede editar» (alta y edición). Además, el mapa por correo de `config/responsables.php` (según `/responsables`) se aplica solo al crear el usuario, o a usuarios que ya existen con `php artisan usuarios:asignar-paginas` (simula; `--aplicar` escribe y solo suma, no quita).
- **Pendiente de completar en el mapa:** Carbajo, A. (Producto), qué Zanone (Comercial) y De Bin, Aldo (Institucional no se edita desde el portal hoy). Se asumió «Carrizo» = Claudia en Producto y en Sales. Las páginas sin responsable (Customer Care, Travel Designers, Qrated, Mesa de Información, Sala de Reuniones) quedan solo para administradores.
- La página pública «Responsables del Portal» sigue siendo solo una lista; no está atada a los permisos.

**Correo de bienvenida.** Al crear un usuario se manda `App\Mail\WelcomeMail` (`resources/views/emails/bienvenida.blade.php`): logo, enlace al portal, usuario, contraseña temporal, tres pasos y las páginas que puede editar. Si la contraseña se deja vacía en el alta, se genera una al azar (14 caracteres, sin caracteres confusos); si se define una, también es temporal. Se envía **en el momento, no por la cola**, para que la contraseña no quede guardada en la tabla de trabajos ni en logs. Si el envío falla, el usuario igual se crea y se avisa; en la ficha del usuario, «Reenviar bienvenida» genera una contraseña temporal nueva y vuelve a mandar el correo.
- **Variables de entorno (sin valores secretos en el repositorio):** `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` y, solo en preprod, `MAIL_REDIRECT_TO`. En producción el relay de Google no usa usuario ni contraseña: `MAIL_MAILER=smtp`, `MAIL_HOST=smtp-relay.gmail.com`, `MAIL_PORT=587`, remitente `@eurotur.tur.ar` (hoy `bigbrother@eurotur.tur.ar`, por confirmar con IT si se crea una casilla `portal@`).
- **Preprod:** con `MAIL_REDIRECT_TO` definido, TODO correo del portal se desvía a esa casilla y el asunto lleva «[PRUEBA para …]». Nunca le llega a la gente real.

**Contraseña.** Los usuarios nuevos (o con la clave reiniciada) tienen `must_change_password`: el middleware `EnsurePasswordIsChanged` solo les deja cambiarla (`/cambiar-clave`) o salir, y las herramientas externas (Balanz, Big Brother, Organigrama, Prepagos) responden 401 hasta que la cambien. La nueva tiene que ser distinta de la temporal y de 10 caracteres o más (en producción además las reglas de siempre: mayúsculas, números, símbolo, no filtrada). Cambiar la contraseña sigue disponible siempre en Configuración → Seguridad. La recuperación de contraseña por mail ya existe en el login.

## Despliegue
Siempre primero preprod (ver `README.md`). Hoy la rama de preprod es `integracion-preprod` (rediseño del portal + Back Office). Al pasar a producción: respaldar la base (3 migraciones nuevas), integrar en `main` en orden y repetir el cambio del botón del `portal-layout` (Back Office → Inicio).
