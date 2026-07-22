import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { RRHH_DATA } from '@/lib/portal-sections-data';

export default function Rrhh() {
    return (
        <>
            <Head title="RRHH" />
            <SectorIndex data={RRHH_DATA} />
        </>
    );
}

Rrhh.layout = { active: 'rrhh', label: 'RRHH—' };
