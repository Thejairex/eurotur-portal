<?php

namespace App\Mail;

use App\Models\User;
use App\Services\PageOwners;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Correo de bienvenida al crear un usuario: enlace al portal, usuario y contraseña temporal, y los tres
 * pasos para empezar. Se manda en el momento (no por la cola) justamente para que la contraseña no quede
 * guardada en la tabla de trabajos pendientes.
 */
class WelcomeMail extends Mailable
{
    public function __construct(
        public readonly User $user,
        public readonly string $temporaryPassword,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Bienvenido/a al nuevo Portal de Eurotur');
    }

    public function content(): Content
    {
        $labels = PageOwners::grantable();
        $paginas = array_values(array_filter(array_map(
            fn (string $slug): ?string => isset($labels[$slug]) ? preg_replace('/^Editar sector /', '', $labels[$slug]) : null,
            $this->user->extraPermissionSlugs(),
        )));

        return new Content(
            view: 'emails.bienvenida',
            with: [
                'nombre' => explode(' ', trim($this->user->name))[0],
                'correo' => $this->user->email,
                'clave' => $this->temporaryPassword,
                'portal' => rtrim((string) config('app.url'), '/'),
                'paginas' => $paginas,
            ],
        );
    }
}
