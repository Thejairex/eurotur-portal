import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { SECTORS } from '@/lib/portal-sectors';
import type { ActiveView } from '@/lib/portal-sectors';
import { home } from '@/routes';

const RED = '#E30613';
const STRIPE_ACCENT = true;

function formatArs(value: number): string {
    return Math.round(value).toLocaleString('es-AR');
}

function formatToday(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear() % 100).padStart(2, '0');

    return `${dd}·${mm}·${yy}`;
}

export default function PortalLayout({
    active = 'home',
    label = 'Inicio—',
    children,
}: {
    active?: ActiveView;
    label?: string;
    children: ReactNode;
}) {
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const { dolarOficialVenta } = usePage().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
                />
            </Head>

            <style>{`
                .eurotur-portal ::selection { background: ${RED}; color: #fff; }
                .eurotur-portal .nav-item:hover { background: ${RED}; color: #fff; transform: translateX(5px); }
                .eurotur-portal .quick-card:hover { background: ${RED}; color: #fff; transform: translateY(-5px); }
                .eurotur-portal .tile:hover { background-image: none; background-color: ${RED}; color: #fff; transform: translateY(-5px); }
                .eurotur-portal .doc-link:hover { color: ${RED}; border-color: ${RED}; transform: translateX(3px); }
                .eurotur-portal .qrated-cta:hover { background: #b3050f; transform: translateY(-3px); }
                .eurotur-portal .mesa-cred-btn:hover { background: #000; color: #fff; }
                .eurotur-portal .mesa-copy-btn:hover { background: ${RED}; color: #fff; border-color: ${RED}; }
                .eurotur-portal .innov-frente-header:hover { background: #faf7f7; transform: translateX(4px); }
                .eurotur-portal .innov-mosaic-item:hover { border-color: #000; transform: translateY(-3px); }
                .eurotur-portal .innov-instr-card:hover { background: #faf7f7; }
                .eurotur-portal .innov-instr-link:hover { background: #b3050f; transform: translateX(3px); }

                @media (max-width: 860px) {
                    #portal-root { flex-direction: column; }
                    #portal-aside { width: 100% !important; flex: none !important; position: sticky !important; top: 0 !important; height: auto !important; align-self: auto !important; z-index: 40; background: #fff; border-right: none !important; border-bottom: 1px solid #000; padding: 14px 18px !important; }
                    #portal-asidetop { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
                    #portal-burger { display: flex !important; }
                    #portal-nav { display: none !important; }
                    #portal-aside[data-menu="open"] #portal-nav { display: flex !important; margin-top: 14px; }
                    #portal-divider { display: none; }
                    #portal-aside[data-menu="open"] #portal-divider { display: block; margin: 14px 0 0 !important; }
                    #portal-asidefoot { display: none; }
                    #portal-aside[data-menu="open"] #portal-asidefoot { display: block; }
                    #portal-vlabel { display: none !important; }
                    #portal-header { flex-direction: column; align-items: flex-start !important; gap: 18px !important; padding: 22px 20px 18px !important; }
                    #portal-header > div { max-width: none !important; width: 100%; }
                    #portal-content { padding: 26px 20px 32px !important; }
                    #portal-footer { flex-direction: column; align-items: flex-start !important; gap: 16px !important; padding: 20px !important; }
                    #portal-footer > div { flex-wrap: wrap; gap: 10px 22px !important; }
                }
                @media (max-width: 900px) {
                    #portal-content [style*="repeat(5"] { grid-template-columns: repeat(3,1fr) !important; }
                    #portal-content [style*="repeat(4"] { grid-template-columns: repeat(3,1fr) !important; }
                    #portal-content [style*="1.55fr 1fr"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="0.82fr 1.18fr"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="1.08fr 0.92fr"] { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    #portal-content [style*="repeat(5"],
                    #portal-content [style*="repeat(4"],
                    #portal-content [style*="repeat(3"] { grid-template-columns: repeat(2,1fr) !important; }
                    #portal-content [style*="repeat(2"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="gap:18px"] { flex-wrap: wrap; row-gap: 8px !important; }
                    #portal-content #qrated-cats { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div
                id="portal-root"
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
                    active={active}
                    menuOpen={menuOpen}
                    onToggleMenu={() => setMenuOpen((v) => !v)}
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
                    <Header
                        query={query}
                        onQuery={setQuery}
                        dolarOficialVenta={dolarOficialVenta}
                    />

                    {STRIPE_ACCENT && (
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
                        id="portal-vlabel"
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
                            {label}
                        </div>
                    </div>

                    <div
                        id="portal-content"
                        style={{
                            flex: 1,
                            padding: '44px 56px 40px 112px',
                            position: 'relative',
                        }}
                    >
                        {children}
                    </div>

                    <Footer />
                </main>
            </div>
        </>
    );
}

function Sidebar({
    active,
    menuOpen,
    onToggleMenu,
}: {
    active: ActiveView;
    menuOpen: boolean;
    onToggleMenu: () => void;
}) {
    return (
        <aside
            id="portal-aside"
            data-menu={menuOpen ? 'open' : 'closed'}
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
            <div id="portal-asidetop">
                <Link
                    href={home()}
                    style={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'block',
                    }}
                >
                    <img
                        src="/eurotur-logo.png"
                        alt="Eurotur — 70 años"
                        style={{
                            width: '118px',
                            height: 'auto',
                            display: 'block',
                        }}
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
                </Link>
                <button
                    id="portal-burger"
                    type="button"
                    onClick={onToggleMenu}
                    style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        background: '#000',
                        color: '#fff',
                        border: 'none',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding: '11px 14px',
                    }}
                >
                    {menuOpen ? 'Cerrar ✕' : 'Menú ≡'}
                </button>
            </div>

            <div
                id="portal-divider"
                style={{
                    height: '1px',
                    background: '#000',
                    margin: '24px 0 20px',
                }}
            />

            <nav
                id="portal-nav"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    flex: 1,
                }}
            >
                {SECTORS.map((sector) => (
                    <Link
                        key={sector.id}
                        href={sector.href}
                        className="nav-item"
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '9px',
                            padding: '5px 4px',
                            color: sector.id === active ? RED : '#000',
                            transition:
                                'color .12s, background .12s, transform .12s',
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
                            {sector.num}
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
                            {sector.navLabel}
                        </span>
                    </Link>
                ))}
            </nav>

            <div
                id="portal-asidefoot"
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
    dolarOficialVenta,
}: {
    query: string;
    onQuery: (value: string) => void;
    dolarOficialVenta: number | null;
}) {
    return (
        <header
            id="portal-header"
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
                        {dolarOficialVenta !== null
                            ? `$${formatArs(dolarOficialVenta)}`
                            : '—'}
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
                        {formatToday()}
                    </div>
                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer
            id="portal-footer"
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
                        href="mailto:portal@eurotur.tur.ar"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        portal@eurotur.tur.ar
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
