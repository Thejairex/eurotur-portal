import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ImageSlot } from '@/components/portal/image-slot';

const RED = '#E3000F';

/** Íconos de línea (viewBox 24) que reemplazan a los emojis de las guías. */
const ICON_PATHS: Record<string, string> = {
    '📞': 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
    '🔒': 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
    '💤': 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
    '🔑': 'M14 10a4 4 0 11-8 0 4 4 0 018 0zM13 12l8 8M17 16l2-2M15 18l2-2',
    '🖥': 'M3 4h18v12H3zM8 20h8M12 16v4',
    '🔊': 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11',
    '📲': 'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2',
    '💡': 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z',
    '❓': 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-.9.6-1.5 1-1.5 2M12 17v.01',
    '✅': 'M12 21a9 9 0 100-18 9 9 0 000 18zM8 12l3 3 5-6',
    '⚠': 'M12 3l10 18H2zM12 10v5M12 18v.01',
    '📌': 'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    '📋': 'M9 4h6v3H9zM6 5h3M15 5h3v16H6V5M9 12h6M9 16h6',
    '📶': 'M4 20v-4M10 20v-8M16 20V8M22 20V4',
    '📷': 'M4 7h4l2-3h4l2 3h4v13H4zM12 17a4 4 0 100-8 4 4 0 000 8z',
};

/** Ícono de línea negro para un emoji conocido (si no se conoce, un círculo de información). */
export function EmojiIcon({
    emoji,
    size = 22,
}: {
    emoji: string;
    size?: number;
}) {
    const key = emoji.replace(/\uFE0F/g, '');
    const path =
        ICON_PATHS[key] ??
        'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5v.5';

    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            style={{
                flex: '0 0 auto',
                stroke: 'currentColor',
                fill: 'none',
                strokeWidth: 1.8,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            }}
        >
            <path d={path} />
        </svg>
    );
}

const STYLES = `
    .mesa-reveal { opacity: 0; transform: translateY(18px); transition: opacity .55s ease, transform .55s ease; }
    .mesa-reveal.mesa-in { opacity: 1; transform: none; }
    .mesa-ayuda-btn { transition: transform .15s, color .15s; }
    .mesa-ayuda-btn:hover { transform: translateY(-3px); color: ${RED}; }
    .mesa-paso-num { transition: transform .2s; }
    .mesa-paso:hover .mesa-paso-num { transform: scale(1.12); }
    .mesa-tarjeta { transition: transform .15s; }
    .mesa-tarjeta:hover { transform: translateY(-2px); }
    @keyframes mesa-pulso { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
    .mesa-pulso { animation: mesa-pulso 1.8s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
        .mesa-reveal { opacity: 1; transform: none; transition: none; }
        .mesa-ayuda-btn:hover, .mesa-tarjeta:hover { transform: none; }
        .mesa-pulso { animation: none; }
    }
`;

/** Estilos y animaciones de la página (aparecer al bajar, botones que se levantan, punto que late). */
export function MesaEstilos() {
    return <style>{STYLES}</style>;
}

/** La sección aparece suavemente cuando entra en pantalla. */
export function Revelar({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={visible ? 'mesa-reveal mesa-in' : 'mesa-reveal'}
        >
            {children}
        </div>
    );
}

const KEY_STYLE: CSSProperties = {
    display: 'inline-block',
    padding: '1px 9px',
    margin: '0 2px',
    border: '1px solid #CFCFCB',
    borderBottomWidth: '3px',
    borderRadius: '8px',
    background: '#fafafa',
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    fontWeight: 700,
    fontSize: '14px',
};

/** Nombre de las teclas que son un símbolo: solas se leen como puntos, así que llevan su nombre abajo. */
const SYMBOL_KEYS: Record<string, string> = {
    '*': 'asterisco',
    '#': 'numeral',
};

/**
 * Texto con marcas simples: **negrita** y [[Tecla]] (se dibuja como una tecla del teclado).
 * Así todo el contenido de las guías vive en textos planos, fáciles de cambiar.
 */
export function Rico({ texto }: { texto: string }) {
    return (
        <>
            {texto
                .split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/)
                .map((parte, index) => {
                    if (parte.startsWith('**')) {
                        return <b key={index}>{parte.slice(2, -2)}</b>;
                    }

                    if (parte.startsWith('[[')) {
                        const tecla = parte.slice(2, -2);
                        const nombre = SYMBOL_KEYS[tecla];

                        if (nombre) {
                            return (
                                <kbd
                                    key={index}
                                    style={{
                                        ...KEY_STYLE,
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px',
                                        padding: '4px 10px',
                                        verticalAlign: 'middle',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: 900,
                                            lineHeight: '20px',
                                        }}
                                    >
                                        {tecla}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                            fontSize: '9px',
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {nombre}
                                    </span>
                                </kbd>
                            );
                        }

                        return (
                            <kbd key={index} style={KEY_STYLE}>
                                {tecla}
                            </kbd>
                        );
                    }

                    return parte;
                })}
        </>
    );
}

