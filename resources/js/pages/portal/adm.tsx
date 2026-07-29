import { Head } from '@inertiajs/react';
import type { BotMonitorProps } from '@/components/portal/bot-monitor';
import { BotMonitor } from '@/components/portal/bot-monitor';
import type { SectorGroup } from '@/components/portal/sector-index';
import { SectorIndex } from '@/components/portal/sector-index';
import { ADM_DATA } from '@/lib/portal-sections-data';

type Props = BotMonitorProps & { groups: SectorGroup[] };

export default function Adm({ groups, summary, stats, history }: Props) {
    return (
        <>
            <Head title="Administración, Impuestos y Legales" />
            <SectorIndex data={{ ...ADM_DATA, groups }} sector="adm" />
            <BotMonitor summary={summary} stats={stats} history={history} />
        </>
    );
}

Adm.layout = { active: 'adm', label: 'Administración—' };
