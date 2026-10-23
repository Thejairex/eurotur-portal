import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calculator,
    CalendarClock,
    Clock,
    Download,
    FileSpreadsheet,
    FileText,
    Network,
    Pencil,
    Scale,
    Wallet,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { initialsOf } from '@/components/backoffice/backoffice-header';
import { usePermissions } from '@/hooks/use-permissions';
import { editablePagesFor } from '@/lib/backoffice-pages';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';
import { formatUpdateDate } from '@/lib/sector-updated';

type Novedad = {
    id: number;
    fecha: string;
    titulo: string;
    texto: string;
    nueva: boolean;
};

type Archivo = {
    id: number;
    nombre: string;
    extension: string;
    tamano: number;
};

/** Ícono de cada herramienta (las que no figuran usan la llave inglesa). */
const TOOL_ICONS: Record<string, LucideIcon> = {
    'cargador-facturas': FileSpreadsheet,
    prepagos: Wallet,
    balanz: Scale,
    prebalance: Calculator,
    organigrama: Network,
    'big-brother': CalendarClock,
};

/** Cuántas filas muestra cada tarjeta antes de "Ver más". */
const PREVIEW = 3;

const formatDay = (iso: string): string => {
    const [year, month, day] = iso.split('-');

    return `${day}·${month}·${year}`;
};

