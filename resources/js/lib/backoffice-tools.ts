import InvoiceLoaderPageController from '@/actions/App/Http/Controllers/Admin/Crm/InvoiceLoaderPageController';
import { prepagos } from '@/routes/admin';
import { prebalance } from '@/routes/admin/crm';
import { embebida } from '@/routes/admin/herramientas';
import type { RouteDefinition } from '@/wayfinder';

/**
 * Las herramientas del Back Office y el área a la que pertenece cada una.
 *
 * Es la ÚNICA lista: de acá salen el menú lateral del Back Office (agrupado por
 * área), las tarjetas de la pantalla "Herramientas" y los permisos que
 * desbloquean ese hub (TOOLS_PERMISSIONS). Para sumar una herramienta nueva se
 * agrega una entrada acá, su permiso en App\Enums\Permission (y en
 * Permission::toolsPermissions()) y, si vive fuera del portal, su ruta de
 * redirección en routes/admin.php.
 */

export type ToolAreaId =
    | 'cuentas-a-pagar'
    | 'contabilidad'
    | 'rrhh'
    | 'administracion';

export type ToolArea = {
    id: ToolAreaId;
    label: string;
};

/**
 * Orden en que se muestran las áreas. Un área sin herramientas visibles no se muestra
 * (hoy "Administración" no tiene ninguna: queda lista para cuando llegue la primera).
 */
export const TOOL_AREAS: ToolArea[] = [
    { id: 'cuentas-a-pagar', label: 'Cuentas a Pagar' },
    { id: 'contabilidad', label: 'Contabilidad' },
    { id: 'rrhh', label: 'RRHH' },
    { id: 'administracion', label: 'Administración' },
];

export type BackofficeTool = {
    id: string;
    area: ToolAreaId;
    /** Nombre completo, para la tarjeta de la pantalla Herramientas. */
    label: string;
    /** Nombre corto, para el menú lateral (216px de ancho). */
    navLabel: string;
    description: string;
    href: RouteDefinition<'get'>;
    permission: string;
    /**
     * Se abre en otra pestaña (herramientas externas que todavía no se muestran dentro del Back Office).
     * Las que sí se muestran adentro usan la ruta `herramientas.embebida` y NO llevan este campo.
     */
    external?: boolean;
    /** Prefijo de URL para marcar la opción como activa (solo herramientas dentro del portal). */
    match?: string;
};

export const BACKOFFICE_TOOLS: BackofficeTool[] = [
    {
        id: 'cargador-facturas',
        area: 'cuentas-a-pagar',
        label: 'Cargador de Facturas',
        navLabel: 'Cargador de facturas',
        description:
            'Subí el Excel de Tango, revisá la propuesta y cargá las facturas de proveedores en Tourplan.',
        href: InvoiceLoaderPageController.index(),
        permission: 'invoice-loader.manage',
        match: '/administracion/crm/cargador-facturas',
    },
    {
        id: 'prepagos',
        area: 'cuentas-a-pagar',
        label: 'Panel de Prepagos',
        navLabel: 'Panel de prepagos',
        description:
            'Calculá los importes a pagar a proveedores, revisá riesgos de sobrepago y gestioná la bandeja del analista.',
        href: prepagos(),
        permission: 'prepagos.manage',
        external: true,
    },
    {
        id: 'balanz',
        area: 'contabilidad',
        label: 'Generador de Asientos Balanz',
        navLabel: 'Asientos Balanz',
        description:
            'Convertí los movimientos de la cuenta comitente de Balanz en asientos bimonetarios para Tango Gestión.',
        // Se muestra dentro del Back Office (ver HerramientaEmbebidaController).
        href: embebida({ herramienta: 'balanz' }),
        permission: 'balanz.manage',
        match: '/administracion/herramientas/balanz',
    },
    {
        id: 'prebalance',
        area: 'contabilidad',
        label: 'Pre-Balance de Módulos',
        navLabel: 'Pre-Balance',
        description:
            'Armá el Pre-Balance con los reportes de Tango (Sumas y Saldos y módulos) y revisá los 15 controles.',
        href: prebalance(),
        permission: 'prebalance.use',
        match: '/administracion/crm/pre-balance',
    },
    {
        id: 'organigrama',
        area: 'rrhh',
        label: 'Organigrama — Edición',
        navLabel: 'Organigrama',
        description:
            'Da de alta, baja y mueve personas, sube fotos e importa planillas del organigrama. La lectura es pública en el sector RRHH.',
        // Se muestra dentro del Back Office (ver HerramientaEmbebidaController).
        href: embebida({ herramienta: 'organigrama' }),
        permission: 'organigrama.editar',
        match: '/administracion/herramientas/organigrama',
    },
    {
        id: 'big-brother',
        area: 'rrhh',
        label: 'Big Brother — Vencimientos',
        navLabel: 'Big Brother',
        description:
            'Seguí el estado de los vencimientos no rutinarios de las unidades: vencidos, por vencer y datos que faltan.',
        // Se muestra dentro del Back Office (ver HerramientaEmbebidaController).
        href: embebida({ herramienta: 'big-brother' }),
        permission: 'big-brother.ver',
        match: '/administracion/herramientas/big-brother',
    },
];
