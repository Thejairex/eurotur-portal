import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/backoffice/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { BACKOFFICE_TOOLS, TOOL_AREAS } from '@/lib/backoffice-tools';
import type { BackofficeTool } from '@/lib/backoffice-tools';

function ToolCard({ tool }: { tool: BackofficeTool }) {
    const className =
        'block border border-border p-5 transition-colors hover:border-primary';

    const content = (
        <>
            <div className="text-[15px] font-bold">{tool.label}</div>
            <p className="mt-2 text-sm text-muted-foreground">
                {tool.description}
            </p>
        </>
    );

    // Las herramientas que viven fuera del portal se abren en otra pestaña.
    if (tool.external) {
        return (
            <a
                href={tool.href.url}
                target="_blank"
                rel="noreferrer"
                className={className}
            >
                {content}
            </a>
        );
    }

    return (
        <Link href={tool.href} className={className}>
            {content}
        </Link>
    );
}

export default function CrmIndex() {
    const { can } = usePermissions();
    const tools = BACKOFFICE_TOOLS.filter((tool) => can(tool.permission));

    // Solo se muestran las áreas que tienen alguna herramienta habilitada para este usuario.
    const groups = TOOL_AREAS.map((area) => ({
        area,
        tools: tools.filter((tool) => tool.area === area.id),
    })).filter((group) => group.tools.length > 0);

    return (
        <>
            <Head title="Herramientas" />

            <PageHeader
                eyebrow="Administración"
                title="Herramientas"
                description="Las herramientas a las que tenés acceso, por área."
            />

            <div className="mt-6 flex flex-col gap-8">
                {groups.map((group) => (
                    <section key={group.area.id}>
                        <h2 className="mb-3 bo-eyebrow">{group.area.label}</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {group.tools.map((tool) => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}
