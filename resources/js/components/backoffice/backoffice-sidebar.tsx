import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { TOOLS_PERMISSIONS, usePermissions } from '@/hooks/use-permissions';
import { home } from '@/routes';
import { index as crmIndex } from '@/routes/admin/crm';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as usersIndex } from '@/routes/admin/users';

type NavEntry = {
    label: string;
    href: ReturnType<typeof usersIndex>;
    /** A single permission slug, or several — any one of them unlocks the entry. */
    permission: string | string[];
    match: string;
};

const TOOLS: NavEntry = {
    label: 'Herramientas',
    href: crmIndex(),
    permission: TOOLS_PERMISSIONS,
    match: '/administracion/crm',
};

/** Entradas que viven dentro del botón "Configuración". */
const CONFIG_ITEMS: NavEntry[] = [
    {
        label: 'Usuarios',
        href: usersIndex(),
        permission: 'users.manage',
        match: '/administracion/usuarios',
    },
    {
        label: 'Roles',
        href: rolesIndex(),
        permission: 'roles.manage',
        match: '/administracion/roles',
    },
];

const LINK_CLASS =
    'px-[6px] py-[7px] text-[12.5px] leading-[1.15] font-semibold tracking-[-0.01em] transition-[color,background-color,transform] duration-[120ms] hover:bg-primary hover:text-primary-foreground motion-safe:hover:translate-x-[3px] ';

/**
 * The backoffice's own nav, deliberately not shadcn's Sidebar: a fixed
 * 216px panel with a hairline border reads closer to the portal than the
 * collapsible/sheet machinery that component brings.
 */
export function BackofficeSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { url } = usePage();
    const { can, canAny } = usePermissions();

    const allowed = (item: NavEntry) =>
        Array.isArray(item.permission)
            ? canAny(...item.permission)
            : can(item.permission);

    const showTools = allowed(TOOLS);
    const configItems = CONFIG_ITEMS.filter(allowed);
    const configActive = configItems.some((item) => url.startsWith(item.match));

    // Abierto de entrada si la página actual es una de sus opciones.
    const [configOpen, setConfigOpen] = useState(configActive);
    const open = configOpen || configActive;

    return (
        <div className="flex h-full w-[216px] shrink-0 flex-col border-r border-border px-[22px] pt-[34px] pb-7">
            <Link
                href={home()}
                onClick={onNavigate}
                className="block"
                style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
            >
                <img
                    src="/eurotur-logo.png"
                    alt="Eurotur — 70 años"
                    style={{ width: '118px', height: 'auto', display: 'block' }}
                />
                <div className="mt-[10px] bo-eyebrow">Back Office</div>
            </Link>

            <div className="my-[24px] h-px bg-foreground" />

            <nav className="flex flex-1 flex-col gap-[2px]">
                {showTools && (
                    <Link
                        href={TOOLS.href}
                        onClick={onNavigate}
                        className={
                            LINK_CLASS +
                            (url.startsWith(TOOLS.match)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground')
                        }
                    >
                        {TOOLS.label}
                    </Link>
                )}
            </nav>

            {configItems.length > 0 && (
                <div className="mt-[16px] flex flex-col gap-[2px]">
                    <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setConfigOpen((value) => !value)}
                        className={
                            LINK_CLASS +
                            'flex cursor-pointer items-center gap-[8px] text-left text-foreground'
                        }
                    >
                        <span
                            aria-hidden="true"
                            className="size-[16px] shrink-0 bg-current"
                            style={{
                                WebkitMaskImage:
                                    "url('/img/icons/configuracion.png')",
                                maskImage: "url('/img/icons/configuracion.png')",
                                WebkitMaskSize: 'contain',
                                maskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                maskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                                maskPosition: 'center',
                            }}
                        />
                        <span className="flex-1">Configuración</span>
                        <ChevronDown
                            className={
                                'size-3.5 transition-transform duration-[120ms] ' +
                                (open ? 'rotate-180' : '')
                            }
                        />
                    </button>

                    {open && (
                        <div className="ml-[6px] flex flex-col gap-[2px] border-l border-border pl-[8px]">
                            {configItems.map((item) => (
                                <Link
                                    key={item.match}
                                    href={item.href}
                                    onClick={onNavigate}
                                    className={
                                        LINK_CLASS +
                                        (url.startsWith(item.match)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-foreground')
                                    }
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-[24px] h-px bg-foreground" />

            <Link
                href={home()}
                onClick={onNavigate}
                className="mt-[16px] bo-label transition-colors duration-[120ms] hover:text-primary"
            >
                ← Volver al portal
            </Link>
        </div>
    );
}
