import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Responsables() {
    return (
        <>
            <Head title="Responsables del Portal" />
            <PortalPlaceholder title="responsables del portal" num="12" />
        </>
    );
}

Responsables.layout = { active: 'responsables', label: 'responsables—' };
