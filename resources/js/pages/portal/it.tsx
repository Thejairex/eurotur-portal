import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function It() {
    return (
        <>
            <Head title="IT" />
            <PortalPlaceholder title="it" num="10" />
        </>
    );
}

It.layout = { active: 'it', label: 'it—' };
