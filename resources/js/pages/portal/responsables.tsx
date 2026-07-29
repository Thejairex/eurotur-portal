import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { RESPONSABLES_DATA } from '@/lib/portal-sections-data';

export default function Responsables({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Responsables del Portal" />
            <SectorIndex
                data={{ ...RESPONSABLES_DATA, groups }}
                sector="responsables"
            />
        </>
    );
}

Responsables.layout = { active: 'responsables', label: 'Responsables—' };
