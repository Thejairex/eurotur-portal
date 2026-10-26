import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
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
                                className="mt-1 block w-full"
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
                                className="mt-1 block w-full"
                                placeholder="Repetí la contraseña nueva"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={processing}
                            data-test="cambiar-clave-button"
                        >
                            {processing && <Spinner />}
                            Cambiar contraseña y entrar
                        </Button>
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
