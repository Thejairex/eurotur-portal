import { Form, Link, router, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { PortalTour } from '@/components/portal/portal-tour';
import { useAppearance } from '@/hooks/use-appearance';
import { usePermissions } from '@/hooks/use-permissions';
import { isRateStale } from '@/lib/exchange-rates';
import { SECTORS } from '@/lib/portal-sectors';
import type { ActiveView } from '@/lib/portal-sectors';
import { home, login, logout } from '@/routes';
import { inicio } from '@/routes/admin';
import { search, searchResults } from '@/routes/portal';

const RED = '#E3000F';
const RAIL_KEY = 'menuRail';

/** Íconos de línea del menú (viewBox 24). */
const NAV_ICONS: Record<string, string> = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
    institucional: 'M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6',
    sales: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
    customercare:
        'M4 14v-2a8 8 0 0116 0v2M4 14h3v5H4zM17 14h3v5h-3zM20 19c0 1.5-2 2-5 2',
    producto: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
    operaciones: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5z',
    contrataciones: 'M6 3h9l4 4v14H6zM9 14l2 2 4-4',
    rrhh: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5',
    adm: 'M6 3h12v18H6zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2',
    traveldesigners: 'M21 3L3 11l7 3 3 7z',
    qrated: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    innovacion:
        'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z',
    it: 'M3 4h18v12H3zM8 20h8M12 16v4',
    mesa: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5v.5',
    'meeting-room': 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    'exchange-rate': 'M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4',
    responsables:
        'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6s7 2 7 6M16 11l2 2 4-4',
    'search-admin': 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
};

function formatToday(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear() % 100).padStart(2, '0');

    return `${dd}·${mm}·${yy}`;
}

function formatArs(value: number): string {
    return Math.round(value).toLocaleString('es-AR');
}

/** Barra angosta guardada por cada persona; por defecto abierta, y angosta por debajo de 800 px. */
function initialRail(): boolean {
    try {
        const saved = window.localStorage.getItem(RAIL_KEY);

        if (saved === '1' || saved === '0') {
            return saved === '1';
        }
    } catch {
        // sin localStorage (ventana privada, bloqueado): se usa el valor por defecto
    }

    return window.innerWidth < 800;
}

