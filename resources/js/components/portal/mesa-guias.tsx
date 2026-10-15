import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ImageSlot } from '@/components/portal/image-slot';

const RED = '#E30613';

const STYLES = `
    .mesa-reveal { opacity: 0; transform: translateY(18px); transition: opacity .55s ease, transform .55s ease; }
    .mesa-reveal.mesa-in { opacity: 1; transform: none; }
    .mesa-ayuda-btn { transition: transform .15s, background .15s, color .15s; }
    .mesa-ayuda-btn:hover { transform: translateY(-3px); background: #000; color: #fff; }
    .mesa-paso-num { transition: transform .2s; }
    .mesa-paso:hover .mesa-paso-num { transform: scale(1.12); }
    .mesa-tarjeta { transition: transform .15s, box-shadow .15s; }
    .mesa-tarjeta:hover { transform: translateY(-2px); box-shadow: 4px 4px 0 #000; }
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
    border: '1px solid #000',
    borderBottomWidth: '3px',
    borderRadius: '4px',
    background: '#fafafa',
    fontFamily: "'Space Mono', monospace",
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
            {texto.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/).map((parte, index) => {
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
                                        fontFamily: "'Archivo', sans-serif",
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
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 900,
                    fontSize: '16px',
                }}
            >
                {n}
            </span>
            <div
                style={{ fontSize: '16.5px', lineHeight: 1.5, paddingTop: '4px' }}
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
                background: '#fff6d6',
                borderLeft: '5px solid #f2b705',
                fontSize: '15.5px',
                lineHeight: 1.5,
            }}
        >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>{emoji}</span>
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
                fontFamily: "'Archivo', sans-serif",
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '-0.01em',
            }}
        >
            <span style={{ marginRight: '8px' }}>{emoji}</span>
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
                    border: '1px solid #000',
                    marginBottom: '34px',
                    background: '#fff',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: '#000',
                        color: '#fff',
                        padding: '14px 20px',
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '22px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        <span style={{ marginRight: '10px' }}>{emoji}</span>
                        {titulo}
                    </h2>
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9.5px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#ff6a72',
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
                                <div style={{ border: '1px solid #000' }}>
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
                                    📷 {imagen.pie}
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
                    fontFamily: "'Archivo', sans-serif",
                    fontWeight: 800,
                    fontSize: '19px',
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
                            border: '1px solid #000',
                            background: '#fff',
                            color: '#000',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 700,
                            fontSize: '15.5px',
                            lineHeight: 1.25,
                        }}
                    >
                        <span style={{ fontSize: '30px', lineHeight: 1 }}>
                            {atajo.emoji}
                        </span>
                        {atajo.texto}
                    </button>
                ))}
            </div>
        </div>
    );
}
