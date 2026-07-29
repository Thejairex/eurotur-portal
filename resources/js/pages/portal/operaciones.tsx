import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { OPERACIONES_DATA } from '@/lib/portal-sections-data';

export default function Operaciones({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Operaciones" />
            <SectorIndex
                data={{ ...OPERACIONES_DATA, groups }}
                sector="operaciones"
            />
        </>
    );
}

Operaciones.layout = { active: 'operaciones', label: 'Operaciones—' };
