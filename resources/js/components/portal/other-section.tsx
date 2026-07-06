const RED = '#E30613';

export function PortalPlaceholder({
    title,
    num,
}: {
    title: string;
    num: string;
}) {
    return (
        <section>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '40px',
                    marginBottom: '38px',
                }}
            >
                <div style={{ maxWidth: '560px' }}>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(44px,6vw,80px)',
                            lineHeight: 0.86,
                            margin: 0,
                            textTransform: 'lowercase',
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {title}
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            maxWidth: '440px',
                            margin: '20px 0 0',
                            fontSize: '15px',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            color: '#111',
                        }}
                    >
                        Esta sección sigue la misma plantilla editorial que
                        RRHH: grilla de tarjetas-índice con línea negra
                        superior, número y lista de enlaces por grupo
                        documental.
                    </p>
                </div>
                <div
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 900,
                        fontSize: 'clamp(96px,13vw,176px)',
                        lineHeight: 0.72,
                    }}
                >
                    {num}
                </div>
            </div>
            <div
                style={{
                    borderTop: '3px solid #000',
                    paddingTop: '16px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    color: '#666',
                }}
            >
                plantilla lista — pendiente de maquetar contenido de esta
                sección.
            </div>
        </section>
    );
}
