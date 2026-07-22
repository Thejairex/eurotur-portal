import { Head, usePoll } from '@inertiajs/react';
import { useState } from 'react';

const RED = '#E30613';

type BadgeClass = 'prod' | 'live' | 'dev' | 'test' | 'curso' | 'ana' | 'cero';

const BADGE_STYLE: Record<
    BadgeClass,
    { background: string; color: string; border: string }
> = {
    prod: { background: '#000', color: '#fff', border: '1px solid #000' },
    live: { background: RED, color: '#fff', border: `1px solid ${RED}` },
    dev: { background: '#fff', color: '#000', border: '1px solid #000' },
    test: { background: '#fff', color: RED, border: `1px solid ${RED}` },
    curso: { background: '#fff', color: '#000', border: '1px solid #000' },
    ana: { background: '#fff', color: '#8a8a8a', border: '1px solid #d9d9d9' },
    cero: {
        background: '#f6f5f2',
        color: '#8a8a8a',
        border: '1px solid #d9d9d9',
    },
};

type Initiative = { n: string; badge: string; cls: BadgeClass; desc: string };
type Frente = {
    id: string;
    num: string;
    area: string;
    owner: string;
    items: Initiative[];
};

const FRENTES: Frente[] = [
    {
        id: 'f1',
        num: '01',
        area: 'Administrativo · Cuentas a pagar',
        owner: 'V. Homez · Y. Juárez',
        items: [
            {
                n: 'Bot de carga en TourPlan',
                badge: 'Producción',
                cls: 'prod',
                desc: 'Procesó 600.000 líneas históricas: genera invoices y cheques con el costo real cargado contra cada línea.',
            },
            {
                n: 'Conciliador de pagos duplicados',
                badge: 'Desarrollo',
                cls: 'dev',
                desc: 'Alerta REVISAR / CON FACTURAS PREVIAS / NUEVA por proveedor + file, antes de generar la OP.',
            },
            {
                n: 'Chat IA de documentación',
                badge: 'Análisis',
                cls: 'ana',
                desc: 'Asistente que responde sobre procesos de CxP a partir de la documentación. Pendiente de aprobación.',
            },
            {
                n: 'Comprobantes USD · Banco→Drive',
                badge: 'Sin iniciar',
                cls: 'cero',
                desc: 'Captura automática de comprobantes en dólares del banco a Drive. Pendiente de aprobación.',
            },
            {
                n: 'Sistematización de pagos a guías',
                badge: 'Sin iniciar',
                cls: 'cero',
                desc: 'Anticipos, rendición de gastos y honorarios. Requiere documentar el proceso completo.',
            },
        ],
    },
    {
        id: 'f2',
        num: '02',
        area: 'Contrataciones · Base de datos',
        owner: 'M. Zanone',
        items: [
            {
                n: 'Revalorización de tarifas (PCM)',
                badge: 'En TEST',
                cls: 'test',
                desc: 'Revaloriza el PCM cuando cambia un componente: modifica el servicio madre o crea temporada. Corre desde un prompt.',
            },
            {
                n: 'Descarga de reportes TP NX',
                badge: 'Funciona',
                cls: 'live',
                desc: 'Bajada automática de reportes de Operations (Tour Summary y otros). Patrón replicable.',
            },
        ],
    },
    {
        id: 'f3',
        num: '03',
        area: 'Conciliaciones bancarias',
        owner: 'Tesorería + Contabilidad',
        items: [
            {
                n: 'Conciliación bancaria con IA + bot',
                badge: 'En curso',
                cls: 'curso',
                desc: 'Iniciativa de Administración. En exploración — conviene coordinar para no solaparse con CxP.',
            },
        ],
    },
    {
        id: 'f4',
        num: '04',
        area: 'Uso propio · Productividad',
        owner: 'V. Homez',
        items: [
            {
                n: 'Reporte semanal + dashboard',
                badge: 'Desarrollo',
                cls: 'dev',
                desc: 'Banco de pruebas de lo mismo que se baja al resto: aplicar primero en uno lo que después se enseña.',
            },
            {
                n: 'Pipeline reuniones → Notion',
                badge: 'Análisis',
                cls: 'ana',
                desc: 'De la reunión a notas estructuradas en Notion, listas para consultar.',
            },
            {
                n: 'Asistente de correo · digest 9am',
                badge: 'Análisis',
                cls: 'ana',
                desc: 'Resumen diario del correo entregado a las 9am.',
            },
        ],
    },
];

