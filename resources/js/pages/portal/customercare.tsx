import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function CustomerCare() {
    return (
        <>
            <Head title="Customer Care" />
            <PortalPlaceholder title="customer care" num="07" />
        </>
    );
}

CustomerCare.layout = { active: 'customercare', label: 'customer care—' };
