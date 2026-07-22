import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { CONTRATACIONES_DATA } from '@/lib/portal-sections-data';

export default function Contrataciones() {
    return (
        <>
            <Head title="Contrataciones" />
            <SectorIndex data={CONTRATACIONES_DATA} />
        </>
    );
}

Contrataciones.layout = { active: 'contrataciones', label: 'Contrataciones—' };
