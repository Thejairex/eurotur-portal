import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

/**
 * Primer ingreso: la contraseña que llegó por mail es temporal y hay que cambiarla antes de usar el portal.
 */
export default function CambiarClave() {
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
                                className="mt-1 block w-full rounded-full border border-[#cfcfca] bg-white px-4 text-[15px] font-medium shadow-none focus-visible:ring-0"
                                autoFocus
                                placeholder="Al menos 10 caracteres"
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
                                className="mt-1 block w-full rounded-full border border-[#cfcfca] bg-white px-4 text-[15px] font-medium shadow-none focus-visible:ring-0"
                                placeholder="Repetí la contraseña nueva"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit mt-2 flex w-full items-center justify-center gap-2"
                            disabled={processing}
                            data-test="cambiar-clave-button"
                            style={{
                                background: '#E3000F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '999px',
                                fontSize: '13px',
                                fontWeight: 700,
                                padding: '14px 0',
                                cursor: processing ? 'default' : 'pointer',
                                opacity: processing ? 0.7 : 1,
                                transition: 'background .12s',
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
