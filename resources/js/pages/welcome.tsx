import { Head } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

const RED = '#E30613';

type SectorId =
    | 'institucional'
    | 'rrhh'
    | 'adm'
    | 'contrataciones'
    | 'operaciones'
    | 'producto'
    | 'customercare'
    | 'sales'
    | 'traveldesigners'
    | 'it'
    | 'mesa'
    | 'responsables';

type ViewId = 'home' | SectorId;

const NAV_DEFS: [string, string, SectorId][] = [
    ['01', 'Institucional', 'institucional'],
    ['02', 'RRHH', 'rrhh'],
    ['03', 'Administración, Impuestos y Legales', 'adm'],
    ['04', 'Contrataciones', 'contrataciones'],
    ['05', 'Operaciones', 'operaciones'],
    ['06', 'Producto', 'producto'],
    ['07', 'Customer Care', 'customercare'],
    ['08', 'Sales', 'sales'],
    ['09', 'Travel Designers', 'traveldesigners'],
    ['10', 'IT', 'it'],
    ['11', 'Mesa de Información', 'mesa'],
    ['12', 'Responsables del Portal', 'responsables'],
];

const DESIGNED: ViewId[] = ['home', 'rrhh', 'institucional'];

const SHORT_MAP: Partial<Record<ViewId, string>> = {
    institucional: 'Institucional',
    rrhh: 'RRHH',
    adm: 'Administración',
    contrataciones: 'Contrataciones',
    operaciones: 'Operaciones',
    producto: 'Producto',
    customercare: 'Customer Care',
    sales: 'Sales',
    traveldesigners: 'Travel Designers',
    it: 'IT',
    mesa: 'Mesa de Info',
    responsables: 'Responsables',
};

const PLACE_MAP: Partial<Record<ViewId, string>> = {
    institucional: 'buenos aires',
    rrhh: 'equipo',
    adm: 'documentos',
    contrataciones: 'flota',
    operaciones: 'perito moreno',
    producto: 'excursiones',
    customercare: 'pasajeros',
    sales: 'clientes',
    traveldesigners: 'ruta 40',
    it: 'sistemas',
    mesa: 'soporte',
    responsables: 'portal',
};

const LABEL_MAP: Partial<Record<ViewId, string>> = {
    home: 'inicio—',
    institucional: 'institucional—',
    rrhh: 'rrhh—',
    adm: 'administración—',
    contrataciones: 'contrataciones—',
    operaciones: 'operaciones—',
    producto: 'producto—',
    customercare: 'customer care—',
    sales: 'sales—',
    traveldesigners: 'travel designers—',
    it: 'it—',
    mesa: 'mesa de info—',
    responsables: 'responsables—',
};

const NUM_MAP: Partial<Record<ViewId, string>> = {
    institucional: '01',
    rrhh: '02',
    adm: '03',
    contrataciones: '04',
    operaciones: '05',
    producto: '06',
    customercare: '07',
    sales: '08',
    traveldesigners: '09',
    it: '10',
    mesa: '11',
    responsables: '12',
};

const TITLE_MAP: Partial<Record<ViewId, string>> = {
    adm: 'administración',
    contrataciones: 'contrataciones',
    operaciones: 'operaciones',
    producto: 'producto',
    customercare: 'customer care',
    sales: 'sales',
    traveldesigners: 'travel designers',
    it: 'it',
    mesa: 'mesa de información',
    responsables: 'responsables del portal',
};

type QuickAccess = {
    num: string;
    title: string;
    href: string;
    icon: ReactNode;
};

