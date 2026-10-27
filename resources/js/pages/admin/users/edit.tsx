import { Head, router } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { PageHeader } from '@/components/backoffice/page-header';
import { Button } from '@/components/ui/button';
import UserForm from './user-form';
import type { EditableUser, PageOption, RoleOption } from './user-form';

export default function EditUser({
    user,
    roles,
    pages,
}: {
    user: EditableUser;
    roles: RoleOption[];
    pages: PageOption[];
}) {
    const sentAt = user.welcome_sent_at
        ? new Date(user.welcome_sent_at).toLocaleDateString('es-AR')
        : null;

    const resend = () => {
        if (
            window.confirm(
                'Se genera una contraseña temporal nueva (la anterior deja de servir) y se vuelve a mandar la bienvenida. ¿Seguimos?',
            )
        ) {
            router.post(`/administracion/usuarios/${user.id}/bienvenida`);
        }
    };

    return (
        <>
            <Head title={`Editar ${user.name}`} />

            <PageHeader
                eyebrow="Administración — usuarios"
                title="Editar usuario"
                description="Actualizá los datos de la cuenta, su rol y las páginas que puede editar."
            />

            <div className="mt-6">
                <UserForm
                    action={UserController.update.form(user.id)}
                    roles={roles}
                    pages={pages}
                    user={user}
                    submitLabel="Guardar cambios"
                />
            </div>

            <div className="mt-8 max-w-4xl border border-border p-5">
                <p className="text-sm">
                    {sentAt
                        ? `Última bienvenida enviada el ${sentAt}.`
                        : 'Todavía no se le mandó el correo de bienvenida.'}{' '}
                    {user.must_change_password &&
                        'Todavía no cambió la contraseña temporal.'}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={resend}
                >
                    Reenviar bienvenida (con contraseña nueva)
                </Button>
            </div>
        </>
    );
}
