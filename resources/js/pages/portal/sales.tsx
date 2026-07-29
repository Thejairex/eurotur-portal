import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { SALES_DATA } from '@/lib/portal-sections-data';

export default function Sales({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Sales" />
            <SectorIndex data={{ ...SALES_DATA, groups }} sector="sales" />
        </>
    );
}

Sales.layout = { active: 'sales', label: 'Sales—' };