const ALL_ITEMS = FRENTES.flatMap((f) => f.items);
const INNOV_STATS = [
    { k: String(FRENTES.length), l: 'frentes activos' },
    { k: String(ALL_ITEMS.length), l: 'iniciativas' },
    {
        k: String(ALL_ITEMS.filter((i) => i.badge === 'Producción').length),
        l: 'en producción',
    },
];

type Instructivo = {
    id: string;
    tag: string;
    title: string;
    desc: string;
    bullets: string[];
    href: string;
    ready: boolean;
};

const INSTRUCTIVOS: Instructivo[] = [
    {
        id: 'i1',
        tag: 'GUÍA',
        title: 'Cómo usar Claude',
        desc: 'Cuándo conviene usarlo, cómo escribir buenos pedidos y un menú de desafíos para practicar sobre tu propio trabajo.',
        bullets: [
            'Gemini vs. Claude: qué va a cada uno',
            'Elegir modelo y escribir buenos prompts',
            'Menú de desafíos + qué NO subir a la IA',
        ],
        href: '/instructivos/claude-eurotur.html',
        ready: true,
    },
    {
        id: 'i2',
        tag: 'GUÍA',
        title: 'Cómo usar Gemini',
        desc: 'Uso dentro de Google Workspace y automatizaciones.',
        bullets: [
            'Gemini en Gmail y Docs',
            'Extensiones y conexiones',
            'Qué datos usa y qué no',
        ],
        href: '#',
        ready: false,
    },
    {
        id: 'i3',
        tag: 'CRITERIO',
        title: 'Criterio de automatización',
        desc: 'El filtro antes de pedir un bot. Semáforo interactivo: tocá cada tarjeta y mirá si la idea VA, ESPERÁ o NO VA.',
        bullets: [
            '¿Duele de verdad? ¿Es recurrente?',
            'Bloqueantes: solape · datos · mantenimiento',
            '¿Script de clicks o IA con criterio?',
        ],
        href: '/instructivos/criterio-automatizacion.html',
        ready: true,
    },
];

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
type BotSummary = { vouchers: VoucherSummary; cheques: ChequeSummary };

