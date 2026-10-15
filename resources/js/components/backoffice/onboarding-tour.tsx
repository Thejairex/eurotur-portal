import { router, usePage } from '@inertiajs/react';
import { useEffect, useReducer, useState } from 'react';
import type { CSSProperties } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { BACKOFFICE_TOOLS } from '@/lib/backoffice-tools';

type Step = {
    id: string;
    /** Selector `[data-tour="..."]` de lo que se resalta; sin él, la tarjeta va al centro. */
    target?: string;
    title: string;
    body: string;
};

type Box = { top: number; left: number; width: number; height: number };

const COMPLETE_URL = '/administracion/recorrido/completar';
const CARD_WIDTH = 340;
const GAP = 16;

/** Posición de lo que se resalta, o null si no está en pantalla (menú oculto en el celular, opción sin permiso). */
function findBox(selector: string): Box | null {
    const element = document.querySelector(selector);

    if (!element) {
        return null;
    }

    const rect = element.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
        return null;
    }

    return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
}

/**
 * Recorrido guiado de la primera vez en el Back Office: se muestra una sola vez por
 * usuario (hasta tocar "Entendido" en el último paso) y no se puede omitir ni cerrar.
 * Los pasos cuyo elemento no existe para este usuario (por ejemplo Configuración, que
 * solo ven los administradores) se saltan solos.
 */
export function OnboardingTour() {
    const { onboardingPending } = usePage().props;
    const { can } = usePermissions();
    const [ready, setReady] = useState(false);
    const [index, setIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);
    const [, redraw] = useReducer((count: number) => count + 1, 0);

    useEffect(() => {
        if (!onboardingPending) {
            return;
        }

        // Se mide después del primer pintado, cuando el menú y la barra ya existen.
        const frame = requestAnimationFrame(() => setReady(true));

        // No se puede cerrar con Escape: el recorrido se completa sí o sí.
        const blockEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.addEventListener('resize', redraw);
        window.addEventListener('keydown', blockEscape, true);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', redraw);
            window.removeEventListener('keydown', blockEscape, true);
        };
    }, [onboardingPending]);

    if (!onboardingPending || !ready) {
        return null;
    }

    const toolNames = BACKOFFICE_TOOLS.filter((tool) =>
        can(tool.permission),
    ).map((tool) => tool.navLabel);

    const allSteps: Step[] = [
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
            body: 'Acá se administran los usuarios y los roles del portal.',
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

    const steps = allSteps.filter(
        (step) => !step.target || findBox(step.target) !== null,
    );
    const position = Math.min(index, steps.length - 1);
    const step = steps[position];
    const isLast = position === steps.length - 1;
    const box = step.target ? findBox(step.target) : null;

    const finish = () => {
        setSaving(true);
        setFailed(false);
        router.post(
            COMPLETE_URL,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => setFailed(true),
                onFinish: () => setSaving(false),
            },
        );
    };

    let cardStyle: CSSProperties;

    if (box) {
        const roomOnTheRight =
            window.innerWidth - (box.left + box.width) - GAP * 2 >= CARD_WIDTH;
        const left = roomOnTheRight
            ? box.left + box.width + GAP
            : Math.max(
                  GAP,
                  Math.min(
                      box.left + box.width - CARD_WIDTH,
                      window.innerWidth - CARD_WIDTH - GAP,
                  ),
              );
        const top = roomOnTheRight ? box.top : box.top + box.height + GAP;

        cardStyle = {
            top: Math.max(GAP, Math.min(top, window.innerHeight - 280)),
            left,
        };
    } else {
        cardStyle = {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        };
    }

    const buttonBase: CSSProperties = {
        padding: '8px 16px',
        fontSize: '12.5px',
        fontWeight: 600,
        cursor: 'pointer',
        border: '1px solid var(--foreground)',
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
            {box ? (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        top: box.top - 6,
                        left: box.left - 6,
                        width: box.width + 12,
                        height: box.height + 12,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                        outline: '2px solid var(--primary)',
                        pointerEvents: 'none',
                    }}
                />
            ) : (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                    }}
                />
            )}

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="onboarding-title"
                style={{
                    position: 'fixed',
                    width: CARD_WIDTH,
                    maxWidth: 'calc(100vw - 32px)',
                    padding: '20px',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--foreground)',
                    ...cardStyle,
                }}
            >
                <div className="bo-eyebrow">
                    Paso {position + 1} de {steps.length}
                </div>
                <h2
                    id="onboarding-title"
                    style={{
                        margin: '8px 0',
                        fontSize: '18px',
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                    }}
                >
                    {step.title}
                </h2>
                <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.45 }}>
                    {step.body}
                </p>

                {failed && (
                    <p
                        role="alert"
                        style={{ margin: '12px 0 0', fontSize: '12.5px' }}
                    >
                        No se pudo guardar. Vuelve a intentarlo.
                    </p>
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        marginTop: '18px',
                    }}
                >
                    {position > 0 && (
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => setIndex(position - 1)}
                            style={{
                                ...buttonBase,
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                            }}
                        >
                            Atrás
                        </button>
                    )}
                    <button
                        type="button"
                        autoFocus
                        disabled={saving}
                        onClick={isLast ? finish : () => setIndex(position + 1)}
                        style={{
                            ...buttonBase,
                            background: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                        }}
                    >
                        {isLast ? 'Entendido, empezar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
