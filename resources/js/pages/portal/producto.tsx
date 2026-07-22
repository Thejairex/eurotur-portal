import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { PRODUCTO_DATA } from '@/lib/portal-sections-data';

export default function Producto() {
    return (
        <>
            <Head title="Producto" />
            <SectorIndex data={PRODUCTO_DATA} />
        </>
    );
}

Producto.layout = { active: 'producto', label: 'Producto—' };
