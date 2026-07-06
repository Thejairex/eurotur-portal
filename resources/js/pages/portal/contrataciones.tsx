import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Contrataciones() {
    return (
        <>
            <Head title="Contrataciones" />
            <PortalPlaceholder title="contrataciones" num="04" />
        </>
    );
}

Contrataciones.layout = { active: 'contrataciones', label: 'contrataciones—' };