const QUICK_ACCESS: QuickAccess[] = [
    {
        num: '01',
        title: 'Ticketera',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeyq0O-jjq9FRdLqdL8NeOuDogy0VrRfvspfBXU7-3_AO64rA/viewform',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <path d="M4 13h34v5a3 3 0 000 6v5H4v-5a3 3 0 000-6z" />
                <line x1="27" y1="13" x2="27" y2="29" strokeDasharray="2 3" />
            </svg>
        ),
    },
    {
        num: '02',
        title: 'Internos',
        href: 'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <rect x="6" y="8" width="30" height="26" />
                <line x1="6" y1="16" x2="36" y2="16" />
                <line x1="16" y1="8" x2="16" y2="34" />
            </svg>
        ),
    },
    {
        num: '03',
        title: 'Guía telefónica',
        href: 'https://www.appsheet.com/start/9e512a05-852d-4911-aefd-45976c715d0e',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <rect x="13" y="4" width="16" height="34" rx="3" />
                <line x1="13" y1="31" x2="29" y2="31" />
                <circle
                    cx="21"
                    cy="34.5"
                    r="1.4"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        ),
    },
    {
        num: '04',
        title: 'Cotización Dólar',
        href: 'https://www.bna.com.ar/Personas',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <circle cx="21" cy="21" r="15" />
                <text
                    x="21"
                    y="28"
                    textAnchor="middle"
                    fontFamily="Archivo, sans-serif"
                    fontWeight="900"
                    fontSize="19"
                    fill="currentColor"
                    stroke="none"
                >
                    $
                </text>
            </svg>
        ),
    },
    {
        num: '05',
        title: 'Mesa de Información',
        href: 'https://sites.google.com/eurotur.tur.ar/portal-eurotur/',
        icon: (
            <svg
                width="40"
                height="40"
                viewBox="0 0 42 42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
            >
                <circle cx="21" cy="21" r="15" />
                <line x1="21" y1="19" x2="21" y2="29" />
                <circle
                    cx="21"
                    cy="14"
                    r="1.6"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        ),
    },
];

type Clima = {
    city: string;
    temp: string;
    cond: string;
    hi: string;
    lo: string;
};

const CLIMA: Clima[] = [
    {
        city: 'Buenos Aires',
        temp: '13',
        cond: 'Parcial nublado',
        hi: '16',
        lo: '9',
    },
    { city: 'El Calafate', temp: '2', cond: 'Nieve ligera', hi: '5', lo: '-3' },
    { city: 'Ushuaia', temp: '-1', cond: 'Nublado', hi: '3', lo: '-4' },
    { city: 'Salta', temp: '17', cond: 'Despejado', hi: '24', lo: '8' },
];

type RrhhLink = { t: string; h: string };
type RrhhGroup = { n: string; title: string; links: RrhhLink[] };

