import { Head, usePoll } from '@inertiajs/react';

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

type HistoryVoucher = {
    seq: number;
    ts: string;
    supplier_code: string;
    voucher: string;
    currency: string;
    status: string;
    error: string;
};

type HistoryResponse = {
    vouchers: HistoryVoucher[];
    total: number;
    has_more: boolean;
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

type Summary = {
    vouchers: VoucherSummary;
    cheques: ChequeSummary;
};

type Props = {
    summary: Summary | null;
    stats: StatsSnapshot | null;
    history: HistoryResponse | null;
};

function EmptyState({ message }: { message: string }) {
    return (
        <div
            style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.06em',
                color: '#666',
                padding: '18px 0',
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
                    fontSize: '18px',
                    color: highlight ? RED : '#000',
                }}
            >
                {value}
            </div>
        </div>
    );
}

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

export default function Novedades({ summary, stats, history }: Props) {
    usePoll(15000, { only: ['stats', 'history', 'summary'] });

    const pipeline = stats?.stats ?? null;

    return (
        <>
            <Head title="Novedades" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '38px',
                    }}
                >
                    <div style={{ maxWidth: '560px' }}>
                        <h1
                            style={{
                                fontFamily: "'Anton', sans-serif",
                                fontWeight: 400,
                                fontSize: 'clamp(44px,6vw,80px)',
                                lineHeight: 0.86,
                                margin: 0,
                                textTransform: 'lowercase',
                                letterSpacing: '-0.005em',
                            }}
                        >
                            novedades
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '460px',
                                margin: '20px 0 0',
                                fontSize: '15px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: '#111',
                            }}
                        >
                            Estado en vivo del bot de automatización de
                            comprobantes y los últimos procesamientos.
                        </p>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(96px,13vw,176px)',
                            lineHeight: 0.72,
                        }}
                    >
                        13
                    </div>
                </div>

                <div
                    style={{
                        borderTop: '3px solid #000',
                        paddingTop: '20px',
                        marginBottom: '40px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '16px',
                            marginBottom: '16px',
                        }}
                    >
                        estado actual<span style={{ color: RED }}>—</span>
                    </div>

                    {summary === null ? (
                        <EmptyState message="sin conexión con el monitor — verificá BOT_MONITOR_URL / BOT_MONITOR_API_KEY." />
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '18px',
                            }}
                        >
                            <div>
                                <Label>vouchers</Label>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(6,1fr)',
                                        gap: '18px',
                                        marginTop: '6px',
                                    }}
                                >
                                    <StatValue
                                        label="pendientes"
                                        value={summary.vouchers.pending}
                                    />
                                    <StatValue
                                        label="procesando"
                                        value={summary.vouchers.processing}
                                    />
                                    <StatValue
                                        label="ok"
                                        value={summary.vouchers.ok}
                                    />
                                    <StatValue
                                        label="fallidos"
                                        value={summary.vouchers.failed}
                                        highlight={summary.vouchers.failed > 0}
                                    />
                                    <StatValue
                                        label="omitidos"
                                        value={summary.vouchers.skipped}
                                    />
                                    <StatValue
                                        label="total"
                                        value={summary.vouchers.total}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>cheques</Label>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(6,1fr)',
                                        gap: '18px',
                                        marginTop: '6px',
                                    }}
                                >
                                    <StatValue
                                        label="pendientes"
                                        value={summary.cheques.pending}
                                    />
                                    <StatValue
                                        label="ok"
                                        value={summary.cheques.ok}
                                    />
                                    <StatValue
                                        label="fallidos"
                                        value={summary.cheques.failed}
                                        highlight={summary.cheques.failed > 0}
                                    />
                                    <StatValue
                                        label="total"
                                        value={summary.cheques.total}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        borderTop: '3px solid #000',
                        paddingTop: '20px',
                        marginBottom: '40px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '16px',
                            marginBottom: '16px',
                        }}
                    >
                        corrida activa<span style={{ color: RED }}>—</span>
                    </div>

                    {pipeline === null ? (
                        <EmptyState message="sin corrida activa en este momento." />
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5,1fr)',
                                gap: '18px',
                            }}
                        >
                            <div>
                                <Label>estado</Label>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '18px',
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
                            <StatValue
                                label="omitidos"
                                value={pipeline.skipped}
                            />
                        </div>
                    )}
                </div>

                <div
                    style={{ borderTop: '3px solid #000', paddingTop: '20px' }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '16px',
                            marginBottom: '16px',
                        }}
                    >
                        últimos procesados<span style={{ color: RED }}>—</span>
                    </div>

                    {history === null || history.vouchers.length === 0 ? (
                        <EmptyState message="sin datos del historial." />
                    ) : (
                        <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {history.vouchers.map((v) => (
                                <div
                                    key={v.seq}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            '90px 110px 1fr 90px 100px 1fr',
                                        gap: '12px',
                                        padding: '8px 0',
                                        borderBottom: '1px dotted #000',
                                        alignItems: 'baseline',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '11px',
                                            color: '#999',
                                        }}
                                    >
                                        {v.ts}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 700,
                                            fontSize: '13px',
                                        }}
                                    >
                                        {v.supplier_code}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontSize: '13px',
                                        }}
                                    >
                                        {v.voucher}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '11px',
                                            color: '#666',
                                        }}
                                    >
                                        {v.currency}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            color:
                                                v.status === 'ok'
                                                    ? '#000'
                                                    : RED,
                                        }}
                                    >
                                        {v.status}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontSize: '12px',
                                            color: RED,
                                        }}
                                    >
                                        {v.error}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

Novedades.layout = { active: 'novedades', label: 'novedades—' };
