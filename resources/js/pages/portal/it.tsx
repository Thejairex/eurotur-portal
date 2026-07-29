import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { IT_DATA } from '@/lib/portal-sections-data';

export default function It({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="IT" />
            <SectorIndex data={{ ...IT_DATA, groups }} sector="it" />
        </>
    );
}

It.layout = { active: 'it', label: 'IT—' };
