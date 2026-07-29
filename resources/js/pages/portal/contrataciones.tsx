import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { CONTRATACIONES_DATA } from '@/lib/portal-sections-data';

export default function Contrataciones({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Contrataciones" />
            <SectorIndex
                data={{ ...CONTRATACIONES_DATA, groups }}
                sector="contrataciones"
            />
        </>
    );
}

Contrataciones.layout = { active: 'contrataciones', label: 'Contrataciones—' };
