import { router } from '@inertiajs/react';
import { useEffect, useReducer, useState } from 'react';
import type { CSSProperties } from 'react';

export type TourStep = {
    id: string;
    /** Selector CSS de lo que se resalta; sin él, la tarjeta va al centro. */
    target?: string;
    title: string;
    body: string;
    /** Enlace opcional que se abre en otra pestaña, sin sacar a la persona del recorrido. */
    link?: { label: string; href: string };
};

export type TourPalette = {
    background: string;
    foreground: string;
    accent: string;
    accentForeground: string;
};

type Box = { top: number; left: number; width: number; height: number };

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
 * Recorrido guiado de la primera vez: se muestra una sola vez por usuario (hasta tocar
 * el botón del último paso) y no se puede omitir ni cerrar. Los pasos cuyo elemento no
 * existe para este usuario se saltan solos. Al terminar avisa al servidor, que guarda la
 * fecha y deja de marcarlo como pendiente.
 */
export function GuidedTour({
    tour,
    pending,
    steps: allSteps,
    palette,
}: {
    /** Nombre del recorrido en el servidor: "portal" o "backoffice". */
    tour: string;
    pending: boolean;
    steps: TourStep[];
    palette: TourPalette;
}) {
    const [ready, setReady] = useState(false);
    const [index, setIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);
    const [, redraw] = useReducer((count: number) => count + 1, 0);

    useEffect(() => {
        if (!pending) {
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
    }, [pending]);

    const steps =
        pending && ready
            ? allSteps.filter(
                  (candidate) =>
                      !candidate.target || findBox(candidate.target) !== null,
              )
            : [];
    const position = Math.min(index, steps.length - 1);
    const step = steps.length > 0 ? steps[position] : null;
    const target = step?.target;

    // Si lo resaltado quedó fuera de la pantalla (menú largo, ventana baja), se lo trae a la vista.
    useEffect(() => {
        if (!target) {
            return;
        }

        document.querySelector(target)?.scrollIntoView({ block: 'center' });

        const frame = requestAnimationFrame(redraw);

        return () => cancelAnimationFrame(frame);
    }, [target]);

    if (!step) {
        return null;
    }

    const isLast = position === steps.length - 1;
    const box = target ? findBox(target) : null;

    const finish = () => {
        setSaving(true);
        setFailed(false);
        router.post(
            `/recorrido/${tour}/completar`,
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
            top: Math.max(GAP, Math.min(top, window.innerHeight - 300)),
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
        border: `1px solid ${palette.foreground}`,
        textDecoration: 'none',
        fontFamily: 'inherit',
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
                        outline: `2px solid ${palette.accent}`,
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
                aria-labelledby={`tour-title-${tour}`}
                style={{
                    position: 'fixed',
                    width: CARD_WIDTH,
                    maxWidth: 'calc(100vw - 32px)',
                    boxSizing: 'border-box',
                    padding: '20px',
                    background: palette.background,
                    color: palette.foreground,
                    border: `1px solid ${palette.foreground}`,
                    fontFamily:
                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                    ...cardStyle,
                }}
            >
                <div
                    style={{
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontSize: '10px',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                    }}
                >
                    Paso {position + 1} de {steps.length}
                </div>
                <h2
                    id={`tour-title-${tour}`}
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

                {step.link && (
                    <a
                        href={step.link.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            ...buttonBase,
                            display: 'inline-block',
                            marginTop: '12px',
                            background: palette.background,
                            color: palette.foreground,
                        }}
                    >
                        {step.link.label} ↗
                    </a>
                )}

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
                                background: palette.background,
                                color: palette.foreground,
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
                            background: palette.accent,
                            color: palette.accentForeground,
                        }}
                    >
                        {isLast ? 'Entendido, empezar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