export default function PortalLayout({
    active = 'home',
    children,
}: {
    active?: ActiveView;
    /** Ya no se muestra (se sacó el rótulo vertical); las páginas lo siguen declarando. */
    label?: string;
    children: ReactNode;
}) {
    const [rail, setRail] = useState<boolean>(() =>
        typeof window === 'undefined' ? false : initialRail(),
    );
    const { dolarOficial, iataRate } = usePage().props;

    const toggleRail = () => {
        setRail((value) => {
            const next = !value;

            try {
                window.localStorage.setItem(RAIL_KEY, next ? '1' : '0');
            } catch {
                // sin localStorage: la elección dura mientras la página siga abierta
            }

            return next;
        });
    };

    return (
        <>
            <style>{`
                .eurotur-portal { background: var(--p-bg); color: var(--p-ink); font-family: "Segoe UI", system-ui, -apple-system, Arial, sans-serif; min-height: 100vh; }
                .eurotur-portal { --p-bg: #E2E2DF; --p-card: #fff; --p-ink: #111; --p-mut: #6B6B68; --p-line: #CFCFCB; --p-soft: #F4F4F2; --p-hover: rgba(0,0,0,.05); --p-sombra: rgba(0,0,0,.14); }
                .dark .eurotur-portal { --p-bg: #161617; --p-card: #212123; --p-ink: #F2F2F0; --p-mut: #A3A3A0; --p-line: #34343A; --p-soft: #2A2A2D; --p-hover: rgba(255,255,255,.07); --p-sombra: rgba(0,0,0,.55); --redsoft: #3A1A1D; --redtext: #FF6B75; color-scheme: dark; }
                .eurotur-portal input, .eurotur-portal select, .eurotur-portal textarea { color: var(--p-ink); }
                .eurotur-portal input::placeholder, .eurotur-portal textarea::placeholder { color: var(--p-mut); }
                .eurotur-portal { --red: #E3000F; --redsoft: #FBEDEE; --redtext: #C4000D; }
                .eurotur-portal ::selection { background: ${RED}; color: #fff; }

                /* Menú lateral: fijo; en barra angosta se despliega flotando sobre el contenido (el contenido no se mueve). */
                #portal-aside { position: fixed; left: 0; top: 0; width: 240px; height: 100vh; overflow-x: hidden; overflow-y: auto; padding: 24px 18px; border-right: 1px solid var(--p-line); background: var(--p-bg); z-index: 40; display: flex; flex-direction: column; transition: width .18s ease; }
                #portal-main { margin-left: 240px; padding: 0 40px; min-height: 100vh; display: flex; flex-direction: column; min-width: 0; }
                #portal-root[data-rail="1"] #portal-main { margin-left: 72px; }
                #portal-root[data-rail="1"] #portal-aside { width: 72px; padding: 24px 12px; }
                #portal-root[data-rail="1"] #portal-aside:hover,
                #portal-root[data-rail="1"] #portal-aside:has(:focus-visible) { width: 240px; padding: 24px 18px; box-shadow: 6px 0 24px var(--p-sombra); }
                #portal-root[data-rail="1"] #portal-aside:not(:hover):not(:has(:focus-visible)) .lbl,
                #portal-root[data-rail="1"] #portal-aside:not(:hover):not(:has(:focus-visible)) .aside-extra { display: none; }
                #portal-root[data-rail="1"] #portal-aside:not(:hover):not(:has(:focus-visible)) .nav-item { justify-content: center; padding: 11px 0; }
                #portal-root[data-rail="1"] #portal-aside:not(:hover):not(:has(:focus-visible)) .nav-item .mi { width: 22px; height: 22px; }
                #portal-root[data-rail="1"] #portal-aside:not(:hover):not(:has(:focus-visible)) .tog { margin: 0 auto 14px; }
                #portal-root[data-rail="1"] #portal-aside:not(:hover):not(:has(:focus-visible)) .tog svg { transform: none; }
                .eurotur-portal .lbl { white-space: nowrap; }
                .eurotur-portal .mi { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }

                .eurotur-portal .tog { margin: 0 0 14px auto; border: 1px solid var(--p-line); background: var(--p-card); border-radius: 10px; width: 38px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; transition: background-color .12s, border-color .12s; }
                .eurotur-portal .tog svg { width: 20px; height: 20px; stroke: var(--p-ink); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transform: scaleX(-1); transition: stroke .12s; }
                .eurotur-portal .tog:hover, .eurotur-portal .tog:focus-visible { background: #FBEDEE; border-color: ${RED}; outline: none; }
                .eurotur-portal .tog:hover svg, .eurotur-portal .tog:focus-visible svg { stroke: ${RED}; }

                .eurotur-portal .nav-item { position: relative; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; color: var(--p-ink); font-size: 14px; text-decoration: none; cursor: pointer; transition: background-color .12s, color .12s; }
                .eurotur-portal .nav-item::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 3px; border-radius: 2px; background: ${RED}; transform: scaleY(0); transition: transform .15s; }
                .eurotur-portal .nav-item:hover, .eurotur-portal .nav-item:focus-visible { background: var(--p-hover); color: ${RED}; outline: none; }
                .eurotur-portal .nav-item:hover::before, .eurotur-portal .nav-item:focus-visible::before { transform: scaleY(1); }
                .eurotur-portal .nav-item[aria-current="page"] { background: var(--redsoft); color: var(--redtext); font-weight: 600; }
                .eurotur-portal .nav-item[aria-current="page"]::before { transform: scaleY(1); }

                .eurotur-portal .search-pill { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 14px; border: 1px solid var(--p-line); border-radius: 999px; background: var(--p-card); transition: border-color .12s; }
                .eurotur-portal .search-pill:focus-within { border-color: ${RED}; box-shadow: 0 0 0 3px rgba(227,0,15,.15); }

                /* Marca roja bajo el título de cada página */
                .eurotur-portal #portal-content h1::after { content: ''; display: block; width: 44px; height: 4px; border-radius: 10px; background: var(--red); margin-top: 10px; }

                /* Franja superior: bloque de sesión */
                .eurotur-portal .session-btn { display: inline-flex; align-items: center; gap: 8px; max-width: 240px; padding: 9px 18px; border-radius: 999px; border: 1px solid transparent; font: inherit; font-size: 13px; font-weight: 700; line-height: 1.2; text-decoration: none; cursor: pointer; white-space: nowrap; transition: background-color .12s, color .12s, border-color .12s; }
                .eurotur-portal .session-btn-red { background: ${RED}; color: #fff; }
                .eurotur-portal .session-btn-red:hover, .eurotur-portal .session-btn-red:focus-visible { background: var(--p-ink); color: var(--p-card); outline: none; }
                .eurotur-portal .session-btn-white { background: var(--p-card); color: var(--p-ink); border-color: #CFCFCB; }
                .eurotur-portal .session-btn-white:hover, .eurotur-portal .session-btn-white:focus-visible { background: var(--redsoft); border-color: var(--red); color: var(--redtext); outline: none; }
                .eurotur-portal .session-name { overflow: hidden; text-overflow: ellipsis; }
                .eurotur-portal .session-menu { position: absolute; right: 0; top: calc(100% + 6px); min-width: 180px; background: var(--p-card); border-radius: 12px; box-shadow: 0 8px 24px var(--p-sombra); padding: 6px; z-index: 60; }
                .eurotur-portal .session-menu-item { display: block; width: 100%; padding: 10px 12px; border: none; border-radius: 8px; background: transparent; font: inherit; font-size: 14px; text-align: left; color: var(--p-ink); cursor: pointer; transition: background-color .12s, color .12s; }
                .eurotur-portal .session-menu-item:hover, .eurotur-portal .session-menu-item:focus-visible { background: var(--redsoft); color: var(--redtext); outline: none; }

                /* Tipo de cambio: tres columnas alineadas a la derecha, a la altura de la base del título */
                .eurotur-portal #portal-rates { display: flex; gap: 22px; text-align: right; font-size: 12px; align-self: flex-end; margin: 0 0 8px; }
                @media (min-width: 1100px) {
                    .eurotur-portal #portal-rates { position: absolute; right: 0; top: 4px; margin: 0; align-self: auto; }
                    .eurotur-portal #portal-content h1 { max-width: calc(100vw - 720px); }
                }

                .eurotur-portal .logout-btn:hover { background: var(--p-ink) !important; color: var(--p-card) !important; }
                .eurotur-portal .backoffice-btn:hover { background: var(--p-ink) !important; color: var(--p-card) !important; }
                .eurotur-portal .login-btn:hover { background: var(--p-ink) !important; color: var(--p-card) !important; }

                /* Tarjetas de sector: sube 3 px, línea roja abajo; la sombra más marcada aparece con opacidad (no se anima box-shadow). */
                .eurotur-portal .card { position: relative; isolation: isolate; background: var(--p-card); border-radius: 16px; padding: 20px 22px 14px; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: transform .2s; }
                .eurotur-portal .card::before { content: ''; position: absolute; inset: 0; border-radius: 16px; box-shadow: 0 10px 22px rgba(0,0,0,.10); opacity: 0; transition: opacity .2s; z-index: -1; pointer-events: none; }
                .eurotur-portal .card::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; border-radius: 0 0 16px 16px; background: ${RED}; transform: scaleX(0); transform-origin: left; transition: transform .25s ease-out; pointer-events: none; }
                .eurotur-portal .card-l { grid-row: span 2; }
                .eurotur-portal .card:hover { transform: translateY(-3px); }
                .eurotur-portal .card:hover::before { opacity: 1; }
                .eurotur-portal .card:hover::after { transform: scaleX(1); }
                .eurotur-portal .card .ico { width: 20px; height: 20px; stroke: var(--red); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; transition: stroke .15s; }

                .eurotur-portal .doc-link { position: relative; display: flex; justify-content: space-between; gap: 10px; padding: 10px; margin: 0 -10px; border-radius: 10px; color: var(--p-ink); font-size: 14.5px; text-decoration: none; transition: background-color .12s, color .12s; }
                .eurotur-portal .doc-link::before { content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 3px; border-radius: 2px; background: ${RED}; transform: scaleY(0); transition: transform .15s; }
                .eurotur-portal .doc-link .doc-arrow { color: var(--p-mut); transition: transform .15s, color .12s; }
                .eurotur-portal .doc-link:hover, .eurotur-portal .doc-link:focus-visible { background: var(--redsoft); color: var(--redtext); outline: none; }
                .eurotur-portal .doc-link:hover::before, .eurotur-portal .doc-link:focus-visible::before { transform: scaleY(1); }
                .eurotur-portal .doc-link:hover .doc-arrow, .eurotur-portal .doc-link:focus-visible .doc-arrow { color: ${RED}; transform: translate(3px, -3px); }

                /* Portada: accesos rápidos y sectores con foto. */
                .eurotur-portal .quick-card { position: relative; isolation: isolate; overflow: hidden; background: var(--p-card); border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); transition: transform .2s; }
                .eurotur-portal .quick-card::after, .eurotur-portal .tile::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: ${RED}; transform: scaleX(0); transform-origin: left; transition: transform .25s ease-out; z-index: 2; pointer-events: none; }
                .eurotur-portal .quick-card:hover, .eurotur-portal .tile:hover { transform: translateY(-3px); }
                .eurotur-portal .quick-card:hover::after, .eurotur-portal .tile:hover::after { transform: scaleX(1); }
                .eurotur-portal .quick-card .q-arrow, .eurotur-portal .tile .tile-arrow { transition: transform .15s, color .12s; }
                .eurotur-portal .quick-card:hover .q-arrow { color: ${RED}; transform: translate(3px, -3px); }
                .eurotur-portal .tile:hover .tile-arrow { transform: translateX(4px); }
                .eurotur-portal .tile { position: relative; overflow: hidden; isolation: isolate; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.05); background: #222; transition: transform .2s; }
                .eurotur-portal .tile .tile-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); z-index: 0; }
                .eurotur-portal .tile .tile-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,.18)); z-index: 1; }
                .eurotur-portal .tile .tile-title { position: relative; z-index: 2; }

                .eurotur-portal .search-result:hover { background: ${RED}; color: #fff; }
                .eurotur-portal .social-link:hover { color: ${RED}; }
                .eurotur-portal .search-result:hover div { color: #fff !important; }
                .eurotur-portal .search-result-active { background: ${RED}; color: #fff; }
                .eurotur-portal .search-result-active div { color: #fff !important; }
                .eurotur-portal .qrated-cta:hover { background: #b3050f; transform: translateY(-3px); }
                .eurotur-portal .qrated-cat { color: var(--p-ink); }
                .eurotur-portal .qrated-cat-num { color: #999; }
                .eurotur-portal .qrated-cat-desc { color: #777; }
                .eurotur-portal .qrated-cat:hover { transform: translateY(-3px); }
                .eurotur-portal .mesa-cred-btn:hover { background: var(--p-ink); color: var(--p-card); }
                .eurotur-portal .mesa-copy-btn:hover { background: ${RED}; color: #fff; border-color: ${RED}; }
                .eurotur-portal .innov-frente-header { border-radius: 16px; }
                .eurotur-portal .innov-frente-header:hover { background: #FBEDEE; box-shadow: inset 3px 0 0 ${RED}; }
                .eurotur-portal .innov-mosaic-item { border-radius: 12px; }
                .eurotur-portal .innov-mosaic-item:hover { border-color: ${RED}; transform: translateY(-3px); }
                .eurotur-portal .innov-instr-card:hover { background: #FBEDEE; }
                .eurotur-portal .innov-instr-link:hover { background: #b3050f; transform: translateX(3px); }

                @media (prefers-reduced-motion: reduce) {
                    .eurotur-portal *, .eurotur-portal *::before, .eurotur-portal *::after { transition: none !important; animation: none !important; }
                    .eurotur-portal .card:hover, .eurotur-portal .quick-card:hover, .eurotur-portal .tile:hover { transform: none; }
                    .eurotur-portal .doc-link:hover .doc-arrow, .eurotur-portal .doc-link:focus-visible .doc-arrow, .eurotur-portal .tile:hover .tile-arrow, .eurotur-portal .quick-card:hover .q-arrow { transform: none; }
                }

                @media (max-width: 900px) {
                    #portal-content [style*="repeat(5"] { grid-template-columns: repeat(3,1fr) !important; }
                    #portal-content [style*="repeat(4"] { grid-template-columns: repeat(3,1fr) !important; }
                    #portal-content [style*="1.55fr 1fr"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="0.82fr 1.18fr"] { grid-template-columns: 1fr !important; }
                    #portal-content [style*="1.08fr 0.92fr"] { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 800px) {
                    #portal-main { padding: 0 18px; }
                    #portal-rates { display: none !important; }
                    #portal-footer { flex-direction: column; align-items: flex-start !important; gap: 16px !important; }
                    #portal-footer > div { flex-wrap: wrap; gap: 10px 22px !important; }
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
                data-page={active}
                data-rail={rail ? '1' : '0'}
            >
                <Sidebar active={active} onToggleRail={toggleRail} />

                <main id="portal-main">
                    <Header />

                    <div
                        id="portal-content"
                        style={{
                            flex: 1,
                            minWidth: 0,
                            position: 'relative',
                            padding: '8px 0 24px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Rates
                            dolarOficial={dolarOficial}
                            iataRate={iataRate}
                        />
                        {children}
                    </div>

                    <Footer />
                </main>
            </div>

            <PortalTour />
        </>
    );
}

function NavIcon({ id }: { id: string }) {
    return (
        <svg className="mi" viewBox="0 0 24 24" aria-hidden="true">
            <path d={NAV_ICONS[id] ?? NAV_ICONS.home} />
        </svg>
    );
}

function Sidebar({
    active,
    onToggleRail,
}: {
    active: ActiveView;
    onToggleRail: () => void;
}) {
    const { can } = usePermissions();
    const visibleSectors = SECTORS.filter(
        (sector) =>
            !sector.requiredPermission || can(sector.requiredPermission),
    );
    // "Buscador" (editores) se muestra al final del menu, aparte del resto.
    const navSectors = visibleSectors.filter(
        (sector) => sector.id !== 'search-admin',
    );
    const searchAdminSector = visibleSectors.find(
        (sector) => sector.id === 'search-admin',
    );
    const navItems = searchAdminSector
        ? [...navSectors, searchAdminSector]
        : navSectors;

    return (
        <aside id="portal-aside">
            <button
                type="button"
                className="tog"
                onClick={onToggleRail}
                aria-label="Mostrar u ocultar el menú"
                title="Mostrar / ocultar menú"
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 4h18v16H3zM9 4v16M14 9l3 3-3 3" />
                </svg>
            </button>

            <div className="aside-extra">
                <Link
                    href={home()}
                    style={{ display: 'block', textDecoration: 'none' }}
                >
                    <img
                        src="/eurotur-logo.png"
                        alt="Eurotur — 70 años"
                        width={120}
                        style={{ height: 'auto', display: 'block' }}
                    />
                </Link>
                <div
                    style={{
                        fontSize: '11px',
                        color: 'var(--p-mut)',
                        letterSpacing: '0.08em',
                        margin: '6px 0 18px',
                        lineHeight: 1.5,
                        textTransform: 'uppercase',
                    }}
                >
                    portal interno
                    <br />
                    dmc · desde 1954
                </div>
            </div>

            <nav
                id="portal-nav"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                }}
            >
                <Link
                    href={home()}
                    className="nav-item"
                    title="Inicio"
                    data-tour="portal-nav-home"
                    aria-current={active === 'home' ? 'page' : undefined}
                >
                    <NavIcon id="home" />
                    <span className="lbl">Inicio</span>
                </Link>
                {navItems.map((sector) => (
                    <Link
                        key={sector.id}
                        href={sector.href}
                        title={sector.navLabel}
                        data-tour={`portal-nav-${sector.id}`}
                        className="nav-item"
                        aria-current={sector.id === active ? 'page' : undefined}
                    >
                        <NavIcon id={sector.id} />
                        <span className="lbl">{sector.navLabel}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

type SearchResult = {
    id: string;
    label: string;
    url: string;
    groupTitle: string | null;
    sectorLabel: string | null;
    sectorHref: string | null;
};

function GlobalSearch({ compact = false }: { compact?: boolean } = {}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const requestId = useRef(0);
    const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        const trimmed = query.trim();
        const id = ++requestId.current;

        const timeout = setTimeout(() => {
            if (trimmed.length < 2) {
                setResults([]);
                setActiveIndex(-1);
                setLoading(false);

                return;
            }

            setLoading(true);

            fetch(search.url({ query: { q: trimmed } }), {
                headers: { Accept: 'application/json' },
            })
                .then((response) => response.json())
                .then((data: SearchResult[]) => {
                    if (id === requestId.current) {
                        setResults(data);
                        setActiveIndex(-1);
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (id === requestId.current) {
                        setLoading(false);
                    }
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [query]);

    useEffect(() => {
        if (activeIndex >= 0 && resultRefs.current[activeIndex]) {
            resultRefs.current[activeIndex]?.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [activeIndex]);

    const showDropdown = open && query.trim().length >= 2;

    const iconSize = compact ? 14 : 16;
    const inputFont = compact ? '13px' : '15px';
    const gap = compact ? '8px' : '12px';

    return (
        <div
            style={{
                position: 'relative',
                width: compact ? '100%' : undefined,
            }}
            data-testid={compact ? 'search-aside' : 'search-header'}
        >
            {!compact && (
                <div
                    style={{
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontSize: '9px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--p-mut)',
                        marginBottom: '8px',
                    }}
                >
                    búsqueda global
                </div>
            )}
            <div className="search-pill" style={{ gap }}>
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ flex: `0 0 ${iconSize}px` }}
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
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            if (!showDropdown || results.length === 0) {
                                return;
                            }

                            e.preventDefault();
                            setActiveIndex((i) =>
                                i < results.length - 1 ? i + 1 : 0,
                            );
                        } else if (e.key === 'ArrowUp') {
                            if (!showDropdown || results.length === 0) {
                                return;
                            }

                            e.preventDefault();
                            setActiveIndex((i) =>
                                i > 0 ? i - 1 : results.length - 1,
                            );
                        } else if (e.key === 'Enter') {
                            e.preventDefault();

                            if (activeIndex >= 0) {
                                window.open(results[activeIndex].url, '_blank');
                                setOpen(false);
                                setActiveIndex(-1);
                            } else {
                                const trimmed = query.trim();

                                if (trimmed.length >= 2) {
                                    router.visit(
                                        searchResults.url({
                                            query: { q: trimmed },
                                        }),
                                    );
                                }
                            }
                        } else if (e.key === 'Escape') {
                            setOpen(false);
                            setActiveIndex(-1);
                        }
                    }}
                    placeholder={
                        compact
                            ? 'Buscar…'
                            : 'Buscar documentos, formularios, sectores…'
                    }
                    style={{
                        all: 'unset',
                        flex: 1,
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontSize: inputFont,
                        fontWeight: 500,
                        color: 'var(--p-ink)',
                    }}
                />
            </div>

            {showDropdown && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--p-card)',
                        border: '1px solid #000',
                        maxHeight: '360px',
                        overflowY: 'auto',
                        zIndex: 50,
                    }}
                >
                    {loading && (
                        <div
                            style={{
                                padding: '12px 16px',
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '11px',
                                color: 'var(--p-mut)',
                            }}
                        >
                            buscando…
                        </div>
                    )}
                    {!loading && results.length === 0 && (
                        <div
                            style={{
                                padding: '12px 16px',
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '11px',
                                color: 'var(--p-mut)',
                            }}
                        >
                            sin resultados.
                        </div>
                    )}
                    {!loading &&
                        results.map((result, i) => (
                            <a
                                key={result.id}
                                ref={(el) => {
                                    resultRefs.current[i] = el;
                                }}
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setOpen(false)}
                                className={`search-result${i === activeIndex ? 'search-result-active' : ''}`}
                                style={{
                                    display: 'block',
                                    textDecoration: 'none',
                                    color: 'var(--p-ink)',
                                    padding: '10px 16px',
                                    borderBottom: '1px dotted #ccc',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                        fontWeight: 700,
                                        fontSize: '13px',
                                    }}
                                >
                                    {result.label}
                                </div>
                                <div
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                        fontSize: '10px',
                                        letterSpacing: '0.04em',
                                        color: 'var(--p-mut)',
                                        marginTop: '2px',
                                    }}
                                >
                                    {[result.sectorLabel, result.groupTitle]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </div>
                            </a>
                        ))}
                </div>
            )}
        </div>
    );
}

function Header() {
    return (
        <header
            id="portal-header"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                padding: '14px 0 4px',
                fontSize: '12px',
                color: 'var(--p-mut)',
            }}
        >
            <div
                id="portal-search-aside"
                style={{ flex: 1, maxWidth: '440px' }}
            >
                <GlobalSearch compact />
            </div>
            <SessionBlock />
        </header>
    );
}

/** Bloque de sesión de la franja superior: iniciar sesión, o Back Office + menú con el nombre y «Salir de sesión». */
function SessionBlock() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);
    const { resolvedAppearance, updateAppearance } = useAppearance();

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            if (!boxRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    if (!auth.user) {
        return (
            <Link href={login()} className="session-btn session-btn-red">
                Iniciar sesión
            </Link>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
            }}
        >
            {/* El Back Office es para todas las personas con sesión: Inicio, Mi perfil, Novedades y Descargas;
                lo demás del menú depende de los permisos de cada una. */}
            <Link href={inicio()} className="session-btn session-btn-red">
                Back Office
            </Link>
            <div ref={boxRef} style={{ position: 'relative' }}>
                <button
                    type="button"
                    className="session-btn session-btn-white"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={() => setOpen((value) => !value)}
                >
                    <span className="session-name">{auth.user.name}</span>
                    <span
                        aria-hidden="true"
                        style={{
                            display: 'inline-block',
                            transform: open ? 'rotate(180deg)' : 'none',
                            transition: 'transform .15s',
                        }}
                    >
                        ⌄
                    </span>
                </button>
                {open && (
                    <div role="menu" className="session-menu">
                        <button
                            type="button"
                            role="menuitem"
                            className="session-menu-item"
                            onClick={() => {
                                updateAppearance(
                                    resolvedAppearance === 'dark'
                                        ? 'light'
                                        : 'dark',
                                );
                                setOpen(false);
                            }}
                        >
                            {resolvedAppearance === 'dark'
                                ? 'Modo claro'
                                : 'Modo oscuro'}
                        </button>
                        <Form {...logout.form()}>
                            {({ processing }) => (
                                <button
                                    type="submit"
                                    role="menuitem"
                                    disabled={processing}
                                    className="session-menu-item"
                                    autoFocus
                                >
                                    Salir de sesión
                                </button>
                            )}
                        </Form>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Tipo de cambio (dólar IATA, dólar BNA y fecha de hoy). Arriba a la derecha, debajo de los botones de sesión
 * y a la altura de la base del título; por debajo de 1100 px pasa al flujo normal, debajo de la franja superior.
 */
function Rates({
    dolarOficial,
    iataRate,
}: {
    dolarOficial: {
        venta: number;
        fecha: string | null;
    } | null;
    iataRate: { rate: number; updatedAt: string | null; stale: boolean } | null;
}) {
    const iataStale =
        iataRate?.stale || isRateStale(iataRate?.updatedAt ?? null);
    const bnaStale = isRateStale(dolarOficial?.fecha ?? null);

    const valueStyle: React.CSSProperties = {
        display: 'block',
        color: 'var(--p-ink)',
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: 1.2,
    };
    const labelStyle = (stale: boolean): React.CSSProperties => ({
        display: 'block',
        fontSize: '12px',
        textTransform: 'uppercase',
        color: stale ? RED : '#6B6B68',
    });
    const staleBadge = (
        <span
            style={{
                background: RED,
                color: '#fff',
                borderRadius: '999px',
                padding: '1px 7px',
                fontSize: '10px',
                marginLeft: '6px',
            }}
        >
            desact.
        </span>
    );

    return (
        <div id="portal-rates" data-testid="home-dollars">
            <div data-testid="meta-iata">
                <span style={labelStyle(iataStale)}>
                    dólar iata
                    {iataStale && staleBadge}
                </span>
                <b style={valueStyle} data-testid="meta-val">
                    {iataRate !== null ? `$${formatArs(iataRate.rate)}` : '—'}
                </b>
            </div>
            <div data-testid="meta-bna">
                <span style={labelStyle(bnaStale)}>
                    dólar bna
                    {bnaStale && staleBadge}
                </span>
                <b style={valueStyle} data-testid="meta-val">
                    {dolarOficial !== null
                        ? `$${formatArs(dolarOficial.venta)}`
                        : '—'}
                </b>
            </div>
            {/* Pedido de Operaciones (USD, BRL y CLP): se muestra como "próximamente" hasta definir la fuente del dato. */}
            <div
                data-testid="meta-tarifario"
                title="Cambio para tarifario (USD, BRL y CLP): próximamente"
            >
                <span style={labelStyle(false)}>cambio tarifario (cpt)</span>
                <b
                    style={{
                        ...valueStyle,
                        color: '#8a8a86',
                        fontWeight: 600,
                        fontSize: '14px',
                    }}
                    data-testid="meta-val"
                >
                    Próximamente
                </b>
            </div>
            <div data-testid="meta-hoy">
                <span style={labelStyle(false)}>hoy</span>
                <b style={valueStyle} data-testid="meta-val">
                    {formatToday()}
                </b>
            </div>
        </div>
    );
}

const PORTAL_PHONE = 'tel:+541143126077';

/** Flickr no está en lucide: su logo son dos puntos. */
function FlickrIcon({ size = 16 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <circle cx="7" cy="12" r="5" />
            <circle cx="17" cy="12" r="5" />
        </svg>
    );
}

const SOCIAL_LINKS: {
    label: string;
    href: string;
    icon: ComponentType<{ size?: number }>;
}[] = [
    {
        label: 'Facebook',
        href: 'https://www.facebook.com/Eurotur.Incoming',
        icon: Facebook,
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/eurotur.incoming/',
        icon: Instagram,
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/company/euroturincoming',
        icon: Linkedin,
    },
    {
        label: 'YouTube',
        href: 'https://www.youtube.com/c/Euroturincoming',
        icon: Youtube,
    },
    {
        label: 'Flickr',
        href: 'https://www.flickr.com/photos/182100254@N02/',
        icon: FlickrIcon,
    },
];

function Footer() {
    return (
        <footer
            id="portal-footer"
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '30px',
                padding: '16px 0 20px',
            }}
        >
            <>
                <span style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    <span style={{ color: 'var(--p-mut)' }}>phone</span>
                    &nbsp;&nbsp;
                    <a
                        href={PORTAL_PHONE}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                        +54 11 4312 6077
                    </a>
                </span>
                <span
                    style={{
                        color: 'var(--p-mut)',
                        fontSize: '13px',
                        textAlign: 'center',
                    }}
                >
                    Tucumán 825, piso 5, Capital Federal, Argentina
                </span>
            </>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '28px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontSize: '10px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--p-mut)',
                    }}
                >
                    <span>redes —</span>
                    {SOCIAL_LINKS.map((social) => (
                        <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={social.label}
                            title={social.label}
                            className="social-link"
                            style={{
                                display: 'inline-flex',
                                color: 'inherit',
                                transition: 'color .12s',
                            }}
                        >
                            <social.icon size={16} />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
