import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { TRAVELDESIGNERS_DATA } from '@/lib/portal-sections-data';

export default function TravelDesigners({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Travel Designers" />
            <SectorIndex
                data={{ ...TRAVELDESIGNERS_DATA, groups }}
                sector="traveldesigners"
            />
        </>
    );
}

TravelDesigners.layout = {
    active: 'traveldesigners',
    label: 'Travel Designers—',
};
