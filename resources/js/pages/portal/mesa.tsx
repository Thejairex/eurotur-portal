import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Mesa() {
    return (
        <>
            <Head title="Mesa de Información" />
            <PortalPlaceholder title="mesa de información" num="11" />
        </>
    );
}

Mesa.layout = { active: 'mesa', label: 'mesa de info—' };
