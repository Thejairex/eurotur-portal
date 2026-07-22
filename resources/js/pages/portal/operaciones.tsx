import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { OPERACIONES_DATA } from '@/lib/portal-sections-data';

export default function Operaciones() {
    return (
        <>
            <Head title="Operaciones" />
            <SectorIndex data={OPERACIONES_DATA} />
        </>
    );
}

Operaciones.layout = { active: 'operaciones', label: 'Operaciones—' };