const RRHH_GROUPS: RrhhGroup[] = [
    {
        n: '01',
        title: 'Empleado',
        links: [
            {
                t: 'Formulario de altas de personal',
                h: 'https://drive.google.com/drive/u/0/folders/1qCarwAsJhCp3noSeNa9UJOZktMASLZAl',
            },
            {
                t: 'Carta vacaciones Eurotur',
                h: 'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR',
            },
            {
                t: 'Carta vacaciones Travel Designers',
                h: 'https://drive.google.com/drive/u/0/folders/1ESdsqm5G3rIaFKVWpRSXuvKel6hwAOpR',
            },
            {
                t: 'Email, grupos y teléfonos',
                h: 'https://docs.google.com/spreadsheets/d/1o5Gsm8oSGapcLPGLmHGpmAZwyK9_49VFLQ_e6tqz_5o/edit',
            },
            {
                t: 'DDJJ de Domicilio Eurotur',
                h: 'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o',
            },
            {
                t: 'DDJJ de Domicilio Travel Designers',
                h: 'https://drive.google.com/drive/u/1/folders/1rAVXN-F3tORsSqACPT3lWrZXr0eq906o',
            },
        ],
    },
    {
        n: '02',
        title: 'Descripciones de puestos',
        links: [
            {
                t: 'Operaciones',
                h: 'https://drive.google.com/drive/u/0/folders/1pL7ZsiVWP4kl3rFThpNmblBgwcDbJ5t8',
            },
            {
                t: 'Administración',
                h: 'https://drive.google.com/drive/folders/195i-maUiLiBFPPuzb__9LMd77hjmZlDS',
            },
            {
                t: 'Contrataciones',
                h: 'https://drive.google.com/drive/folders/1ogdPFJRGxqAxPSFiVzSYOzNE4GFAeNCJ',
            },
        ],
    },
    {
        n: '03',
        title: 'Políticas de personal',
        links: [
            {
                t: 'Política de personal',
                h: 'https://drive.google.com/drive/u/0/folders/1egYGkgq1Yc5XPMZwLZc952K5Vi8hHdMi',
            },
            {
                t: 'Rendición de gastos de internet',
                h: 'https://docs.google.com/forms/d/e/1FAIpQLSdNjkgDveNTy3jp8dx1y43mrpgRH688NRSuoqve4Cha2143HQ/viewform',
            },
        ],
    },
    {
        n: '04',
        title: 'Feriados',
        links: [
            {
                t: 'Feriados nacionales 2026',
                h: 'https://www.argentina.gob.ar/jefatura/feriados-nacionales-2026',
            },
            {
                t: 'Actividad oficinas BUE-FTE-USH 2026',
                h: 'https://drive.google.com/drive/u/0/folders/1Ewpl-6o3RkYQh9rMSZE-Ern2SYQw6o6E',
            },
        ],
    },
    {
        n: '05',
        title: 'Cronogramas',
        links: [
            {
                t: 'Cronograma 24 y 31·12·25',
                h: 'https://drive.google.com/drive/u/0/folders/1-f5Ymcn9n_zTClSXgWxEMkFLP_wlv0GX',
            },
        ],
    },
    {
        n: '06',
        title: 'Organigrama',
        links: [
            {
                t: 'Organigrama Eurotur',
                h: 'https://drive.google.com/drive/u/0/folders/1YBH-WESU1sBqR1v6VjPDlpH0fwtTAfcV',
            },
        ],
    },
    {
        n: '07',
        title: 'Datos ART',
        links: [
            {
                t: 'Eurotur S.A.',
                h: 'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z',
            },
            {
                t: 'Travel Designers S.A.',
                h: 'https://drive.google.com/drive/folders/1M0bvz0j36Zvbc2bJrKK_XwlxJ-coJF0z',
            },
        ],
    },
    {
        n: '08',
        title: 'Liquidación de sueldo',
        links: [
            {
                t: 'Modelo de recibo (Excel)',
                h: 'https://docs.google.com/spreadsheets/d/1RLN0FVoN9zeE7CF7pCheeOdPcPNtZMjC/edit',
            },
            {
                t: 'Presentación',
                h: 'https://drive.google.com/drive/u/0/folders/1gkSTI2Lv-8Sa1YRQEMxG7ccQTfBNCrf3',
            },
            {
                t: 'Escalas CCT 547/08 · 08/2025',
                h: 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            },
            {
                t: 'Escalas CCT 547/08 · 12/2025',
                h: 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            },
            {
                t: 'Paritaria FAECYS-FAEVYT · 05/2026',
                h: 'https://drive.google.com/drive/u/0/folders/18rxmKZW6Wo4IJn-waptDWnzWVsEbx1EO',
            },
        ],
    },
];

type Valor = { n: string; t: string; d: string };

const VALORES: Valor[] = [
    {
        n: '01',
        t: 'Integridad y Compromiso',
        d: 'Seguridad, responsabilidad e integridad en todas nuestras operaciones, construyendo confianza.',
    },
    {
        n: '02',
        t: 'Vínculo Humano',
        d: 'Ponemos el vínculo humano al nivel de las metas empresariales, con relaciones auténticas.',
    },
    {
        n: '03',
        t: 'Creatividad e Innovación',
        d: 'Fomentamos la curiosidad y la mejora constante de cada experiencia de viaje.',
    },
    {
        n: '04',
        t: 'Crecimiento',
        d: 'Ambiente inclusivo donde todas las personas puedan desarrollarse respetando la pluralidad.',
    },
    {
        n: '05',
        t: 'Resultados y Eficiencia',
        d: 'Orientación a resultados medibles y valor agregado para un crecimiento sostenible.',
    },
];

