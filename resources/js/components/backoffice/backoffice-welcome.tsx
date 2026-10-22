import { useEffect, useRef, useState } from 'react';

export type WelcomeCard = { label: string; value: number };

const AUTO_CLOSE_MS = 9000;
const FADE_MS = 400;

/**
 * Bienvenida a pantalla completa, cada vez que se entra al Back Office. Se salta con un
 * clic en cualquier lado, con Esc o sola a los 9 segundos. Solo anima opacidad y
 * transform; con "reducir animaciones" todo aparece sin movimiento (ver app.css).
 */
export function BackofficeWelcome({
    name,
    cards,
    onClose,
}: {
    name: string;
    cards: WelcomeCard[];
    onClose: () => void;
}) {
    const [leaving, setLeaving] = useState(false);
    const closing = useRef(false);

    useEffect(() => {
        const close = () => {
            if (closing.current) {
                return;
            }

            closing.current = true;
            setLeaving(true);
            window.setTimeout(onClose, FADE_MS);
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };
        const timer = window.setTimeout(close, AUTO_CLOSE_MS);

        window.addEventListener('keydown', onKey);
        window.addEventListener('click', close);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('click', close);
        };
    }, [onClose]);

    return (
        <div
            className={leaving ? 'bo-welcome bo-welcome-out' : 'bo-welcome'}
            role="dialog"
            aria-modal="true"
            aria-label="Bienvenida al Back Office"
        >
            <div className="bo-welcome-logo">
                <img src="/img/eurotur-logo-blanco.webp" alt="Eurotur" />
            </div>
            <div className="bo-welcome-tag">BACK OFFICE · PORTAL EUROTUR</div>
            <h1>
                Hola, {name}
                <i>.</i>
            </h1>
            <div className="bo-welcome-bar" />
            <div className="bo-welcome-cards">
                {cards.map((card, index) => (
                    <div
                        key={card.label}
                        className="bo-welcome-card"
                        style={{ animationDelay: `${1.2 + index * 0.15}s` }}
                    >
                        <small>{card.label}</small>
                        <b>{card.value}</b>
                    </div>
                ))}
            </div>
            <button type="button" autoFocus className="bo-welcome-btn">
                Entrar al Back Office
            </button>
            <div className="bo-welcome-skip">
                Click en cualquier lado o Esc para saltar
            </div>
        </div>
    );
}
