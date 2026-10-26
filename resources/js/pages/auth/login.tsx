import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

const RED = '#E3000F';

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#666',
    marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
    fontSize: '15px',
    fontWeight: 500,
    color: '#000',
    background: '#fff',
    border: '1px solid #cfcfca',
    borderRadius: '999px',
    padding: '12px 18px',
};

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Ingresar" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div>
                                <label htmlFor="email" style={labelStyle}>
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nombre@eurotur.tur.ar"
                                    style={inputStyle}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <div className="flex items-baseline justify-between">
                                    <label
                                        htmlFor="password"
                                        style={labelStyle}
                                    >
                                        Contraseña
                                    </label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="auth-link mb-2 text-xs"
                                            style={{
                                                fontFamily:
                                                    "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                                color: '#666',
                                                textDecoration: 'none',
                                            }}
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="rounded-full border border-[#cfcfca] bg-white px-4 text-[15px] font-medium shadow-none focus-visible:ring-0"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        accentColor: RED,
                                    }}
                                />
                                <span
                                    style={{
                                        fontFamily:
                                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                        fontSize: '13px',
                                        fontWeight: 500,
                                    }}
                                >
                                    Recordarme
                                </span>
                            </label>

                            <button
                                type="submit"
                                className="auth-submit"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                style={{
                                    marginTop: '8px',
                                    width: '100%',
                                    background: RED,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '999px',
                                    fontFamily:
                                        "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    padding: '14px 0',
                                    cursor: processing ? 'default' : 'pointer',
                                    opacity: processing ? 0.7 : 1,
                                    transition: 'background .12s',
                                }}
                            >
                                {processing ? 'Ingresando…' : 'Ingresar'}
                            </button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div
                    style={{
                        marginTop: '20px',
                        fontFamily:
                            "'Segoe UI', system-ui, -apple-system, Arial, sans-serif",
                        fontSize: '12px',
                        textAlign: 'center',
                        color: '#16a34a',
                    }}
                >
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Ingresar',
    description: 'Ingresá tu correo y tu contraseña para acceder al portal.',
};
