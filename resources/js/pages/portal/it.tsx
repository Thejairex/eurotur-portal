import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { IT_DATA } from '@/lib/portal-sections-data';

export default function It() {
    return (
        <>
            <Head title="IT" />
            <SectorIndex data={IT_DATA} />
        </>
    );
}

It.layout = { active: 'it', label: 'IT—' };