type NavItem = { num: string; id: SectorId; label: string; color: string };
type TileItem = { num: string; id: SectorId; label: string; place: string };

export default function Welcome() {
    const [view, setView] = useState<ViewId>('home');
    const [query, setQuery] = useState('');

    const showClima = true;
    const stripeAccent = true;

    const isHome = view === 'home';
    const isRrhh = view === 'rrhh';
    const isInst = view === 'institucional';
    const isOther = !DESIGNED.includes(view);

    const viewLabel = LABEL_MAP[view] ?? 'eurotur—';
    const viewNum = NUM_MAP[view] ?? '';
    const otherTitle = TITLE_MAP[view] ?? '';

    const nav: NavItem[] = NAV_DEFS.map(([num, label, id]) => ({
        num,
        id,
        label,
        color: id === view ? RED : '#000',
    }));

    const tiles: TileItem[] = NAV_DEFS.map(([num, label, id]) => ({
        num,
        id,
        label: SHORT_MAP[id] ?? label,
        place: PLACE_MAP[id] ?? '',
    }));

    return (
        <>
            <Head title="Portal Eurotur">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
                />
            </Head>

            <style>{`
                .eurotur-portal ::selection { background: ${RED}; color: #fff; }
                .eurotur-portal .nav-item:hover { background: ${RED}; color: #fff; }
                .eurotur-portal .quick-card:hover { background: ${RED}; color: #fff; }
                .eurotur-portal .tile:hover { background-image: none; background-color: ${RED}; color: #fff; }
                .eurotur-portal .doc-link:hover { color: ${RED}; border-color: ${RED}; }
            `}</style>

            <div
                className="eurotur-portal"
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                    background: '#fff',
                    color: '#000',
                    fontFamily: "'Archivo', sans-serif",
                }}
            >
                <Sidebar
                    nav={nav}
                    onNavigate={setView}
                    onHome={() => setView('home')}
                />

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Header query={query} onQuery={setQuery} />

                    {stripeAccent && (
                        <div
                            style={{
                                height: '22px',
                                backgroundImage:
                                    'repeating-linear-gradient(90deg,#000 0 3px,#fff 3px 9px)',
                                borderBottom: '1px solid #000',
                            }}
                        />
                    )}

                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: '150px',
                            bottom: '120px',
                            width: '112px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            paddingTop: '16px',
                        }}
                    >
                        <div
                            style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                fontFamily: "'Anton', sans-serif",
                                fontSize: '56px',
                                lineHeight: 0.9,
                                color: RED,
                                letterSpacing: '0.01em',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {viewLabel}
                        </div>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            padding: '44px 56px 40px 112px',
                            position: 'relative',
                        }}
                    >
                        {isHome && (
                            <HomeSection
                                tiles={tiles}
                                onNavigate={setView}
                                showClima={showClima}
                            />
                        )}
                        {isRrhh && <RrhhSection />}
                        {isInst && <InstitucionalSection />}
                        {isOther && (
                            <OtherSection title={otherTitle} num={viewNum} />
                        )}
                    </div>

                    <Footer />
                </main>
            </div>
        </>
    );
}

