import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { PRODUCTO_DATA } from '@/lib/portal-sections-data';

export default function Producto({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Producto" />
            <SectorIndex
                data={{ ...PRODUCTO_DATA, groups }}
                sector="producto"
            />
        </>
    );
}

Producto.layout = { active: 'producto', label: 'Producto—' };
