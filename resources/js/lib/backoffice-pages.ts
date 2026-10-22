import { SECTORS } from '@/lib/portal-sectors';
import type { Sector } from '@/lib/portal-sectors';

/** Páginas del portal que se editan desde el Back Office y el permiso que habilita cada una. */
const EDITABLE_PERMISSIONS: Record<string, string> = {
    rrhh: 'sector.rrhh.edit',
    adm: 'sector.adm.edit',
    contrataciones: 'sector.contrataciones.edit',
    operaciones: 'sector.operaciones.edit',
    producto: 'sector.producto.edit',
    customercare: 'sector.customercare.edit',
    sales: 'sector.sales.edit',
    traveldesigners: 'sector.traveldesigners.edit',
    it: 'sector.it.edit',
    responsables: 'sector.responsables.edit',
    innovacion: 'innovacion.manage',
};

/** Páginas que esta persona puede editar, en el orden del menú del portal. */
export function editablePagesFor(
    can: (permission: string) => boolean,
): Sector[] {
    return SECTORS.filter((sector) => {
        const permission = EDITABLE_PERMISSIONS[sector.id];

        return permission !== undefined && can(permission);
    });
}
