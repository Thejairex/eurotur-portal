import { Head } from '@inertiajs/react';
import { SectorIndex } from '@/components/portal/sector-index';
import { ADM_DATA } from '@/lib/portal-sections-data';

export default function Adm() {
    return (
        <>
            <Head title="Administración, Impuestos y Legales" />
            <SectorIndex data={ADM_DATA} />
        </>
    );
}

Adm.layout = { active: 'adm', label: 'Administración—' };