function Sidebar({
    nav,
    onNavigate,
    onHome,
}: {
    nav: NavItem[];
    onNavigate: (id: ViewId) => void;
    onHome: () => void;
}) {
    return (
        <aside
            style={{
                width: '216px',
                flex: '0 0 216px',
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start',
                height: '100vh',
                padding: '34px 22px 28px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #000',
            }}
        >
            <button
                onClick={onHome}
                style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
            >
                <img
                    src="/eurotur-logo.png"
                    alt="Eurotur — 70 años"
                    style={{ width: '118px', height: 'auto', display: 'block' }}
                />
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#666',
                        marginTop: '10px',
                    }}
                >
                    portal interno
                    <br />
                    dmc · desde 1954
                </div>
            </button>

            <div
                style={{
                    height: '1px',
                    background: '#000',
                    margin: '24px 0 20px',
                }}
            />

            <nav
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    flex: 1,
                }}
            >
                {nav.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className="nav-item"
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '9px',
                            padding: '5px 4px',
                            color: item.color,
                            transition: 'color .12s, background .12s',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                fontWeight: 700,
                                width: '18px',
                                flex: '0 0 18px',
                            }}
                        >
                            {item.num}
                        </span>
                        <span
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 600,
                                fontSize: '12.5px',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.15,
                            }}
                        >
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            <div
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#999',
                    marginTop: '18px',
                }}
            >
                bue · fte · ush · sla
            </div>
        </aside>
    );
}

function Header({
    query,
    onQuery,
}: {
    query: string;
    onQuery: (value: string) => void;
}) {
    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '40px',
                padding: '30px 56px 22px 112px',
                borderBottom: '1px solid #000',
            }}
        >
            <div style={{ flex: 1, maxWidth: '440px' }}>
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#999',
                        marginBottom: '8px',
                    }}
                >
                    búsqueda global
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderBottom: '2px solid #000',
                        paddingBottom: '8px',
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{ flex: '0 0 16px' }}
                    >
                        <circle
                            cx="7"
                            cy="7"
                            r="5.5"
                            stroke="#000"
                            strokeWidth="1.6"
                        />
                        <line
                            x1="11.2"
                            y1="11.2"
                            x2="15"
                            y2="15"
                            stroke="#000"
                            strokeWidth="1.6"
                        />
                    </svg>
                    <input
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        placeholder="Buscar documentos, formularios, sectores…"
                        style={{
                            all: 'unset',
                            flex: 1,
                            fontFamily: "'Archivo', sans-serif",
                            fontSize: '15px',
                            fontWeight: 500,
                            color: '#000',
                        }}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '34px', textAlign: 'right' }}>
                <div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#999',
                        }}
                    >
                        dólar bna
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '22px',
                            lineHeight: 1,
                        }}
                    >
                        $1.184
                        <span style={{ color: RED }}>.</span>
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#999',
                        }}
                    >
                        hoy
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '22px',
                            lineHeight: 1,
                        }}
                    >
                        01·07·26
                    </div>
                </div>
            </div>
        </header>
    );
}

function SectionHeading({ label, hint }: { label: string; hint: string }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                borderBottom: '3px solid #000',
                paddingBottom: '10px',
                marginBottom: 0,
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
                {label}
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
                {hint}
            </div>
        </div>
    );
}

