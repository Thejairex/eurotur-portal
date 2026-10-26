import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { boFieldClass } from '@/components/backoffice/field';
import { SectionHeading } from '@/components/backoffice/section-heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/admin/users';
import type { RouteFormDefinition } from '@/wayfinder';

export type RoleOption = {
    id: number;
    name: string;
    slug: string;
    ver_bandeja: boolean;
};

type UserFormData = {
    name: string;
    email: string;
    role_id: string;
    password: string;
    password_confirmation: string;
    prepagos_analista_codigo: string;
    paginas: string;
    paginas_form: string;
    enviar_bienvenida: string;
};

export type PageOption = { slug: string; label: string };

export type EditableUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    prepagos_analista_codigo: number | null;
    paginas: string[];
    welcome_sent_at: string | null;
    must_change_password: boolean;
};

/**
 * Shared by the create and edit pages: `action` carries the Wayfinder form
 * props, `user` prefills the fields when editing.
 */
export default function UserForm({
    action,
    roles,
    pages,
    user,
    submitLabel,
}: {
    action: RouteFormDefinition<'post'>;
    roles: RoleOption[];
    pages: PageOption[];
    user?: EditableUser;
    submitLabel: string;
}) {
    const [roleId, setRoleId] = useState(
        String(user?.role_id ?? roles[0]?.id ?? ''),
    );
    const selectedRole = roles.find((role) => String(role.id) === roleId);

    return (
        <Form<UserFormData> {...action} className="max-w-4xl">
            {({ processing, errors }) => (
                <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px_260px]">
                    <div className="space-y-6">
                        <div className="grid gap-1">
                            <Label htmlFor="name" className="bo-label">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user?.name}
                                required
                                autoComplete="name"
                                className={boFieldClass}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="email" className="bo-label">
                                Correo electrónico
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user?.email}
                                required
                                autoComplete="email"
                                className={boFieldClass}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="password" className="bo-label">
                                Contraseña
                                <span className="ml-1 text-muted-foreground normal-case">
                                    {user
                                        ? '(dejar vacío para no cambiarla)'
                                        : '(opcional: vacía, se genera una temporal y se manda por mail)'}
                                </span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                className={boFieldClass}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1">
                            <Label
                                htmlFor="password_confirmation"
                                className="bo-label"
                            >
                                Repetir contraseña
                            </Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                className={boFieldClass}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        {!user && (
                            <label className="flex items-start gap-2 text-sm">
                                <input type="hidden" name="enviar_bienvenida" value="0" />
                                <input
                                    type="checkbox"
                                    name="enviar_bienvenida"
                                    value="1"
                                    defaultChecked
                                    className="mt-1"
                                />
                                <span>
                                    Mandarle el correo de bienvenida con el usuario
                                    y la contraseña. Al entrar por primera vez tiene
                                    que cambiarla.
                                </span>
                            </label>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <Button type="submit" disabled={processing}>
                                {submitLabel}
                            </Button>

                            <Button variant="ghost" asChild>
                                <Link href={index()}>Cancelar</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="border border-border p-5">
                        <SectionHeading label="Panel de Prepagos" />

                        <p className="mb-3 bo-label text-muted-foreground normal-case">
                            Solo importa si el rol elegido tiene habilitada la
                            vista "Mi Bandeja".
                        </p>

                        {selectedRole?.ver_bandeja && (
                            <div className="grid w-20 gap-1">
                                <Label
                                    htmlFor="prepagos_analista_codigo"
                                    className="bo-label"
                                >
                                    Código
                                </Label>
                                <Input
                                    id="prepagos_analista_codigo"
                                    name="prepagos_analista_codigo"
                                    type="number"
                                    min={1}
                                    max={9}
                                    defaultValue={
                                        user?.prepagos_analista_codigo ?? ''
                                    }
                                    className={boFieldClass}
                                />
                            </div>
                        )}
                        <InputError message={errors.prepagos_analista_codigo} />
                    </div>

                    <div className="border border-border p-5">
                        <SectionHeading label="Rol" />

                        <input type="hidden" name="role_id" value={roleId} />
                        <Select value={roleId} onValueChange={setRoleId}>
                            <SelectTrigger
                                id="role_id"
                                className="rounded-none"
                            >
                                <SelectValue placeholder="Elegí un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={String(role.id)}
                                    >
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} />

                        {selectedRole && (
                            <p className="mt-3 bo-label text-muted-foreground normal-case">
                                Slug: {selectedRole.slug}
                            </p>
                        )}
                    </div>

                    <div className="border border-border p-5 md:col-span-2">
                        <SectionHeading label="Páginas que puede editar" />

                        <p className="mb-3 bo-label text-muted-foreground normal-case">
                            Solo estas páginas del portal, además de lo que ya
                            le da su rol. Si el correo figura en la lista de
                            responsables, se suman solas al crear el usuario.
                        </p>

                        <input type="hidden" name="paginas_form" value="1" />
                        <div className="grid gap-2 sm:grid-cols-2">
                            {pages.map((page) => (
                                <label
                                    key={page.slug}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        name="paginas[]"
                                        value={page.slug}
                                        defaultChecked={user?.paginas.includes(
                                            page.slug,
                                        )}
                                    />
                                    {page.label}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.paginas} />
                    </div>
                </div>
            )}
        </Form>
    );
}
