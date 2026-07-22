import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { SALES_DATA } from '@/lib/portal-sections-data';

export default function Sales() {
    return (
        <>
            <Head title="Sales" />
            <SectorIndex data={SALES_DATA} />
        </>
    );
}

Sales.layout = { active: 'sales', label: 'Sales—' };