function HomeSection({
    tiles,
    onNavigate,
    showClima,
}: {
    tiles: TileItem[];
    onNavigate: (id: ViewId) => void;
    showClima: boolean;
}) {
    return (
        <section
            style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}
        >
            <div>
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#666',
                        marginBottom: '14px',
                    }}
                >
                    intranet corporativa — hub de accesos
                </div>
                <h1
                    style={{
                        fontFamily: "'Anton', sans-serif",
                        fontWeight: 400,
                        fontSize: 'clamp(64px,9vw,132px)',
                        lineHeight: 0.82,
                        letterSpacing: '-0.005em',
                        margin: 0,
                        textTransform: 'lowercase',
                    }}
                >
                    portal de
                    <br />
                    eurotur
                    <span style={{ color: RED }}>.</span>
                </h1>
                <p
                    style={{
                        maxWidth: '560px',
                        margin: '20px 0 0',
                        fontSize: '16px',
                        lineHeight: 1.45,
                        fontWeight: 600,
                        color: '#111',
                    }}
                >
                    Todo lo que usás cada día, a un toque. Elegí un acceso
                    rápido o entrá a tu sector.
                </p>
            </div>

            <div>
                <SectionHeading label="accesos rápidos" hint="uso frecuente" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5,1fr)',
                        gap: 0,
                        borderLeft: '1px solid #000',
                    }}
                >
                    {QUICK_ACCESS.map((q) => (
                        <a
                            key={q.num}
                            href={q.href}
                            target="_blank"
                            rel="noreferrer"
                            className="quick-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '170px',
                                padding: '18px',
                                textDecoration: 'none',
                                color: '#000',
                                borderRight: '1px solid #000',
                                borderBottom: '1px solid #000',
                                transition: 'background .12s,color .12s',
                            }}
                        >
                            {q.icon}
                            <div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    {q.num}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '17px',
                                        letterSpacing: '-0.01em',
                                        marginTop: '2px',
                                    }}
                                >
                                    {q.title}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <div>
                <SectionHeading
                    label="sectores"
                    hint="01 — 12 · tocá para entrar"
                />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4,1fr)',
                        gap: 0,
                        borderLeft: '1px solid #000',
                    }}
                >
                    {tiles.map((t) => (
                        <a
                            key={t.id}
                            onClick={() => onNavigate(t.id)}
                            className="tile"
                            style={{
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: '172px',
                                padding: '16px',
                                textDecoration: 'none',
                                color: '#fff',
                                borderRight: '1px solid #000',
                                borderBottom: '1px solid #000',
                                backgroundImage:
                                    'linear-gradient(rgba(0,0,0,0.42),rgba(0,0,0,0.42)),repeating-linear-gradient(45deg,#111 0 2px,#dcdcdc 2px 12px)',
                                transition: 'background .12s,color .12s',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 900,
                                        fontSize: '46px',
                                        lineHeight: 0.78,
                                    }}
                                >
                                    {t.num}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '9px',
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        opacity: 0.85,
                                    }}
                                >
                                    {t.place}
                                </div>
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 800,
                                    fontSize: '17px',
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.05,
                                }}
                            >
                                {t.label}
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {showClima && (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            borderBottom: '3px solid #000',
                            paddingBottom: '10px',
                            marginBottom: '22px',
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
                            clima
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
                            pronóstico oficinas
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            columnGap: 0,
                        }}
                    >
                        {CLIMA.map((c) => (
                            <div
                                key={c.city}
                                style={{
                                    padding: '2px 22px 2px 0',
                                    borderRight: '1px dotted #000',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        color: '#666',
                                    }}
                                >
                                    {c.city}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 900,
                                        fontSize: '56px',
                                        lineHeight: 0.85,
                                        margin: '8px 0 6px',
                                    }}
                                >
                                    {c.temp}
                                    <span
                                        style={{
                                            fontSize: '24px',
                                            verticalAlign: 'top',
                                        }}
                                    >
                                        °
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '13px',
                                    }}
                                >
                                    {c.cond}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.06em',
                                        color: '#999',
                                        marginTop: '6px',
                                    }}
                                >
                                    máx {c.hi}° · mín {c.lo}°
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function RrhhSection() {
    return (
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
                        recursos
                        <br />
                        humanos
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
                        Altas de personal, vacaciones, políticas, feriados,
                        liquidación de sueldo y organigrama. Documentación
                        oficial de Eurotur S.A. y Travel Designers S.A.
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
                    02
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 0,
                    borderTop: '3px solid #000',
                }}
            >
                {RRHH_GROUPS.map((g) => (
                    <div
                        key={g.n}
                        style={{
                            borderTop: '3px solid #000',
                            borderRight: '1px dotted #000',
                            padding: '14px 18px 26px 0',
                            marginTop: '-3px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '10px',
                                marginBottom: '12px',
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontWeight: 700,
                                    fontSize: '11px',
                                }}
                            >
                                {g.n}
                            </span>
                            <span
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 800,
                                    fontSize: '16px',
                                    letterSpacing: '-0.01em',
                                    lineHeight: 1.05,
                                }}
                            >
                                {g.title}
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '7px',
                            }}
                        >
                            {g.links.map((l) => (
                                <a
                                    key={l.h + l.t}
                                    href={l.h}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="doc-link"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#000',
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 500,
                                        fontSize: '13px',
                                        lineHeight: 1.25,
                                        borderBottom: '2px solid transparent',
                                        paddingBottom: '1px',
                                        alignSelf: 'flex-start',
                                        transition:
                                            'color .1s,border-color .1s',
                                    }}
                                >
                                    {l.t}
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '34px',
                    borderTop: '1px solid #000',
                    paddingTop: '14px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '14px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        fontWeight: 700,
                    }}
                >
                    <span style={{ color: RED }}>01</span>
                    <span style={{ color: '#ccc' }}>02</span>
                    <span style={{ color: '#ccc' }}>03</span>
                </div>
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#666',
                    }}
                >
                    mantiene— Velázquez, Romina · actualizado 06·2026
                </div>
            </div>
        </section>
    );
}

