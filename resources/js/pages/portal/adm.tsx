import { Head } from '@inertiajs/react';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { ADM_DATA } from '@/lib/portal-sections-data';

export default function Adm({ groups }: { groups: SectorGroup[] }) {
    return (
        <>
            <Head title="Administración, Impuestos y Legales" />
            <SectorIndex data={{ ...ADM_DATA, groups }} sector="adm" />
        </>
    );
}

Adm.layout = { active: 'adm', label: 'Administración—' };
