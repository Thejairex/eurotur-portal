import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { TRAVELDESIGNERS_DATA } from '@/lib/portal-sections-data';

export default function TravelDesigners() {
    return (
        <>
            <Head title="Travel Designers" />
            <SectorIndex data={TRAVELDESIGNERS_DATA} />
        </>
    );
}

TravelDesigners.layout = {
    active: 'traveldesigners',
    label: 'Travel Designers—',
};