function InstitucionalSection() {
    return (
        <section>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '40px',
                    marginBottom: '28px',
                }}
            >
                <div>
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
                        acerca de eurotur — desde 1954
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(44px,6vw,84px)',
                            lineHeight: 0.84,
                            margin: 0,
                            textTransform: 'lowercase',
                            letterSpacing: '-0.005em',
                        }}
                    >
                        70 años
                        <br />
                        creando viajes
                        <span style={{ color: RED }}>.</span>
                    </h1>
                </div>
                <div
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 900,
                        fontSize: 'clamp(96px,13vw,176px)',
                        lineHeight: 0.72,
                    }}
                >
                    01
                </div>
            </div>

            <div
                style={{
                    height: '340px',
                    backgroundImage:
                        'repeating-linear-gradient(45deg,#111 0 2px,#e9e9e9 2px 11px)',
                    borderTop: '3px solid #000',
                    borderBottom: '1px solid #000',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '16px',
                    marginBottom: '34px',
                }}
            >
                <span
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#000',
                        background: '#fff',
                        padding: '4px 8px',
                    }}
                >
                    imagen b&n a sangre — glaciar perito moreno / patagonia
                </span>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.55fr 1fr',
                    gap: '56px',
                }}
            >
                <div>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '17px',
                            lineHeight: 1.6,
                            color: '#111',
                            fontWeight: 500,
                        }}
                    >
                        <span
                            style={{
                                float: 'left',
                                fontFamily: "'Anton', sans-serif",
                                fontSize: '98px',
                                lineHeight: 0.72,
                                margin: '6px 14px -6px 0',
                                color: RED,
                            }}
                        >
                            E
                        </span>
                        n Eurotur llevamos creando viajes inolvidables desde
                        1954 como uno de los principales DMC receptivos para
                        Argentina y Sudamérica, con nuestra sede central en
                        Buenos Aires y sucursales en la Patagonia —El Calafate y
                        Ushuaia— y el Noroeste, en la ciudad de Salta, reabierta
                        en 2025. También contamos con una empresa de transporte
                        de vehículos de lujo y vans pequeñas.
                    </p>
                    <p
                        style={{
                            margin: '20px 0 0',
                            fontSize: '15px',
                            lineHeight: 1.65,
                            color: '#222',
                        }}
                    >
                        Durante casi siete décadas hemos ofrecido una amplia
                        variedad de productos, desde viajes de lujo hasta
                        expediciones, desde lo tradicional hasta lo no
                        convencional. Nuestros expertos se dividen en equipos
                        especializados —Tailor Made, FITs, Grupos, MICE— y
                        trabajan con pasión para diseñar recorridos innovadores.
                    </p>
                    <p
                        style={{
                            margin: '20px 0 0',
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 800,
                            fontSize: '18px',
                            lineHeight: 1.35,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        «Conocimiento local, trabajo en equipo y formación
                        permanente» son nuestras marcas registradas.
                    </p>
                    <p
                        style={{
                            margin: '16px 0 0',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '11px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#666',
                        }}
                    >
                        miembros de WTTC · LATA · USTOA
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '28px',
                    }}
                >
                    <div
                        style={{
                            borderTop: '3px solid #000',
                            paddingTop: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '16px',
                                marginBottom: '8px',
                            }}
                        >
                            Misión
                            <span style={{ color: RED }}>—</span>
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#222',
                            }}
                        >
                            Facilitar experiencias de viaje únicas y memorables
                            en Argentina y Sudamérica, diseñando recorridos
                            innovadores y personalizados, respaldados por un
                            equipo apasionado y experto que garantiza la
                            satisfacción del pasajero en cada etapa.
                        </p>
                    </div>
                    <div
                        style={{
                            borderTop: '3px solid #000',
                            paddingTop: '12px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '16px',
                                marginBottom: '8px',
                            }}
                        >
                            Visión
                            <span style={{ color: RED }}>—</span>
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '13.5px',
                                lineHeight: 1.55,
                                color: '#222',
                            }}
                        >
                            Ser el principal referente en viajes receptivos en
                            Argentina y Sudamérica, líderes en innovación y
                            calidad, superando constantemente las expectativas y
                            estableciendo nuevos estándares en la industria del
                            turismo.
                        </p>
                    </div>
                    <div
                        style={{
                            height: '150px',
                            backgroundImage:
                                'repeating-linear-gradient(45deg,#E30613 0 2px,#ffd6d9 2px 11px)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '12px',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '9px',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#fff',
                                background: RED,
                                padding: '3px 7px',
                            }}
                        >
                            duotono rojo — ushuaia
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '52px' }}>
                <div
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 900,
                        fontSize: '19px',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                        marginBottom: '20px',
                    }}
                >
                    valores
                    <span style={{ color: RED }}>—</span>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5,1fr)',
                        gap: 0,
                    }}
                >
                    {VALORES.map((v) => (
                        <div
                            key={v.n}
                            style={{
                                borderRight: '1px dotted #000',
                                padding: '0 18px 8px 0',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '34px',
                                    lineHeight: 0.8,
                                    color: RED,
                                }}
                            >
                                {v.n}
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    letterSpacing: '-0.01em',
                                    margin: '12px 0 8px',
                                    lineHeight: 1.05,
                                }}
                            >
                                {v.t}
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '12px',
                                    lineHeight: 1.5,
                                    color: '#333',
                                }}
                            >
                                {v.d}
                            </p>
                        </div>
                    ))}
                </div>
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
                mantiene— De Bin, Aldo · actualizado 06·2026
            </div>
        </section>
    );
}

