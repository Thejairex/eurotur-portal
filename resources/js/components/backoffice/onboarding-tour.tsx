import { usePage } from '@inertiajs/react';
import { GuidedTour } from '@/components/guided-tour';
import type { TourPalette, TourStep } from '@/components/guided-tour';
import { usePermissions } from '@/hooks/use-permissions';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';

const PALETTE: TourPalette = {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    accent: 'var(--primary)',
    accentForeground: 'var(--primary-foreground)',
};

/**
 * Recorrido de la primera vez en el Back Office (una sola vez por usuario, sin omitir).
 * Los pasos que apuntan a algo que esta persona no ve (Configuración, solo para quienes
 * administran usuarios o roles) se saltan solos.
 */
export function OnboardingTour() {
    const { tours } = usePage().props;
    const { can } = usePermissions();

    const toolNames = BACKOFFICE_TOOLS.filter((tool) =>
        can(tool.permission),
    ).map((tool) => tool.navLabel);

    const steps: TourStep[] = [
        {
            id: 'bienvenida',
            title: 'Bienvenida/o al nuevo Back Office',
            body: 'Te mostramos en un minuto lo que cambió. Este recorrido aparece solo esta vez.',
        },
        {
            id: 'areas',
            target: '[data-tour="tour-areas"]',
            title: 'Tus herramientas, por área',
            body: 'El menú agrupa las herramientas por área: Cuentas a Pagar, Contabilidad y RRHH. Ves solo las que tu rol permite.',
        },
        {
            id: 'herramientas',
            target: '[data-tour="tour-herramientas"]',
            title: 'Pantalla de Herramientas',
            body: 'Desde acá ves todas tus herramientas como tarjetas y entras a la que necesites.',
        },
        {
            id: 'dentro',
            title: 'Todo en la misma pestaña',
            body:
                toolNames.length > 0
                    ? `Tus herramientas (${toolNames.join(', ')}) se abren dentro del Back Office, con el menú al costado, sin salir del portal. El Panel de Prepagos sigue abriéndose en otra pestaña.`
                    : 'Las herramientas de tu área se abren dentro del Back Office, con el menú al costado, sin salir del portal.',
        },
        {
            id: 'tema',
            target: '[data-tour="tour-tema"]',
            title: 'Modo claro u oscuro',
            body: 'Elige el aspecto que prefieras. Se recuerda en este navegador.',
        },
        {
            id: 'config',
            target: '[data-tour="tour-config"]',
            title: 'Configuración',
            body: 'Desde acá se administran los usuarios y los roles del portal: altas, bajas, contraseñas y permisos de cada herramienta. Solo lo ven las personas con ese permiso.',
        },
        {
            id: 'volver',
            target: '[data-tour="tour-volver"]',
            title: 'Volver al portal',
            body: 'Con este botón regresas al portal en cualquier momento.',
        },
        {
            id: 'fin',
            title: '¡Listo!',
            body: 'Ya conoces lo nuevo. Si algo no funciona o te confunde, cuéntale a Valentina.',
        },
    ];

    return (
        <GuidedTour
            tour="backoffice"
            pending={tours.backoffice}
            steps={steps}
            palette={PALETTE}
        />
    );
}
