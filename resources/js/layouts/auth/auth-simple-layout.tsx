import { Head, Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const RED = '#E30613';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
                />
            </Head>

            <style>{`
                .eurotur-auth ::selection { background: ${RED}; color: #fff; }
                .eurotur-auth input:focus { outline: none; border-color: ${RED} !important; }
                .eurotur-auth .auth-submit:hover { background: #b3050f; }
                .eurotur-auth .auth-link:hover { color: ${RED}; }

                @media (max-width: 860px) {
                    #auth-root { flex-direction: column; }
                    #auth-brand { width: 100% !important; flex: none !important; height: auto !important; padding: 28px 24px !important; }
                    #auth-brand-label { display: none !important; }
                    #auth-panel { padding: 32px 24px !important; }
                }
            `}</style>

            <div
                id="auth-root"
                className="eurotur-auth"
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                    background: '#fff',
                    color: '#000',
                    fontFamily: "'Archivo', sans-serif",
                }}
            >
                <div
                    id="auth-brand"
                    style={{
                        width: '360px',
                        flex: '0 0 360px',
                        borderRight: '1px solid #000',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '40px 36px',
                        position: 'relative',
                    }}
                >
                    <Link
                        href={home()}
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            display: 'block',
                        }}
                    >
                        <img
                            src="/eurotur-logo.png"
                            alt="Eurotur — 70 años"
                            style={{
                                width: '132px',
                                height: 'auto',
                                display: 'block',
                            }}
                        />
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '9px',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: '#666',
                                marginTop: '10px',
                            }}
                        >
                            portal interno
                            <br />
                            dmc · desde 1954
                        </div>
                    </Link>

                    <div
                        id="auth-brand-label"
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontSize: '64px',
                            lineHeight: 0.95,
                            color: RED,
                            letterSpacing: '0.01em',
                        }}
                    >
                        ACCESO
                    </div>

                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '9px',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#999',
                        }}
                    >
                        bue · fte · ush · sla
                    </div>
                </div>

                <div
                    id="auth-panel"
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 56px',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '380px' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h1
                                style={{
                                    fontFamily: "'Anton', sans-serif",
                                    fontSize: '28px',
                                    letterSpacing: '0.01em',
                                    margin: 0,
                                }}
                            >
                                {title}
                            </h1>
                            <p
                                style={{
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '11px',
                                    letterSpacing: '0.02em',
                                    color: '#666',
                                    marginTop: '10px',
                                }}
                            >
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
