import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const RED = '#E3000F';
const FONT = "'Segoe UI', system-ui, -apple-system, Arial, sans-serif";

/**
 * Pantallas de acceso (ingresar, olvidé mi contraseña, elegir contraseña): el mismo lenguaje visual del
 * portal — fondo gris, tarjeta blanca redondeada, título grande con punto rojo, botones redondeados.
 */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <style>{`
                .eurotur-auth ::selection { background: ${RED}; color: #fff; }
                .eurotur-auth input:focus { outline: none; border-color: ${RED} !important; box-shadow: none !important; }
                .eurotur-auth .auth-submit:hover { background: #b3050f; }
                .eurotur-auth .auth-link:hover { color: ${RED}; }
                @media (max-width: 600px) {
                    #auth-card { padding: 28px 22px !important; }
                }
            `}</style>

            <div
                className="eurotur-auth"
                style={{
                    minHeight: '100vh',
                    background: '#E2E2DF',
                    color: '#111',
                    fontFamily: FONT,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 16px',
                }}
            >
                <div
                    id="auth-card"
                    style={{
                        width: '100%',
                        maxWidth: '460px',
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '40px 44px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    }}
                >
                    <Link
                        href={home()}
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            marginBottom: '28px',
                        }}
                    >
                        <img
                            src="/eurotur-logo.png"
                            alt="Eurotur — 70 años"
                            style={{ width: '88px', height: 'auto' }}
                        />
                        <span
                            style={{
                                fontSize: '10px',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: '#6B6B68',
                                lineHeight: 1.5,
                            }}
                        >
                            portal interno
                            <br />
                            dmc · desde 1954
                        </span>
                    </Link>

                    <h1
                        style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: '-0.5px',
                            margin: 0,
                        }}
                    >
                        {title}
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            fontSize: '14px',
                            lineHeight: 1.5,
                            color: '#6B6B68',
                            margin: '10px 0 28px',
                        }}
                    >
                        {description}
                    </p>

                    {children}
                </div>

                <div
                    style={{
                        marginTop: '18px',
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#8a8a86',
                    }}
                >
                    bue · fte · ush · sla
                </div>
            </div>
        </>
    );
}
