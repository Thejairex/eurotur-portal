import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Adm() {
    return (
        <>
            <Head title="Administración, Impuestos y Legales" />
            <PortalPlaceholder title="administración" num="03" />
        </>
    );
}

Adm.layout = { active: 'adm', label: 'administración—' };
