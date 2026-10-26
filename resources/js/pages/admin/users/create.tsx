import { Head } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { PageHeader } from '@/components/backoffice/page-header';
import UserForm from './user-form';
import type { PageOption, RoleOption } from './user-form';

export default function CreateUser({
    roles,
    pages,
}: {
    roles: RoleOption[];
    pages: PageOption[];
}) {
    return (
        <>
            <Head title="Nuevo usuario" />

            <PageHeader
                eyebrow="Administración — usuarios"
                title="Nuevo usuario"
                description="Creá la cuenta, asignale un rol y las páginas que puede editar. Le llega un correo de bienvenida."
            />

            <div className="mt-6">
                <UserForm
                    action={UserController.store.form()}
                    roles={roles}
                    pages={pages}
                    submitLabel="Crear usuario"
                />
            </div>
        </>
    );
}
