import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { RRHH_DATA } from '@/lib/portal-sections-data';

export default function Rrhh({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="RRHH" />
            <SectorIndex data={{ ...RRHH_DATA, groups }} sector="rrhh" />
        </>
    );
}

Rrhh.layout = { active: 'rrhh', label: 'RRHH—' };
