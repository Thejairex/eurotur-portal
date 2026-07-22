import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { RESPONSABLES_DATA } from '@/lib/portal-sections-data';

export default function Responsables() {
    return (
        <>
            <Head title="Responsables del Portal" />
            <SectorIndex data={RESPONSABLES_DATA} />
        </>
    );
}

Responsables.layout = { active: 'responsables', label: 'Responsables—' };
