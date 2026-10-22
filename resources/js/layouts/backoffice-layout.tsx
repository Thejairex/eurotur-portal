import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BackofficeHeader } from '@/components/backoffice/backoffice-header';
import { BackofficeSidebar } from '@/components/backoffice/backoffice-sidebar';
import { BackofficeWelcome } from '@/components/backoffice/backoffice-welcome';
import { OnboardingTour } from '@/components/backoffice/onboarding-tour';
import { usePermissions } from '@/hooks/use-permissions';
import { editablePagesFor } from '@/lib/backoffice-pages';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';

/** Marca "ya se mostró la bienvenida" mientras la persona sigue dentro del Back Office. */
const WELCOME_KEY = 'bo-welcome-shown';

const readWelcomeFlag = (): boolean => {
    try {
        return sessionStorage.getItem(WELCOME_KEY) === null;
    } catch {
        return true;
    }
};

/**
 * Estructura del Back Office (pages/admin/*): menú lateral rojo, franja superior y
 * contenido. Las pantallas de trabajo (usuarios, roles, herramientas…) van dentro de una
 * tarjeta blanca; Inicio arma sus propias tarjetas sobre el fondo gris.
 *
 * La bienvenida sale cada vez que se entra (al volver de otra parte del portal, o al
 * abrirlo de cero), no al recargar ni al moverse entre pantallas. El recorrido guiado de
 * la primera vez espera a que la bienvenida termine.
 */
export default function BackofficeLayout({ children }: { children: ReactNode }) {
    const { component, props } = usePage();
    const { can } = usePermissions();
    const [welcomeOpen, setWelcomeOpen] = useState(readWelcomeFlag);
    const closeWelcome = useCallback(() => setWelcomeOpen(false), []);

    useEffect(() => {
        try {
            sessionStorage.setItem(WELCOME_KEY, '1');
        } catch {
            // Sin almacenamiento: la bienvenida simplemente vuelve a salir.
        }

        // Al salir del Back Office (por ejemplo, volver al portal) se borra la marca:
        // la próxima vez que se entre, vuelve a darse la bienvenida.
        return () => {
            try {
                sessionStorage.removeItem(WELCOME_KEY);
            } catch {
                // Nada que limpiar.
            }
        };
    }, []);

    const name = props.auth?.user?.name ?? '';
    const firstName = name.split(/\s+/)[0] ?? '';
    const cards = [
        {
            label: 'Páginas que podés editar',
            value: editablePagesFor(can).length,
        },
        {
            label: 'Herramientas',
            value: BACKOFFICE_TOOLS.filter((tool) => can(tool.permission))
                .length,
        },
    ];
    const bare = component === 'admin/inicio';

    return (
        <div className="eurotur-backoffice bo-app">
            <BackofficeSidebar />

            <div className="bo-main">
                <BackofficeHeader />
                {bare ? children : <main className="bo-surface">{children}</main>}
            </div>

            {welcomeOpen ? (
                <BackofficeWelcome
                    name={firstName}
                    cards={cards}
                    onClose={closeWelcome}
                />
            ) : (
                <OnboardingTour />
            )}
        </div>
    );
}
