import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, Wrench } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { editablePagesFor } from '@/lib/backoffice-pages';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';
import { formatUpdateDate } from '@/lib/sector-updated';

/**
 * Inicio del Back Office. Hoy muestra lo que ya existe de verdad: las páginas del portal que
 * esta persona puede editar (con la fecha real de su última modificación) y sus herramientas.
 * Perfil, novedades y descargas se suman en la próxima etapa.
 */
export default function Inicio() {
    const { auth, sectorUpdates } = usePage().props;
    const { can } = usePermissions();

    const firstName = (auth?.user?.name ?? '').split(/\s+/)[0];
    const pages = editablePagesFor(can);
    const tools = BACKOFFICE_TOOLS.filter((tool) => can(tool.permission));

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
                    <h2>
                        <FileText size={18} aria-hidden="true" />
                        Mis páginas
                    </h2>
                    {pages.length === 0 && (
                        <div className="bo-empty">
                            Todavía no tenés páginas del portal para editar.
                        </div>
                    )}
                    {pages.map((page) => {
                        const date = formatUpdateDate(sectorUpdates[page.id]);

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
                                    <small>
                                        {date
                                            ? `Última actualización: ${date}`
                                            : 'Sin cambios registrados desde el portal'}
                                    </small>
                                </span>
                            </Link>
                        );
                    })}
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
                    {tools.map((tool) => {
                        const body = (
                            <>
                                <span className="bo-row-ico">
                                    <Wrench size={18} aria-hidden="true" />
                                </span>
                                <span>
                                    <b>{tool.label}</b>
                                    <small>{tool.description}</small>
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
                </div>
            </div>
        </>
    );
}