function OtherSection({ title, num }: { title: string; num: string }) {
    return (
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
                        {title}
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            maxWidth: '440px',
                            margin: '20px 0 0',
                            fontSize: '15px',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            color: '#111',
                        }}
                    >
                        Esta sección sigue la misma plantilla editorial que
                        RRHH: grilla de tarjetas-índice con línea negra
                        superior, número y lista de enlaces por grupo
                        documental.
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
                    {num}
                </div>
            </div>
            <div
                style={{
                    borderTop: '3px solid #000',
                    paddingTop: '16px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    color: '#666',
                }}
            >
                plantilla lista — pendiente de maquetar contenido de esta
                sección.
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '30px',
                padding: '20px 56px 22px 112px',
                borderTop: '1px solid #000',
                marginTop: 'auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '40px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                }}
            >
                <span>
                    <span style={{ color: '#999' }}>phone</span>
                    &nbsp;&nbsp;(011) 4000-0000
                </span>
                <span>
                    <span style={{ color: '#999' }}>email</span>
                    &nbsp;&nbsp;
                    <a
                        href="mailto:info@eurotur.tur.ar"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        info@eurotur.tur.ar
                    </a>
                </span>
                <span style={{ color: '#999' }}>
                    Av. Montes de Oca 2238, CABA
                </span>
            </div>
            <img
                src="/eurotur-logo.png"
                alt="Eurotur"
                style={{ height: '38px', width: 'auto', display: 'block' }}
            />
        </footer>
    );
}
