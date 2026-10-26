<?php

use App\Enums\Permission;

/*
|--------------------------------------------------------------------------
| Quién mantiene cada página del portal (mapa por correo)
|--------------------------------------------------------------------------
|
| Según la lista pública de /responsables (26/10/2026). Cuando se crea un usuario con uno de estos correos,
| o se corre `php artisan usuarios:asignar-paginas --aplicar`, la persona recibe el permiso de editar SOLO
| esas páginas. Nadie edita páginas ajenas. Es solo un punto de partida: después se ajusta por usuario en
| Configuración → Usuarios.
|
| Pendientes de confirmar (no figuran acá hasta tener el correo): Carbajo, A. (Producto), qué Zanone
| (Comercial) y De Bin, Aldo (Institucional, página que hoy no se edita desde el portal).
| Las páginas sin responsable (Customer Care, Travel Designers, Qrated, Mesa de Información, Sala de
| Reuniones) quedan solo para administradores.
*/

$rrhh = Permission::SectorRrhhEdit->value;
$adm = Permission::SectorAdmEdit->value;
$contrataciones = Permission::SectorContratacionesEdit->value;
$operaciones = Permission::SectorOperacionesEdit->value;
$producto = Permission::SectorProductoEdit->value;
$sales = Permission::SectorSalesEdit->value;
$it = Permission::SectorItEdit->value;

return [
    'por_correo' => [
        'romina.velazquez@eurotur.tur.ar' => [$rrhh],
        'elsa.quintana@eurotur.tur.ar' => [$adm],
        'leonela.aguero@eurotur.tur.ar' => [$adm],
        'beatriz.flores@eurotur.tur.ar' => [$adm],
        'valeria.juliano@eurotur.tur.ar' => [$operaciones],
        'mariana.garrigo@eurotur.tur.ar' => [$contrataciones],
        'paula.dis@eurotur.tur.ar' => [$contrataciones],
        'claudia.carrizo@eurotur.tur.ar' => [$producto, $sales],
        'morena.aleu@eurotur.tur.ar' => [$producto],
        'eugenia.meyoyan@eurotur.tur.ar' => [$sales],
        'daiana.lezcano@eurotur.tur.ar' => [$sales],
        'adele.clement@eurotur.tur.ar' => [$sales],
        'alejandro.bonserio@eurotur.tur.ar' => [$sales],
        'yenedier.fuentes@eurotur.tur.ar' => [$it, Permission::ExchangeRateManage->value],
        'valentina.homez@eurotur.tur.ar' => [Permission::InnovacionManage->value],
    ],
];
