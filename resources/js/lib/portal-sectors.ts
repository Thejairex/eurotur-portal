import {
    adm,
    contrataciones,
    customercare,
    institucional,
    it,
    mesa,
    novedades,
    operaciones,
    producto,
    responsables,
    rrhh,
    sales,
    traveldesigners,
} from '@/routes/portal';
import type { RouteDefinition } from '@/wayfinder';

export type SectorId =
    | 'institucional'
    | 'rrhh'
    | 'adm'
    | 'contrataciones'
    | 'operaciones'
    | 'producto'
    | 'customercare'
    | 'sales'
    | 'traveldesigners'
    | 'it'
    | 'mesa'
    | 'responsables'
    | 'novedades';

export type ActiveView = 'home' | SectorId;

export type Sector = {
    id: SectorId;
    num: string;
    navLabel: string;
    shortLabel: string;
    place: string;
    href: RouteDefinition<'get'>;
};

export const SECTORS: Sector[] = [
    {
        id: 'institucional',
        num: '01',
        navLabel: 'Institucional',
        shortLabel: 'Institucional',
        place: 'buenos aires',
        href: institucional(),
    },
    {
        id: 'rrhh',
        num: '02',
        navLabel: 'RRHH',
        shortLabel: 'RRHH',
        place: 'equipo',
        href: rrhh(),
    },
    {
        id: 'adm',
        num: '03',
        navLabel: 'Administración, Impuestos y Legales',
        shortLabel: 'Administración',
        place: 'documentos',
        href: adm(),
    },
    {
        id: 'contrataciones',
        num: '04',
        navLabel: 'Contrataciones',
        shortLabel: 'Contrataciones',
        place: 'flota',
        href: contrataciones(),
    },
    {
        id: 'operaciones',
        num: '05',
        navLabel: 'Operaciones',
        shortLabel: 'Operaciones',
        place: 'perito moreno',
        href: operaciones(),
    },
    {
        id: 'producto',
        num: '06',
        navLabel: 'Producto',
        shortLabel: 'Producto',
        place: 'excursiones',
        href: producto(),
    },
    {
        id: 'customercare',
        num: '07',
        navLabel: 'Customer Care',
        shortLabel: 'Customer Care',
        place: 'pasajeros',
        href: customercare(),
    },
    {
        id: 'sales',
        num: '08',
        navLabel: 'Sales',
        shortLabel: 'Sales',
        place: 'clientes',
        href: sales(),
    },
    {
        id: 'traveldesigners',
        num: '09',
        navLabel: 'Travel Designers',
        shortLabel: 'Travel Designers',
        place: 'ruta 40',
        href: traveldesigners(),
    },
    {
        id: 'it',
        num: '10',
        navLabel: 'IT',
        shortLabel: 'IT',
        place: 'sistemas',
        href: it(),
    },
    {
        id: 'mesa',
        num: '11',
        navLabel: 'Mesa de Información',
        shortLabel: 'Mesa de Info',
        place: 'soporte',
        href: mesa(),
    },
    {
        id: 'responsables',
        num: '12',
        navLabel: 'Responsables del Portal',
        shortLabel: 'Responsables',
        place: 'portal',
        href: responsables(),
    },
    {
        id: 'novedades',
        num: '13',
        navLabel: 'Novedades',
        shortLabel: 'Novedades',
        place: 'automatización',
        href: novedades(),
    },
];