/** Un paso numerado, con el número en un círculo rojo grande. */
export function Paso({ n, texto }: { n: number; texto: string }) {
    return (
        <div
            className="mesa-paso"
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '12px 0',
                borderBottom: '1px solid #ececec',
            }}
        >
            <span
                className="mesa-paso-num"
                style={{
                    flex: '0 0 auto',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: RED,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily:
                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                    fontWeight: 900,
                    fontSize: '16px',
                }}
            >
                {n}
            </span>
            <div
                style={{
                    fontSize: '16.5px',
                    lineHeight: 1.5,
                    paddingTop: '4px',
                }}
            >
                <Rico texto={texto} />
            </div>
        </div>
    );
}

/** Recuadro amarillo para lo importante. */
export function Aviso({ emoji, texto }: { emoji: string; texto: string }) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '12px',
                margin: '16px 0 0',
                padding: '14px 16px',
                background: '#FFF3CD',
                borderRadius: '12px',
                fontSize: '15.5px',
                lineHeight: 1.5,
            }}
        >
            <EmojiIcon emoji={emoji} />
            <span>
                <Rico texto={texto} />
            </span>
        </div>
    );
}

/** Subtítulo de una parte de la guía, con un emoji adelante. */
export function Subtitulo({ emoji, texto }: { emoji: string; texto: string }) {
    return (
        <h3
            style={{
                margin: '22px 0 6px',
                fontFamily:
                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '-0.01em',
            }}
        >
            <span
                style={{
                    marginRight: '8px',
                    display: 'inline-flex',
                    verticalAlign: 'middle',
                }}
            >
                <EmojiIcon emoji={emoji} size={20} />
            </span>
            {texto}
        </h3>
    );
}

export type ImagenGuia = { src: string; alt: string; pie: string };

/**
 * Una guía completa: barra negra con el emoji y el título, una frase que explica para qué sirve,
 * los pasos a un lado y la imagen al otro (sin dejar huecos vacíos).
 */
export function Guia({
    id,
    emoji,
    categoria,
    titulo,
    resumen,
    imagen,
    children,
}: {
    id: string;
    emoji: string;
    categoria: string;
    titulo: string;
    resumen: string;
    imagen?: ImagenGuia;
    children: ReactNode;
}) {
    return (
        <Revelar>
            <section
                id={id}
                style={{
                    scrollMarginTop: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,.05)',
                    marginBottom: '24px',
                    background: '#fff',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        borderBottom: '1px solid #CFCFCB',
                        color: '#111',
                        padding: '16px 24px',
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontWeight: 800,
                            fontSize: '20px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        <span
                            style={{
                                marginRight: '10px',
                                display: 'inline-flex',
                                verticalAlign: 'middle',
                            }}
                        >
                            <EmojiIcon emoji={emoji} />
                        </span>
                        {titulo}
                    </h2>
                    <span
                        style={{
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontSize: '11px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#6B6B68',
                            border: '1px solid #CFCFCB',
                            borderRadius: '999px',
                            padding: '3px 12px',
                        }}
                    >
                        {categoria}
                    </span>
                </div>

                <div style={{ padding: '22px 24px 26px' }}>
                    <p
                        style={{
                            margin: '0 0 20px',
                            fontSize: '17px',
                            lineHeight: 1.5,
                            color: '#222',
                        }}
                    >
                        {resumen}
                    </p>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: imagen
                                ? 'repeat(auto-fit, minmax(300px, 1fr))'
                                : '1fr',
                            gap: '28px',
                            alignItems: 'start',
                        }}
                    >
                        <div>{children}</div>
                        {imagen && (
                            <figure style={{ margin: 0 }}>
                                <div
                                    style={{
                                        border: '1px solid #CFCFCB',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <ImageSlot
                                        src={imagen.src}
                                        alt={imagen.alt}
                                        placeholder={imagen.alt}
                                        contain
                                    />
                                </div>
                                <figcaption
                                    style={{
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#555',
                                    }}
                                >
                                    {imagen.pie}
                                </figcaption>
                            </figure>
                        )}
                    </div>
                </div>
            </section>
        </Revelar>
    );
}

export type AtajoAyuda = { id: string; emoji: string; texto: string };

/** "¿Qué necesitás hacer?": botones grandes que llevan directo a cada guía. */
export function IndiceAyuda({ atajos }: { atajos: AtajoAyuda[] }) {
    const irA = (id: string) => {
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div style={{ margin: '0 0 34px' }}>
            <div
                style={{
                    margin: '0 0 12px',
                    fontFamily:
                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#6B6B68',
                }}
            >
                ¿Qué necesitás hacer?
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '12px',
                }}
            >
                {atajos.map((atajo) => (
                    <button
                        key={atajo.id}
                        type="button"
                        className="mesa-ayuda-btn"
                        onClick={() => irA(atajo.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '8px',
                            padding: '16px',
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 1px 2px rgba(0,0,0,.05)',
                            background: '#fff',
                            color: '#111',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontWeight: 700,
                            fontSize: '15.5px',
                            lineHeight: 1.25,
                        }}
                    >
                        <EmojiIcon emoji={atajo.emoji} size={30} />
                        {atajo.texto}
                    </button>
                ))}
            </div>
        </div>
    );
}
