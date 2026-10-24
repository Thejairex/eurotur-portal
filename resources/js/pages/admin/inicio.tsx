import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Blocks,
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
import { useEffect, useRef, useState } from 'react';
import { initialsOf } from '@/components/backoffice/backoffice-header';
import { usePermissions } from '@/hooks/use-permissions';
import { editablePagesFor } from '@/lib/backoffice-pages';
import { SECTORS } from '@/lib/portal-sectors';
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

/** Alto de un renglón de "Mis páginas" si todavía no se pudo medir, y del botón de abajo. */
const ROW_HEIGHT = 56;
const FOOT_HEIGHT = 44;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Días enteros desde una fecha ISO hasta ahora, en palabras. */
const daysAgo = (iso: string): string => {
    const days = Math.max(
        0,
        Math.floor((Date.now() - Date.parse(iso)) / DAY_MS),
    );

    return days === 0 ? 'Hoy' : days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
};

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
    descargasTotal,
}: {
    paginas: Record<string, { bloques: number; links: number }>;
    novedades: Novedad[];
    descargas: Archivo[];
    descargasTotal: number;
}) {
    const { auth, sectorUpdates, novedadesSinLeer } = usePage().props;
    const { can } = usePermissions();

    const user = auth.user;
    const firstName = user.name.split(/\s+/)[0];
    const [allPages, setAllPages] = useState(false);
    const [fit, setFit] = useState(PREVIEW);
    const fillRef = useRef<HTMLDivElement>(null);
    // Primero las que tuvieron el cambio más reciente.
    const pages = [...editablePagesFor(can)].sort((a, b) =>
        (sectorUpdates[b.id]?.en ?? '').localeCompare(
            sectorUpdates[a.id]?.en ?? '',
        ),
    );
    const counted = pages.filter((page) => paginas[page.id]);
    const totalBloques = counted.reduce(
        (sum, page) => sum + paginas[page.id].bloques,
        0,
    );
    const totalLinks = counted.reduce(
        (sum, page) => sum + paginas[page.id].links,
        0,
    );
    const lastChange = pages
        .map((page) => sectorUpdates[page.id]?.en)
        .filter((en): en is string => en !== undefined)
        .sort()
        .at(-1);
    const bars = [...counted]
        .sort((a, b) => paginas[b.id].bloques - paginas[a.id].bloques)
        .slice(0, 6);
    const maxBloques = Math.max(
        1,
        ...bars.map((page) => paginas[page.id].bloques),
    );
    const tools = BACKOFFICE_TOOLS.filter((tool) => can(tool.permission));
    const isEditor = pages.length > 0;
    const editorStats = [
        {
            tone: 'red',
            icon: FileText,
            value: String(pages.length),
            label: 'Páginas a tu cargo',
            sub: 'del portal',
        },
        {
            tone: 'wine',
            icon: Blocks,
            value: String(totalBloques),
            label: 'Bloques',
            sub: `${totalLinks} links en total`,
        },
        {
            tone: 'amber',
            icon: Bell,
            value: String(novedadesSinLeer),
            label: 'Novedades sin leer',
            sub: novedadesSinLeer === 0 ? 'estás al día' : 'esperándote',
        },
        {
            tone: 'slate',
            icon: Clock,
            value: lastChange ? daysAgo(lastChange) : '—',
            label: 'Tu último cambio',
            sub: lastChange ? 'en alguna de tus páginas' : 'Sin cambios aún',
        },
    ];
    // Quien no edita páginas ve otros números: lo que sí usa.
    const readerStats = [
        {
            tone: 'amber',
            icon: Bell,
            value: String(novedadesSinLeer),
            label: 'Novedades sin leer',
            sub: novedadesSinLeer === 0 ? 'estás al día' : 'esperándote',
        },
        {
            tone: 'red',
            icon: Download,
            value: String(descargasTotal),
            label: 'Archivos para descargar',
            sub: 'plantillas e instructivos',
        },
        {
            tone: 'wine',
            icon: Wrench,
            value: String(tools.length),
            label: 'Herramientas habilitadas',
            sub: tools.length === 0 ? 'ninguna por ahora' : 'a tu disposición',
        },
        {
            tone: 'slate',
            icon: FileText,
            value: user.area || '—',
            label: 'Tu área',
            sub: user.puesto || 'sin puesto cargado',
        },
    ];
    const stats = isEditor ? editorStats : readerStats;
    // Filas de la tarjeta de la derecha: las páginas que se editan o, si no se edita ninguna, un acceso
    // directo a cada página del portal.
    const rows = isEditor
        ? pages.map((page) => {
              const date = formatUpdateDate(sectorUpdates[page.id]);
              const counts = paginas[page.id];

              return {
                  id: page.id,
                  label: page.navLabel,
                  href: page.href,
                  sub: `${counts ? `${counts.bloques} bloques · ${counts.links} links · ` : ''}${
                      date
                          ? `Última actualización: ${date}`
                          : 'Sin cambios registrados desde el portal'
                  }`,
              };
          })
        : SECTORS.filter(
              (sector) =>
                  !sector.requiredPermission || can(sector.requiredPermission),
          ).map((sector) => ({
              id: sector.id,
              label: sector.navLabel,
              href: sector.href,
              sub: sector.place,
          }));
    const shownPages = allPages ? rows : rows.slice(0, fit);
    const total = rows.length;

    // "Mis páginas" muestra tantos renglones como entren en el alto de la columna de al lado.
    useEffect(() => {
        const el = fillRef.current;

        if (allPages || el === null) {
            return;
        }

        const measure = () => {
            const row = el.querySelector<HTMLElement>('.bo-row');
            const rowHeight = row?.offsetHeight || ROW_HEIGHT;
            let count = Math.floor(el.clientHeight / rowHeight);

            if (count < total) {
                count = Math.floor((el.clientHeight - FOOT_HEIGHT) / rowHeight);
            }

            setFit(Math.min(total, Math.max(PREVIEW, count)));
        };

        const observer = new ResizeObserver(measure);

        observer.observe(el);

        return () => observer.disconnect();
    }, [allPages, total]);
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

            <div className="bo-stats">
                {stats.map((stat) => (
                    <div key={stat.label} className="bo-card bo-stat">
                        <span className={`bo-stat-ico bo-tone-${stat.tone}`}>
                            <stat.icon size={22} aria-hidden="true" />
                        </span>
                        <div>
                            <div className="bo-stat-val">{stat.value}</div>
                            <div className="bo-stat-label">{stat.label}</div>
                            <div className="bo-note">{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bo-grid2">
                <div className="bo-col">
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

                    {isEditor && bars.length > 0 && (
                        <div className="bo-card">
                            <h2>
                                <Blocks size={18} aria-hidden="true" />
                                Bloques por página
                            </h2>
                            {bars.map((page) => (
                                <div key={page.id} className="bo-bar-row">
                                    <span className="bo-bar-name">
                                        {page.navLabel}
                                    </span>
                                    <span className="bo-bar-track">
                                        <span
                                            className="bo-bar"
                                            style={{
                                                transform: `scaleX(${paginas[page.id].bloques / maxBloques})`,
                                            }}
                                        />
                                    </span>
                                    <b className="bo-bar-num">
                                        {paginas[page.id].bloques}
                                    </b>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bo-card bo-pages">
                    <h2>
                        <FileText size={18} aria-hidden="true" />
                        {isEditor ? 'Mis páginas' : 'Páginas del portal'}
                    </h2>
                    <div
                        className={allPages ? undefined : 'bo-fill'}
                        ref={fillRef}
                    >
                        <div className={allPages ? undefined : 'bo-fill-in'}>
                            {shownPages.map((row) => (
                                <Link
                                    key={row.id}
                                    href={row.href}
                                    className="bo-row"
                                >
                                    <span className="bo-row-ico">
                                        <FileText size={18} aria-hidden="true" />
                                    </span>
                                    <span>
                                        <b>{row.label}</b>
                                        <small className="bo-clip">
                                            {row.sub}
                                        </small>
                                    </span>
                                </Link>
                            ))}
                        </div>
                        {(allPages || total > shownPages.length) && (
                            <div
                                className={
                                    allPages
                                        ? 'bo-card-foot'
                                        : 'bo-card-foot bo-card-foot-abs'
                                }
                            >
                                <button
                                    type="button"
                                    className="bo-more"
                                    onClick={() => setAllPages(!allPages)}
                                >
                                    {allPages
                                        ? 'Ver menos'
                                        : `Ver las ${total - shownPages.length} restantes`}
                                </button>
                            </div>
                        )}
                    </div>
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
