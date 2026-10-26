import { Form, Head } from '@inertiajs/react';
import { Check, Circle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const PILL =
    'rounded-full border border-[#cfcfca] bg-white px-4 text-[15px] font-medium shadow-none focus-visible:ring-0';

/** Mismas reglas que `App\Services\PasswordPolicy`: si se cambia una, hay que cambiar la otra. */
const MIN_LENGTH = 10;

function requirements(password: string, confirmation: string) {
    return [
        {
            label: `Al menos ${MIN_LENGTH} caracteres`,
            ok: password.length >= MIN_LENGTH,
        },
        {
            label: 'Una mayúscula y una minúscula',
            ok: /\p{Lu}/u.test(password) && /\p{Ll}/u.test(password),
        },
        { label: 'Un número', ok: /\d/.test(password) },
        {
            label: 'Un símbolo (por ejemplo ! # $ % & * + - = ?)',
            ok: /[^\p{L}\d]/u.test(password),
        },
        {
            label: 'Las dos contraseñas coinciden',
            ok: password !== '' && password === confirmation,
        },
    ];
}

/**
 * Primer ingreso: la contraseña que llegó por mail es temporal y hay que cambiarla antes de usar el portal.
 * La lista de requisitos se va tildando mientras se escribe.
 */
export default function CambiarClave() {
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const checks = requirements(password, confirmation);
    const allOk = checks.every((check) => check.ok);

    return (
        <>
            <Head title="Cambiar contraseña" />

            <Form
                method="put"
                action="/cambiar-clave"
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña nueva</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className={`mt-1 block w-full ${PILL}`}
                                autoFocus
                                placeholder="Elegí una contraseña"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Repetir contraseña
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className={`mt-1 block w-full ${PILL}`}
                                placeholder="Repetí la contraseña nueva"
                                value={confirmation}
                                onChange={(event) =>
                                    setConfirmation(event.target.value)
                                }
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <ul
                            className="grid gap-1.5 rounded-2xl bg-[#f4f4f2] px-4 py-3 text-sm"
                            aria-label="Requisitos de la contraseña"
                        >
                            {checks.map((check) => (
                                <li
                                    key={check.label}
                                    className={
                                        check.ok
                                            ? 'flex items-center gap-2 font-medium text-green-700'
                                            : 'flex items-center gap-2 text-[#6B6B68]'
                                    }
                                >
                                    {check.ok ? (
                                        <Check
                                            className="size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Circle
                                            className="size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {check.label}
                                </li>
                            ))}
                            <li className="pt-1 text-xs text-[#6B6B68]">
                                Además, tiene que ser distinta de la contraseña
                                temporal que te llegó por mail.
                            </li>
                        </ul>

                        <button
                            type="submit"
                            className="auth-submit mt-2 flex w-full items-center justify-center gap-2"
                            disabled={processing || !allOk}
                            data-test="cambiar-clave-button"
                            style={{
                                background: '#E3000F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '999px',
                                fontSize: '13px',
                                fontWeight: 700,
                                padding: '14px 0',
                                cursor:
                                    processing || !allOk
                                        ? 'default'
                                        : 'pointer',
                                opacity: processing || !allOk ? 0.5 : 1,
                                transition: 'background .12s, opacity .12s',
                            }}
                        >
                            {processing && <Spinner />}
                            Cambiar contraseña y entrar
                        </button>
                    </div>
                )}
            </Form>
        </>
    );
}

CambiarClave.layout = {
    title: 'Elegí tu contraseña',
    description:
        'La contraseña que te llegó por mail es temporal. Elegí una nueva para empezar a usar el portal.',
};
