import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Sales() {
    return (
        <>
            <Head title="Sales" />
            <PortalPlaceholder title="sales" num="08" />
        </>
    );
}

Sales.layout = { active: 'sales', label: 'sales—' };
