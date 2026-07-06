import { Head } from '@inertiajs/react';
import { PortalPlaceholder } from '@/components/portal/other-section';

export default function Producto() {
    return (
        <>
            <Head title="Producto" />
            <PortalPlaceholder title="producto" num="06" />
        </>
    );
}

Producto.layout = { active: 'producto', label: 'producto—' };
