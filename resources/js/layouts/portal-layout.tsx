import { Link, usePage } from '@inertiajs/react';
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

export default function PortalLayout({
    active = 'home',
    label = 'inicio—',
    children,
}: {
    active?: ActiveView;
    label?: string;
    children: ReactNode;
}) {
    const [query, setQuery] = useState('');
    const { dolarOficialVenta } = usePage().props;

    return (
        <>
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
                <Sidebar active={active} />

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

function Sidebar({ active }: { active: ActiveView }) {
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
            <Link
                href={home()}
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
            </Link>

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
                        01·07·26
                    </div>
                </div>
            </div>
        </header>
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