const formatSize = (bytes: number): string =>
    bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toLocaleString('es-AR', { maximumFractionDigits: 1 })} MB`;

/**
 * Inicio del Back Office: el perfil de la persona, las páginas del portal que mantiene, las
 * novedades, los archivos para descargar y sus herramientas. Todo con datos reales.
 */
export default function Inicio({
    paginas,
    novedades,
    descargas,
}: {
    paginas: Record<string, { bloques: number; links: number }>;
    novedades: Novedad[];
    descargas: Archivo[];
}) {
    const { auth, sectorUpdates, novedadesSinLeer } = usePage().props;
    const { can } = usePermissions();

    const user = auth.user;
    const firstName = user.name.split(/\s+/)[0];
    const [allPages, setAllPages] = useState(false);
    // Primero las que tuvieron el cambio más reciente.
    const pages = [...editablePagesFor(can)].sort((a, b) =>
        (sectorUpdates[b.id] ?? '').localeCompare(sectorUpdates[a.id] ?? ''),
    );
    const shownPages = allPages ? pages : pages.slice(0, PREVIEW);
    const tools = BACKOFFICE_TOOLS.filter((tool) => can(tool.permission));
    const photo = user.foto_path ? `/storage/${user.foto_path}` : null;
    const details = [
        ['Puesto', user.puesto],
        ['Área', user.area],
        ['Sede', user.sede],
        ['Interno', user.interno],
        ['Mail', user.email],
    ] as const;

    return (
        <>
            <Head title="Inicio" />

            <div className="bo-card bo-hdr">
                <div>
                    <div className="bo-ctx">Back Office</div>
                    <h1 className="bo-title">
                        Hola, {firstName}
                        <i>.</i>
                    </h1>
                </div>
            </div>

            <div className="bo-grid2">
                <div className="bo-card">
                    <div className="bo-prof">
                        <div
                            className="bo-avatar-lg"
                            style={
                                photo
                                    ? { backgroundImage: `url(${photo})` }
                                    : undefined
                            }
                        >
                            {photo ? '' : initialsOf(user.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <b style={{ fontSize: 22 }}>{user.name}</b>
                                <Link
                                    href="/administracion/perfil"
                                    className="bo-icon-btn"
                                    title="Editar mis datos"
                                    aria-label="Editar mis datos"
                                >
                                    <Pencil size={15} aria-hidden="true" />
                                </Link>
                            </div>
                            {details.map(([label, value]) => (
                                <div className="bo-field" key={label}>
                                    <label>{label}</label>
                                    <span>{value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bo-card">
                    <h2>
                        <FileText size={18} aria-hidden="true" />
                        Mis páginas
                    </h2>
                    {pages.length === 0 && (
                        <div className="bo-empty">
                            Todavía no tenés páginas del portal para editar.
                        </div>
                    )}
                    {shownPages.map((page) => {
                        const date = formatUpdateDate(sectorUpdates[page.id]);
                        const counts = paginas[page.id];

                        return (
                            <Link
                                key={page.id}
                                href={page.href}
                                className="bo-row"
                            >
                                <span className="bo-row-ico">
                                    <FileText size={18} aria-hidden="true" />
                                </span>
                                <span>
                                    <b>{page.navLabel}</b>
                                    <small className="bo-clip">
                                        {counts
                                            ? `${counts.bloques} bloques · ${counts.links} links · `
                                            : ''}
                                        {date
                                            ? `Última actualización: ${date}`
                                            : 'Sin cambios registrados desde el portal'}
                                    </small>
                                </span>
                            </Link>
                        );
                    })}
                    {pages.length > PREVIEW && (
                        <div className="bo-card-foot">
                            <button
                                type="button"
                                className="bo-more"
                                onClick={() => setAllPages(!allPages)}
                            >
                                {allPages
                                    ? 'Ver menos'
                                    : `Ver las ${pages.length - PREVIEW} restantes`}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bo-grid3">
                <div className="bo-card">
                    <h2>
                        <FileText size={18} aria-hidden="true" />
                        Novedades
                        {novedadesSinLeer > 0 && (
                            <span className="bo-tag">
                                {novedadesSinLeer} nuevas
                            </span>
                        )}
                    </h2>
                    {novedades.length === 0 && (
                        <div className="bo-empty">
                            Todavía no hay novedades.
                        </div>
                    )}
                    {novedades.slice(0, PREVIEW).map((novedad) => (
                        <Link
                            key={novedad.id}
                            href="/administracion/novedades"
                            className="bo-item"
                        >
                            <div className="bo-item-date">
                                {formatDay(novedad.fecha)}
                            </div>
                            <div>
                                <b>{novedad.titulo}</b>
                                <p className="bo-item-text">{novedad.texto}</p>
                            </div>
                        </Link>
                    ))}
                    <div className="bo-card-foot">
                        <Link
                            href="/administracion/novedades"
                            className="bo-more"
                        >
                            Ver más
                        </Link>
                    </div>
                </div>

                <div className="bo-card bo-card-hot">
                    <h2>
                        <Download size={18} aria-hidden="true" />
                        Descargas
                    </h2>
                    {descargas.length === 0 && (
                        <div className="bo-empty">
                            Todavía no hay archivos para descargar.
                        </div>
                    )}
                    {descargas.slice(0, PREVIEW).map((archivo) => (
                        <a
                            key={archivo.id}
                            href={`/administracion/descargas/${archivo.id}/archivo`}
                            className="bo-row"
                        >
                            <span className="bo-row-ico">
                                <Download size={18} aria-hidden="true" />
                            </span>
                            <span>
                                <b className="bo-clip">{archivo.nombre}</b>
                                <small className="bo-clip">
                                    {archivo.extension.toUpperCase()} ·{' '}
                                    {formatSize(archivo.tamano)}
                                </small>
                            </span>
                        </a>
                    ))}
                    <div className="bo-card-foot">
                        <Link
                            href="/administracion/descargas"
                            className="bo-more"
                        >
                            Ver más
                        </Link>
                    </div>
                </div>

                <div className="bo-card bo-card-hot">
                    <h2>
                        <Wrench size={18} aria-hidden="true" />
                        Herramientas
                    </h2>
                    {tools.length === 0 && (
                        <div className="bo-empty">
                            Todavía no tenés herramientas habilitadas.
                        </div>
                    )}
                    {tools.slice(0, PREVIEW).map((tool) => {
                        const Icon = TOOL_ICONS[tool.id] ?? Wrench;
                        const body = (
                            <>
                                <span className="bo-row-ico">
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                <span>
                                    <b className="bo-clip">{tool.label}</b>
                                    <small className="bo-clip">
                                        {tool.description}
                                    </small>
                                </span>
                            </>
                        );

                        return tool.external ? (
                            <a
                                key={tool.id}
                                href={tool.href.url}
                                target="_blank"
                                rel="noreferrer"
                                className="bo-row"
                            >
                                {body}
                            </a>
                        ) : (
                            <Link
                                key={tool.id}
                                href={tool.href}
                                className="bo-row"
                            >
                                {body}
                            </Link>
                        );
                    })}
                    <div className="bo-card-foot">
                        <Link href="/administracion/crm" className="bo-more">
                            Ver más
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bo-card" style={{ marginTop: 16 }}>
                <h2>
                    <Clock size={18} aria-hidden="true" />
                    Actividad reciente
                </h2>
                <div className="bo-empty">
                    Próximamente: quién cambió qué y cuándo. El historial de
                    cambios está en planeación.
                </div>
            </div>
        </>
    );
}
