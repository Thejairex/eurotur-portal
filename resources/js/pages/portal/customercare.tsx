import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { CUSTOMERCARE_DATA } from '@/lib/portal-sections-data';

export default function CustomerCare() {
    return (
        <>
            <Head title="Customer Care" />
            <SectorIndex data={CUSTOMERCARE_DATA} />
        </>
    );
}

CustomerCare.layout = { active: 'customercare', label: 'Customer Care—' };
