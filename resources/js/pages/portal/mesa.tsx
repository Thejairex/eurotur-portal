import { Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { MaintLine } from '@/components/portal/maint-line';
import { MesaEnVivo } from '@/components/portal/mesa-en-vivo';
import {
    Aviso,
    Guia,
    IndiceAyuda,
    MesaEstilos,
    Paso,
    Revelar,
    Rico,
    Subtitulo,
} from '@/components/portal/mesa-guias';
import type { AtajoAyuda } from '@/components/portal/mesa-guias';
import { copyText } from '@/lib/copy-text';

const RED = '#E3000F';

type Credential = { id: string; label: string; sub: string; pass: string };

const CREDENTIALS: Credential[] = [
    {
        id: 'euro',
        label: 'Wi-Fi · EuroTucuman',
        sub: 'Red: EuroTucuman · EuroTucuman 5Ghz',
        pass: '825.Tucum@n',
    },
    {
        id: 'meet',
        label: 'Sala de Reuniones · Meet Tucuman',
        sub: 'Acceso de red',
        pass: 'Eurt825*',
    },
];

const ATAJOS: AtajoAyuda[] = [
    { id: 'llamadas', emoji: '📞', texto: 'Hacer o pasar una llamada' },
    { id: 'vpn', emoji: '🔒', texto: 'Mi VPN no conecta' },
    { id: 'apagado', emoji: '💤', texto: 'La pantalla se apaga sola' },
    { id: 'contrasena', emoji: '🔑', texto: 'Cambiar mi contraseña' },
    {
        id: 'pantallas',
        emoji: '🖥️',
        texto: 'Usar un monitor con la notebook',
    },
    {
        id: 'sonido',
        emoji: '🔊',
        texto: 'No se escucha en la Sala de Reuniones',
    },
];

const PREFIJOS = [
    {
        codigo: '9',
        titulo: 'Nacionales y celulares',
        detalle: 'Si llamás a un celular, agregá 15 antes del número.',
    },
    {
        codigo: '803',
        titulo: 'Internacionales',
        detalle: 'Para llamar a otro país.',
    },
    {
        codigo: '804',
        titulo: 'Internacionales',
        detalle: 'Otra línea para llamar a otro país.',
    },
];

const PASOS_TRANSFERIR = [
    'Con la persona en línea, tocá [[*]] [[*]] (dos veces la tecla asterisco).',
    'Escribí el **número de interno** al que querés pasar la llamada (el número corto de cada persona, por ejemplo 101).',
    'Tocá la tecla [[#]] (el numeral, también llamado "gato"). Listo: la llamada se transfiere.',
];

const PASOS_VPN = [
    'No sigas intentando conectarte: cada intento fallido te acerca al bloqueo.',
    'Avisale al **equipo de Sistemas** y pedile que desbloquee tu VPN.',
];

const PASOS_APAGADO = [
    'Hacé clic en el botón **Inicio** (la ventanita de Windows), escribí **Configuración** y abrila.',
    'Entrá en **Sistema**.',
    'Elegí **Energía y batería**.',
    'Buscá **Tiempo de espera de hibernación, suspensión y pantalla**. Vas a ver dos opciones: **Desactivar pantalla después de** (cuándo se apaga la pantalla) y **Hacer que mi dispositivo entre en suspensión después de** (cuándo se duerme la notebook).',
    'Elegí el tiempo que prefieras: por ejemplo 5, 10 o 45 minutos, o **Nunca**.',
];

const PASOS_CONTRASENA = [
    'Presioná a la vez [[Ctrl]] + [[Alt]] + [[Supr]]. Aparece un menú de opciones.',
    'Elegí **Cambiar una contraseña**.',
    'Escribí tu **contraseña actual**.',
    'Escribí la **contraseña nueva** y repetila para confirmarla.',
];

const PASOS_PANTALLAS = [
    'En la notebook, hacé **clic derecho** sobre el escritorio.',
    'Elegí **Configuración de pantalla**.',
    'Buscá **Varias pantallas** y elegí cómo querés verlas:',
];

const OPCIONES_PANTALLAS = [
    '**Duplicar estas pantallas**: se ve lo mismo en la notebook y en el monitor.',
    '↔️ **Extender estas pantallas**: trabajás con las dos pantallas a la vez (lo recomendado).',
    '1️⃣ **Mostrar únicamente en 1**: solo se ve en la notebook.',
    '2️⃣ **Mostrar únicamente en 2**: solo se ve en el monitor externo.',
];

const PASOS_SONIDO = [
    'Verificá que estén conectados el **cable de audio** y el **cable HDMI** (el cable de video).',
    'Hacé clic en el ícono del parlante (abajo a la derecha, junto al reloj).',
    'En la lista, elegí **Auriculares (Realtek(R) Audio)**.',
];

const LINEA: CSSProperties = {
    margin: '8px 0',
    fontSize: '16.5px',
    lineHeight: 1.5,
};

const BOTON_CLARO: CSSProperties = {
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: '1px solid var(--p-line)',
    borderRadius: '999px',
    background: 'transparent',
    padding: '9px 14px',
    cursor: 'pointer',
};

function Linea({ texto }: { texto: string }) {
    return (
        <p style={LINEA}>
            <Rico texto={texto} />
        </p>
    );
}

export default function Mesa() {
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState<string | null>(null);
    const [copyFailed, setCopyFailed] = useState(false);
    const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    function toggleReveal(id: string) {
        setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    async function copyValue(id: string, value: string) {
        const ok = await copyText(value);

        setCopyFailed(!ok);
        setCopied(id);
        clearTimeout(copyTimeout.current);
        copyTimeout.current = setTimeout(() => setCopied(null), 2500);
    }

    return (
        <>
            <Head title="Mesa de Información" />
            <MesaEstilos />

            <section
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ marginBottom: '28px' }}>
                    <div
                        style={{
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontSize: '10px',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'var(--p-mut)',
                            marginBottom: '10px',
                        }}
                    >
                        centro de ayuda · tecnología
                    </div>
                    <h1
                        style={{
                            fontFamily:
                                "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                            fontWeight: 800,
                            fontSize: 'clamp(32px,3.2vw,44px)',
                            lineHeight: 0.95,
                            margin: 0,
                            letterSpacing: '-1px',
                        }}
                    >
                        Mesa de información
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            maxWidth: '640px',
                            margin: '14px 0 0',
                            fontSize: '17px',
                            lineHeight: 1.5,
                            color: 'var(--p-ink)',
                        }}
                    >
                        Elegí lo que necesitás y seguí los pasos, uno por uno.
                        Si algo no se resuelve, avisá al equipo de Sistemas.
                    </p>
                </div>

                <IndiceAyuda atajos={ATAJOS} />

                <Revelar>
                    <div
                        style={{
                            background: 'var(--p-card)',
                            borderRadius: '16px',
                            boxShadow: '0 1px 2px rgba(0,0,0,.05)',
                            overflow: 'hidden',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid var(--p-line)',
                                color: 'var(--p-ink)',
                                padding: '14px 18px',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 800,
                                    fontSize: '16px',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                Accesos de red · Tucumán
                            </span>
                            <span
                                style={{
                                    fontFamily:
                                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                    fontSize: '9px',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: '#E3000F',
                                }}
                            >
                                ● acceso interno
                            </span>
                        </div>
                        {CREDENTIALS.map((c) => {
                            const shown = !!revealed[c.id];

                            return (
                                <div
                                    key={c.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '20px',
                                        padding: '16px 18px',
                                        borderTop: '1px solid var(--p-line)',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                fontSize: '16px',
                                            }}
                                        >
                                            {c.label}
                                        </div>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                                fontSize: '11px',
                                                color: 'var(--p-mut)',
                                                marginTop: '3px',
                                            }}
                                        >
                                            {c.sub}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            flex: '0 0 auto',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily:
                                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                                fontSize: '16px',
                                                fontWeight: 700,
                                                letterSpacing: '0.08em',
                                                minWidth: '130px',
                                                textAlign: 'right',
                                            }}
                                        >
                                            {shown ? c.pass : '••••••••'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleReveal(c.id)}
                                            className="mesa-cred-btn"
                                            style={BOTON_CLARO}
                                        >
                                            {shown ? 'Ocultar' : 'Mostrar'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyValue(c.id, c.pass)
                                            }
                                            className="mesa-copy-btn"
                                            style={BOTON_CLARO}
                                        >
                                            {copied === c.id && !copyFailed
                                                ? '¡Copiado!'
                                                : 'Copiar'}
                                        </button>
                                    </div>
                                    {copied === c.id && copyFailed && (
                                        <div
                                            style={{
                                                width: '100%',
                                                fontSize: '13px',
                                                color: RED,
                                            }}
                                        >
                                            No se pudo copiar solo. Tocá
                                            «Mostrar» y copiala a mano.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div
                            style={{
                                fontFamily:
                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                fontSize: '10px',
                                letterSpacing: '0.05em',
                                color: 'var(--p-mut)',
                                padding: '11px 18px',
                                borderTop: '1px solid var(--p-line)',
                                background: 'var(--p-soft)',
                                lineHeight: 1.5,
                            }}
                        >
                            Las claves quedan ocultas por defecto. Tocá
                            «Mostrar» solo cuando las necesites y evitá
                            compartir capturas con la clave a la vista.
                        </div>
                    </div>
                </Revelar>

                <Revelar>
                    <MesaEnVivo />
                </Revelar>

                <Guia
                    id="llamadas"
                    emoji="📞"
                    categoria="telefonía"
                    titulo="Hacer o pasar una llamada"
                    resumen="Para llamar hacia afuera, marcá primero el prefijo que corresponde y después el número al que querés llamar."
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(190px, 1fr))',
                            gap: '14px',
                        }}
                    >
                        {PREFIJOS.map((prefijo, index) => (
                            <div
                                key={index}
                                className="mesa-tarjeta"
                                style={{
                                    borderRadius: '12px',
                                    padding: '16px',
                                    background: 'var(--p-soft)',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                        fontWeight: 900,
                                        fontSize: '34px',
                                        lineHeight: 1,
                                    }}
                                >
                                    {prefijo.codigo}
                                </div>
                                <div
                                    style={{
                                        margin: '8px 0 4px',
                                        fontWeight: 800,
                                        fontSize: '16.5px',
                                    }}
                                >
                                    {prefijo.titulo}
                                </div>
                                <div
                                    style={{
                                        fontSize: '14.5px',
                                        lineHeight: 1.45,
                                        color: 'var(--p-ink)',
                                    }}
                                >
                                    {prefijo.detalle}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Subtitulo
                        emoji="📲"
                        texto="Pasar la llamada a otro interno"
                    />
                    {PASOS_TRANSFERIR.map((texto, index) => (
                        <Paso key={index} n={index + 1} texto={texto} />
                    ))}
                    <Aviso
                        emoji="💡"
                        texto="**Resumen:** [[*]] [[*]] + número de interno + [[#]]. Para el interno 101 sería [[*]] [[*]] [[1]] [[0]] [[1]] [[#]]."
                    />

                    <a
                        href="https://docs.google.com/spreadsheets/d/1h7AeaE-jK7ddSE0KTYSyYm6RC2IErJLl4OQ-2DeygcM/edit"
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                        style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            color: 'var(--p-ink)',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '15px',
                            borderBottom: '1px solid var(--p-line)',
                            paddingBottom: '3px',
                        }}
                    >
                        Ver la tabla de discado completa{' '}
                        <span style={{ color: RED }}>↗</span>
                    </a>
                </Guia>

                <Guia
                    id="vpn"
                    emoji="🔒"
                    categoria="red · vpn"
                    titulo="Mi VPN no conecta (bloqueo de VPN)"
                    resumen="La VPN es la conexión segura para trabajar con la red de Eurotur desde afuera de la oficina. Si se queda trabada al conectarse, probablemente quedó bloqueada. Esto es lo que tenés que hacer."
                    imagen={{
                        src: '/img/mesa-vpn.webp',
                        alt: 'Pantalla de la VPN trabada',
                        pie: 'Así se ve la pantalla cuando la VPN está bloqueada: queda trabada en 10 % o en 45 %.',
                    }}
                >
                    <Subtitulo emoji="❓" texto="¿Qué te pasa?" />
                    <Linea texto="⏳ La conexión **no avanza**: se queda trabada en un punto." />
                    <Linea texto="**Llega al 45 %** y no progresa más (como en la imagen)." />

                    <Subtitulo emoji="🔒" texto="¿Qué significa?" />
                    <Linea texto="Tu VPN está **bloqueada**. Es muy sensible: después de **3 intentos fallidos seguidos** se bloquea sola." />

                    <Subtitulo emoji="✅" texto="¿Qué tenés que hacer?" />
                    {PASOS_VPN.map((texto, index) => (
                        <Paso key={index} n={index + 1} texto={texto} />
                    ))}

                    <Link
                        href="/it"
                        style={{
                            display: 'inline-block',
                            marginTop: '18px',
                            padding: '12px 18px',
                            borderRadius: '999px',
                            background: '#111',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '15px',
                        }}
                    >
                        Ir a la página de Sistemas (IT) →
                    </Link>
                </Guia>

                <Guia
                    id="apagado"
                    emoji="💤"
                    categoria="windows"
                    titulo="La pantalla se apaga o la notebook se duerme"
                    resumen="Si la pantalla se apaga o la notebook se duerme muy rápido, podés elegir cuánto tiempo esperar."
                    imagen={{
                        src: '/img/mesa-apagado.webp',
                        alt: 'Opciones de energía de Windows',
                        pie: 'Acá se elige después de cuánto tiempo se apaga la pantalla.',
                    }}
                >
                    {PASOS_APAGADO.map((texto, index) => (
                        <Paso key={index} n={index + 1} texto={texto} />
                    ))}
                </Guia>

                <Guia
                    id="contrasena"
                    emoji="🔑"
                    categoria="seguridad"
                    titulo="Cambiar mi contraseña"
                    resumen="Se hace desde la notebook y vale para todos tus accesos: TS, VPN, Spark y los demás."
                    imagen={{
                        src: '/img/mesa-contrasena.png',
                        alt: 'Menú de Ctrl Alt Supr',
                        pie: 'Este menú aparece al presionar Ctrl + Alt + Supr.',
                    }}
                >
                    {PASOS_CONTRASENA.map((texto, index) => (
                        <Paso key={index} n={index + 1} texto={texto} />
                    ))}
                    <Aviso
                        emoji="⚠️"
                        texto="La contraseña tiene que ser **segura**: con letras, números y símbolos."
                    />
                    <Aviso
                        emoji="💡"
                        texto="Una vez cambiada, la nueva contraseña se aplica en **todos tus accesos**: TS (escritorio remoto), VPN (conexión segura), Spark, etc."
                    />
                </Guia>

                <Guia
                    id="pantallas"
                    emoji="🖥️"
                    categoria="hardware"
                    titulo="Usar un monitor con la notebook"
                    resumen="Cuando conectás un monitor externo, podés elegir cómo mostrar la imagen."
                    imagen={{
                        src: '/img/mesa-pantallas.webp',
                        alt: 'Notebook con monitor externo',
                        pie: 'Notebook con un monitor externo conectado.',
                    }}
                >
                    {PASOS_PANTALLAS.map((texto, index) => (
                        <Paso key={index} n={index + 1} texto={texto} />
                    ))}
                    {OPCIONES_PANTALLAS.map((texto, index) => (
                        <Linea key={index} texto={texto} />
                    ))}
                    <Aviso
                        emoji="⚠️"
                        texto="Desde el **TS** (Terminal Server, el escritorio remoto) no se puede extender, solo duplicar."
                    />
                    <Aviso
                        emoji="📌"
                        texto="Si querés usar **solo el monitor externo** con la notebook cerrada: abrí **Configuración → Sistema → Energía y batería** y, en **Al cerrar la tapa**, elegí **No hacer nada**."
                    />
                </Guia>

                <Guia
                    id="sonido"
                    emoji="🔊"
                    categoria="sala de reuniones"
                    titulo="No se escucha en la Sala de Reuniones"
                    resumen="En la Sala de Reuniones el sonido sale por el equipo conectado. Revisá estos pasos."
                    imagen={{
                        src: '/img/mesa-sonido.png',
                        alt: 'Lista de salidas de audio',
                        pie: 'La opción correcta es «Auriculares (Realtek(R) Audio)».',
                    }}
                >
                    {PASOS_SONIDO.map((texto, index) => (
                        <Paso key={index} n={index + 1} texto={texto} />
                    ))}
                </Guia>

                <MaintLine>
                    IT · Mesa de Información · actualizado 10·2026
                </MaintLine>
            </section>
        </>
    );
}

Mesa.layout = { active: 'mesa', label: 'Mesa de Info—' };
