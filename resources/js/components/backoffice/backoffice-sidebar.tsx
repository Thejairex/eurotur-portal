import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronDown,
    Clock,
    Download,
    FileText,
    Home,
    LogOut,
    Pencil,
    Settings,
    User,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/backoffice/theme-toggle';
import { usePermissions } from '@/hooks/use-permissions';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';
import { home, logout } from '@/routes';
import { inicio } from '@/routes/admin';
import { index as crmIndex } from '@/routes/admin/crm';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';

/** Guarda en el navegador si "Herramientas" quedó abierta o cerrada. */
const TOOLS_KEY = 'bo-tools-open';

const readToolsFlag = (): boolean | null => {
    try {
        const stored = localStorage.getItem(TOOLS_KEY);

        return stored === null ? null : stored === '1';
    } catch {
        return null;
    }
};

/** Opción del menú que todavía no está lista: se ve, pero no se puede tocar. */
function PendingLink({
    icon: Icon,
    label,
    note,
}: {
    icon: LucideIcon;
    label: string;
    note: string;
}) {
    return (
        <span className="bo-link bo-link-off" aria-disabled="true">
            <Icon size={18} aria-hidden="true" />
            {label}
            <span className="bo-soon">{note}</span>
        </span>
    );
}

/**
 * Menú lateral rojo del Back Office: Inicio, las secciones, "Herramientas" con cada una de
 * las herramientas habilitadas, y abajo Configuración (usuarios, roles y modo de color),
 * Volver al portal y Salir de sesión.
 */
