import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { CUSTOMERCARE_DATA } from '@/lib/portal-sections-data';

export default function CustomerCare({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Customer Care" />
            <SectorIndex
                data={{ ...CUSTOMERCARE_DATA, groups }}
                sector="customercare"
            />
        </>
    );
}

CustomerCare.layout = { active: 'customercare', label: 'Customer Care—' };
