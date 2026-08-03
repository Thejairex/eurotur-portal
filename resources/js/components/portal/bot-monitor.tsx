import { usePoll } from '@inertiajs/react';

const RED = '#E30613';

type PipelineStats = {
    running: boolean;
    finished: boolean;
    error: string | null;
    total: number;
    ok: number;
    failed: number;
    skipped: number;
    progress_pct: number;
    elapsed_seconds: number;
};

type StatsSnapshot = {
    state: string;
    mode: string | null;
    thread_alive: boolean;
    heartbeat_age: number;
    stats: PipelineStats | null;
};

type VoucherSummary = {
    pending: number;
    processing: number;
    ok: number;
    failed: number;
    skipped: number;
    total: number;
};

type ChequeSummary = {
    pending: number;
    ok: number;
    failed: number;
    total: number;
};

type BotSummary = { vouchers: VoucherSummary; cheques: ChequeSummary };

export type BotMonitorProps = {
    summary: BotSummary | null;
    stats: StatsSnapshot | null;
};

function Label({ children }: { children: string }) {
    return (
        <div
            style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#999',
            }}
        >
            {children}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div
            style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: '#666',
                padding: '4px 0',
            }}
        >
            {message}
        </div>
    );
}

function StatValue({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string | number;
    highlight?: boolean;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <div
                style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 800,
                    fontSize: '15px',
                    color: highlight ? RED : '#000',
                }}
            >
                {value}
            </div>
        </div>
    );
}

function PanelButton({
    children,
    variant,
}: {
    children: string;
    variant: 'start' | 'stop';
}) {
    return (
        <button
            type="button"
            style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '7px 12px',
                border:
                    variant === 'start' ? '1px solid #000' : `1px solid ${RED}`,
                background: variant === 'start' ? '#000' : '#fff',
                color: variant === 'start' ? '#fff' : RED,
                cursor: 'pointer',
            }}
        >
            {children}
        </button>
    );
}

/**
 * Compact live status panel for the TourPlan CxP automation bot — meant to
 * be embedded at the end of its initiative card, not as a standalone page section.
 */
export function BotMonitor({ summary, stats }: BotMonitorProps) {
    usePoll(15000, { only: ['stats', 'summary'] });

    const pipeline = stats?.stats ?? null;

    return (
        <div
            style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px dotted #cfcfcf',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
        >
            <div>
                <Label>monitor del bot</Label>
                {summary === null ? (
                    <EmptyState message="sin conexión con el monitor." />
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3,1fr)',
                            gap: '10px',
                            marginTop: '6px',
                        }}
                    >
                        <StatValue
                            label="vouchers ok"
                            value={summary.vouchers.ok}
                        />
                        <StatValue
                            label="vouchers fallidos"
                            value={summary.vouchers.failed}
                            highlight={summary.vouchers.failed > 0}
                        />
                        <StatValue
                            label="vouchers total"
                            value={summary.vouchers.total}
                        />
                        <StatValue
                            label="cheques ok"
                            value={summary.cheques.ok}
                        />
                        <StatValue
                            label="cheques fallidos"
                            value={summary.cheques.failed}
                            highlight={summary.cheques.failed > 0}
                        />
                        <StatValue
                            label="cheques total"
                            value={summary.cheques.total}
                        />
                    </div>
                )}
            </div>

            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                    }}
                >
                    <Label>corrida activa</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <PanelButton variant="start">Iniciar</PanelButton>
                        <PanelButton variant="stop">Detener</PanelButton>
                    </div>
                </div>

                {pipeline === null ? (
                    <EmptyState message="sin corrida activa en este momento." />
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: '10px',
                        }}
                    >
                        <div>
                            <Label>estado</Label>
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 800,
                                    fontSize: '15px',
                                    textTransform: 'uppercase',
                                    color:
                                        stats?.state === 'error' ||
                                        stats?.state === 'hung'
                                            ? RED
                                            : '#000',
                                }}
                            >
                                {stats?.state ?? '—'}
                            </div>
                        </div>
                        <StatValue
                            label="progreso"
                            value={`${pipeline.progress_pct.toFixed(0)}%`}
                        />
                        <StatValue label="ok" value={pipeline.ok} />
                        <StatValue
                            label="fallidos"
                            value={pipeline.failed}
                            highlight={pipeline.failed > 0}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