type Props = {
    summary: BotSummary | null;
    stats: StatsSnapshot | null;
    history: HistoryResponse | null;
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
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '10px 16px',
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

export default function Innovacion({ summary, stats, history }: Props) {
    usePoll(15000, { only: ['stats', 'history', 'summary'] });

    const pipeline = stats?.stats ?? null;

    const [layout, setLayout] = useState<'a' | 'b'>('a');
    const [openFrentes, setOpenFrentes] = useState<Record<string, boolean>>({});
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [openInstr, setOpenInstr] = useState<Record<string, boolean>>({});

    function toggleFrente(id: string) {
        setOpenFrentes((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function toggleItem(key: string) {
        setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function toggleInstr(id: string) {
        setOpenInstr((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    const segBase = {
        cursor: 'pointer',
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        padding: '7px 16px',
        border: 'none',
    };

    return (
        <>
            <Head title="Innovación" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '26px',
                    }}
                >
                    <div style={{ maxWidth: '600px' }}>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: '#666',
                                marginBottom: '12px',
                            }}
                        >
                            panel de innovación — ia · scripts · instructivos
                        </div>
                        <h1
                            style={{
                                fontFamily: "'Anton', sans-serif",
                                fontWeight: 400,
                                fontSize: 'clamp(64px,9vw,132px)',
                                lineHeight: 0.86,
                                margin: 0,
                                letterSpacing: '-0.005em',
                            }}
                        >
                            Innovación
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '490px',
                                margin: '18px 0 0',
                                fontSize: '15px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: '#111',
                            }}
                        >
                            Todo lo que estamos haciendo con IA en Eurotur, en
                            un solo lugar: automatizaciones en marcha e
                            instructivos para usarlas. Tocá cada bloque para ver
                            el detalle.
                        </p>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(80px,10vw,140px)',
                            lineHeight: 0.72,
                        }}
                    >
                        14
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4,1fr)',
                        borderTop: '3px solid #000',
                        borderBottom: '1px solid #000',
                    }}
                >
                    {INNOV_STATS.map((s) => (
                        <div
                            key={s.l}
                            style={{
                                padding: '14px 18px 16px 0',
                                borderRight: '1px dotted #000',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '40px',
                                    lineHeight: 0.8,
                                }}
                            >
                                {s.k}
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: '#666',
                                    marginTop: '8px',
                                }}
                            >
                                {s.l}
                            </div>
                        </div>
                    ))}
                    <div style={{ padding: '14px 18px 16px 0' }}>
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '40px',
                                lineHeight: 0.8,
                            }}
                        >
                            {INSTRUCTIVOS.length}
                        </div>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#666',
                                marginTop: '8px',
                            }}
                        >
                            instructivos ia
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                        margin: '38px 0 0',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '19px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        automatizaciones
                        <span style={{ color: RED }}>—</span>
                    </div>
                    <div
                        style={{
                            display: 'inline-flex',
                            border: '1px solid #000',
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setLayout('a')}
                            style={{
                                ...segBase,
                                background: layout === 'a' ? '#000' : '#fff',
                                color: layout === 'a' ? '#fff' : '#000',
                            }}
                        >
                            índice
                        </button>
                        <button
                            type="button"
                            onClick={() => setLayout('b')}
                            style={{
                                ...segBase,
                                background: layout === 'b' ? '#000' : '#fff',
                                color: layout === 'b' ? '#fff' : '#000',
                            }}
                        >
                            mosaico
                        </button>
                    </div>
                </div>

                {layout === 'a' ? (
                    <div>
                        {FRENTES.map((f) => {
                            const open = !!openFrentes[f.id];

                            return (
                                <div
                                    key={f.id}
                                    style={{ borderBottom: '1px solid #000' }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFrente(f.id)}
                                        className="innov-frente-header"
                                        style={{
                                            cursor: 'pointer',
                                            boxSizing: 'border-box',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '18px',
                                            padding: '18px 4px',
                                            background: 'transparent',
                                            border: 'none',
                                            transition:
                                                'background .12s,transform .12s',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Anton', sans-serif",
                                                fontSize: '30px',
                                                color: RED,
                                                lineHeight: 1,
                                                flex: '0 0 auto',
                                            }}
                                        >
                                            {f.num}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 800,
                                                fontSize: '18px',
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            {f.area}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Space Mono', monospace",
                                                fontSize: '10px',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                color: '#999',
                                            }}
                                        >
                                            {f.owner}
                                        </span>
                                        <span
                                            style={{
                                                marginLeft: 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily:
                                                        "'Space Mono', monospace",
                                                    fontSize: '10px',
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase',
                                                    color: '#666',
                                                }}
                                            >
                                                {f.items.length} iniciativas
                                            </span>
                                            <span
                                                style={{
                                                    fontFamily:
                                                        "'Archivo', sans-serif",
                                                    fontWeight: 900,
                                                    fontSize: '26px',
                                                    color: RED,
                                                    lineHeight: 1,
                                                    width: '18px',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {open ? '–' : '+'}
                                            </span>
                                        </span>
                                    </button>
                                    {open && (
                                        <div
                                            style={{
                                                padding: '0 4px 22px 62px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            {f.items.map((it, idx) => (
                                                <div
                                                    key={f.id + '-' + idx}
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns:
                                                            '1fr auto',
                                                        gap: '20px',
                                                        alignItems: 'start',
                                                        padding: '14px 0',
                                                        borderTop:
                                                            '1px dotted #cfcfcf',
                                                    }}
                                                >
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontFamily:
                                                                    "'Archivo', sans-serif",
                                                                fontWeight: 700,
                                                                fontSize:
                                                                    '15px',
                                                            }}
                                                        >
                                                            {it.n}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    '12.5px',
                                                                color: '#777',
                                                                lineHeight: 1.45,
                                                                marginTop:
                                                                    '4px',
                                                                maxWidth:
                                                                    '560px',
                                                            }}
                                                        >
                                                            {it.desc}
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Space Mono', monospace",
                                                            fontSize: '9.5px',
                                                            letterSpacing:
                                                                '0.08em',
                                                            textTransform:
                                                                'uppercase',
                                                            padding: '4px 8px',
                                                            whiteSpace:
                                                                'nowrap',
                                                            ...BADGE_STYLE[
                                                                it.cls
                                                            ],
                                                        }}
                                                    >
                                                        {it.badge}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: 0,
                            borderLeft: '1px solid #000',
                        }}
                    >
                        {FRENTES.map((f) => (
                            <div
                                key={f.id}
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '16px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontFamily: "'Anton', sans-serif",
                                            fontSize: '34px',
                                            color: RED,
                                            lineHeight: 0.9,
                                        }}
                                    >
                                        {f.num}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            letterSpacing: '-0.01em',
                                            marginTop: '6px',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {f.area}
                                    </div>
                                    <div
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '9px',
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: '#999',
                                            marginTop: '5px',
                                        }}
                                    >
                                        {f.owner}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}
                                >
                                    {f.items.map((it, idx) => {
                                        const key = f.id + '-' + idx;
                                        const open = !!openItems[key];

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleItem(key)}
                                                className="innov-mosaic-item"
                                                style={{
                                                    cursor: 'pointer',
                                                    boxSizing: 'border-box',
                                                    border: '1px solid #dcdcdc',
                                                    padding: '10px 11px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    background: 'transparent',
                                                    transition:
                                                        'border-color .12s,transform .12s',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        alignSelf: 'flex-start',
                                                        fontFamily:
                                                            "'Space Mono', monospace",
                                                        fontSize: '9.5px',
                                                        letterSpacing: '0.08em',
                                                        textTransform:
                                                            'uppercase',
                                                        padding: '4px 8px',
                                                        ...BADGE_STYLE[it.cls],
                                                    }}
                                                >
                                                    {it.badge}
                                                </span>
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'baseline',
                                                        justifyContent:
                                                            'space-between',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Archivo', sans-serif",
                                                            fontWeight: 700,
                                                            fontSize: '13px',
                                                            lineHeight: 1.2,
                                                        }}
                                                    >
                                                        {it.n}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "'Archivo', sans-serif",
                                                            fontWeight: 900,
                                                            fontSize: '16px',
                                                            color: RED,
                                                            lineHeight: 1,
                                                            flex: '0 0 auto',
                                                        }}
                                                    >
                                                        {open ? '–' : '+'}
                                                    </span>
                                                </span>
                                                {open && (
                                                    <span
                                                        style={{
                                                            fontSize: '11.5px',
                                                            color: '#777',
                                                            lineHeight: 1.45,
                                                        }}
                                                    >
                                                        {it.desc}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '26px',
                        borderLeft: `3px solid ${RED}`,
                        background: '#faf7f7',
                        padding: '14px 18px',
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontSize: '30px',
                            color: RED,
                            lineHeight: 1,
                            flex: '0 0 auto',
                        }}
                    >
                        !
                    </span>
                    <span
                        style={{
                            fontSize: '13.5px',
                            color: '#222',
                            lineHeight: 1.5,
                            maxWidth: '780px',
                        }}
                    >
                        Cuatro frentes avanzando en paralelo, todavía sin
                        criterio ni documentación común. Este panel existe para
                        verlos juntos y no duplicar esfuerzo.
                    </span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                        margin: '40px 0 0',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '19px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        instructivos ia
                        <span style={{ color: RED }}>—</span>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#999',
                        }}
                    >
                        ↗ abrí el documento · + detalle
                    </div>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3,1fr)',
                        gap: 0,
                        borderLeft: '1px solid #000',
                    }}
                >
                    {INSTRUCTIVOS.map((i) => {
                        const open = !!openInstr[i.id];

                        return (
                            <div
                                key={i.id}
                                className="innov-instr-card"
                                style={{
                                    borderRight: '1px solid #000',
                                    borderBottom: '1px solid #000',
                                    padding: '18px 18px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '158px',
                                    transition: 'background .12s',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleInstr(i.id)}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        textAlign: 'left',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '9px',
                                            letterSpacing: '0.14em',
                                            color: RED,
                                        }}
                                    >
                                        {i.tag}
                                    </span>
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'baseline',
                                            justifyContent: 'space-between',
                                            gap: '10px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 800,
                                                fontSize: '17px',
                                                letterSpacing: '-0.01em',
                                                lineHeight: 1.05,
                                            }}
                                        >
                                            {i.title}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Archivo', sans-serif",
                                                fontWeight: 900,
                                                fontSize: '22px',
                                                color: RED,
                                                lineHeight: 1,
                                                flex: '0 0 auto',
                                            }}
                                        >
                                            {open ? '–' : '+'}
                                        </span>
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '12.5px',
                                            color: '#777',
                                            lineHeight: 1.45,
                                        }}
                                    >
                                        {i.desc}
                                    </span>
                                </button>
                                {open && (
                                    <div
                                        style={{
                                            marginTop: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                        }}
                                    >
                                        {i.bullets.map((b) => (
                                            <div
                                                key={b}
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    fontSize: '12.5px',
                                                    color: '#333',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: RED,
                                                        fontFamily:
                                                            "'Space Mono', monospace",
                                                    }}
                                                >
                                                    ·
                                                </span>
                                                <span>{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {i.ready ? (
                                    <a
                                        href={i.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="innov-instr-link"
                                        style={{
                                            marginTop: 'auto',
                                            alignSelf: 'flex-start',
                                            textDecoration: 'none',
                                            color: '#fff',
                                            background: RED,
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 800,
                                            fontSize: '13px',
                                            padding: '9px 13px',
                                            display: 'inline-flex',
                                            gap: '8px',
                                            alignItems: 'center',
                                            transition:
                                                'background .12s,transform .12s',
                                        }}
                                    >
                                        Abrir instructivo
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Space Mono', monospace",
                                                fontSize: '12px',
                                            }}
                                        >
                                            ↗
                                        </span>
                                    </a>
                                ) : (
                                    <div
                                        style={{
                                            marginTop: 'auto',
                                            fontFamily:
                                                "'Space Mono', monospace",
                                            fontSize: '10px',
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            color: '#c4c4c4',
                                            paddingTop: '10px',
                                        }}
                                    >
                                        en preparación
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div
                    style={{
                        marginTop: '34px',
                        borderTop: '1px solid #000',
                        paddingTop: '14px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#666',
                    }}
                >
                    mantiene— Homez, Valentina · actualizado 07·2026
                </div>

                {/* ---- Monitor del bot en vivo ---- */}
                <div
                    style={{
                        borderTop: '3px solid #000',
                        paddingTop: '20px',
                        marginTop: '52px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '19px',
                            letterSpacing: '-0.01em',
                            marginBottom: '16px',
                        }}
                    >
                        monitor del bot
                        <span style={{ color: RED }}>—</span>
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
                        marginTop: '40px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            marginBottom: '16px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '16px',
                            }}
                        >
                            corrida activa<span style={{ color: RED }}>—</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <PanelButton variant="start">
                                Iniciar robot
                            </PanelButton>
                            <PanelButton variant="stop">
                                Detener bot
                            </PanelButton>
                        </div>
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
                    style={{
                        borderTop: '3px solid #000',
                        paddingTop: '20px',
                        marginTop: '40px',
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

Innovacion.layout = { active: 'innovacion', label: 'Innovación—' };
