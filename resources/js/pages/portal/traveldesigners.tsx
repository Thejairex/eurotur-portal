import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function TravelDesigners() {
    return (
        <>
            <Head title="Travel Designers" />
            <PortalPlaceholder title="travel designers" num="09" />
        </>
    );
}

TravelDesigners.layout = {
    active: 'traveldesigners',
    label: 'travel designers—',
};
