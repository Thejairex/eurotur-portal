import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, Pencil } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { editablePagesFor } from '@/lib/backoffice-pages';
import { formatUpdateDate } from '@/lib/sector-updated';

/**
 * Editar páginas: las páginas del portal que esta persona mantiene. Cada una lleva a la página real
 * con la edición ya abierta (agregar, renombrar, mover y borrar bloques y links).
 */
export default function Paginas({
    paginas,
}: {
    paginas: Record<string, { bloques: number; links: number }>;
}) {
    const { sectorUpdates } = usePage().props;
    const { can } = usePermissions();
    const pages = editablePagesFor(can);

    return (
        <>
            <Head title="Editar páginas" />

            <div className="bo-ctx">Back Office</div>
            <h1 className="bo-title">
                Editar páginas<i>.</i>
            </h1>

            <div className="bo-card" style={{ marginTop: 20 }}>
                <p className="bo-note" style={{ margin: '0 0 8px' }}>
                    Elegí una página y se abre con la edición activa. Los
                    cambios se ven en el portal apenas se guardan.
                </p>
                {pages.length === 0 && (
                    <div className="bo-empty">
                        Todavía no tenés páginas del portal para editar.
                    </div>
                )}
                {pages.map((page) => {
                    const date = formatUpdateDate(sectorUpdates[page.id]);
                    const counts = paginas[page.id];

                    return (
                        <Link
                            key={page.id}
                            href={`${page.href.url}?editar=1`}
                            className="bo-row"
                        >
                            <span className="bo-row-ico">
                                <FileText size={18} aria-hidden="true" />
                            </span>
                            <span style={{ flex: 1 }}>
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
                            <span className="bo-more">
                                <Pencil size={14} aria-hidden="true" />
                                Editar
                            </span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
