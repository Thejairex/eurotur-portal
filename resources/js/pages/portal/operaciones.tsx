import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Operaciones() {
    return (
        <>
            <Head title="Operaciones" />
            <PortalPlaceholder title="operaciones" num="05" />
        </>
    );
}

Operaciones.layout = { active: 'operaciones', label: 'operaciones—' };