export function BackofficeSidebar() {
    const { url, props } = usePage();
    const { can } = usePermissions();

    const tools = BACKOFFICE_TOOLS.filter((tool) => can(tool.permission));
    const path = url.split('?')[0].replace(/\/+$/, '');

    const configLinks = [
        {
            label: 'Usuarios',
            href: usersIndex(),
            allowed: can('users.manage'),
            match: '/administracion/usuarios',
        },
        {
            label: 'Roles',
            href: rolesIndex(),
            allowed: can('roles.manage'),
            match: '/administracion/roles',
        },
    ].filter((link) => link.allowed);
    const configActive = configLinks.some((link) =>
        path.startsWith(link.match),
    );
    const [configOpen, setConfigOpen] = useState(configActive);
    const open = configOpen || configActive;

    const onHub = path === '/administracion/crm';
    const onToolsPage =
        onHub ||
        tools.some(
            (tool) => tool.match !== undefined && path.startsWith(tool.match),
        );
    // Sin elección guardada, se abre sola solo cuando se está dentro de una herramienta.
    const [toolsOpen, setToolsOpen] = useState<boolean | null>(readToolsFlag);
    const toolsShown = toolsOpen ?? onToolsPage;
    const toggleTools = () => {
        const next = !toolsShown;

        setToolsOpen(next);

        try {
            localStorage.setItem(TOOLS_KEY, next ? '1' : '0');
        } catch {
            // Sin almacenamiento: queda como está hasta recargar.
        }
    };

    return (
        <aside className="bo-aside">
            <Link href={home()} className="bo-brand" style={{ color: '#fff' }}>
                <img
                    src="/img/eurotur-logo-blanco.webp"
                    alt="Eurotur"
                    className="bo-brand-logo"
                />
                <div>
                    <b>Back Office</b>
                    <small>PORTAL EUROTUR</small>
                </div>
            </Link>

            <nav className="bo-nav" data-tour="tour-areas">
                <Link
                    href={inicio()}
                    className={
                        path === '/administracion/inicio'
                            ? 'bo-link bo-link-on'
                            : 'bo-link'
                    }
                >
                    <Home size={18} aria-hidden="true" />
                    Inicio
                </Link>
                <Link
                    href="/administracion/paginas"
                    className={
                        path === '/administracion/paginas'
                            ? 'bo-link bo-link-on'
                            : 'bo-link'
                    }
                >
                    <Pencil size={18} aria-hidden="true" />
                    Editar páginas
                </Link>
                <Link
                    href="/administracion/perfil"
                    className={
                        path === '/administracion/perfil'
                            ? 'bo-link bo-link-on'
                            : 'bo-link'
                    }
                >
                    <User size={18} aria-hidden="true" />
                    Mi perfil
                </Link>
                <Link
                    href="/administracion/novedades"
                    className={
                        path === '/administracion/novedades'
                            ? 'bo-link bo-link-on'
                            : 'bo-link'
                    }
                >
                    <FileText size={18} aria-hidden="true" />
                    Novedades
                    {props.novedadesSinLeer > 0 && (
                        <span className="bo-link-badge">
                            {props.novedadesSinLeer}
                        </span>
                    )}
                </Link>
                <Link
                    href="/administracion/descargas"
                    className={
                        path === '/administracion/descargas'
                            ? 'bo-link bo-link-on'
                            : 'bo-link'
                    }
                >
                    <Download size={18} aria-hidden="true" />
                    Descargas
                </Link>

                {tools.length > 0 && (
                    <>
                        <div className="bo-link-split">
                            <Link
                                href={crmIndex()}
                                data-tour="tour-herramientas"
                                className={
                                    onHub ? 'bo-link bo-link-on' : 'bo-link'
                                }
                            >
                                <Wrench size={18} aria-hidden="true" />
                                Herramientas
                            </Link>
                            <button
                                type="button"
                                className="bo-chev-btn"
                                aria-expanded={toolsShown}
                                aria-label={
                                    toolsShown
                                        ? 'Plegar herramientas'
                                        : 'Desplegar herramientas'
                                }
                                onClick={toggleTools}
                            >
                                <ChevronDown
                                    size={16}
                                    aria-hidden="true"
                                    className={
                                        toolsShown ? 'bo-chev-open' : undefined
                                    }
                                />
                            </button>
                        </div>
                        {toolsShown &&
                            tools.map((tool) => {
                                const active =
                                    tool.match !== undefined &&
                                    path.startsWith(tool.match);
                                const className = active
                                    ? 'bo-link bo-link-sub bo-link-on'
                                    : 'bo-link bo-link-sub';

                                return tool.external ? (
                                    <a
                                        key={tool.id}
                                        href={tool.href.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={className}
                                    >
                                        {tool.navLabel}{' '}
                                        <span aria-hidden="true">↗</span>
                                    </a>
                                ) : (
                                    <Link
                                        key={tool.id}
                                        href={tool.href}
                                        className={className}
                                    >
                                        {tool.navLabel}
                                    </Link>
                                );
                            })}
                    </>
                )}

                <PendingLink
                    icon={Clock}
                    label="Historial"
                    note="en planeación"
                />
            </nav>

            <div className="bo-foot">
                <div data-tour="tour-config">
                    <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setConfigOpen((value) => !value)}
                        className="bo-link"
                    >
                        <Settings size={18} aria-hidden="true" />
                        Configuración
                        <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className={
                                open ? 'bo-chev bo-chev-open' : 'bo-chev'
                            }
                        />
                    </button>
                    {open && (
                        <div className="bo-config-box">
                            {configLinks.map((link) => (
                                <Link
                                    key={link.match}
                                    href={link.href}
                                    className={
                                        path.startsWith(link.match)
                                            ? 'bo-link bo-link-sub bo-link-on'
                                            : 'bo-link bo-link-sub'
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <ThemeToggle />
                        </div>
                    )}
                </div>

                <Link href={home()} data-tour="tour-volver" className="bo-link">
                    <ArrowLeft size={18} aria-hidden="true" />
                    Volver al portal
                </Link>
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="bo-link"
                >
                    <LogOut size={18} aria-hidden="true" />
                    Salir de sesión
                </Link>
            </div>
        </aside>
    );
}
