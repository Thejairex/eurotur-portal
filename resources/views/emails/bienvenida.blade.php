<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bienvenido/a al nuevo Portal de Eurotur</title>
</head>
<body style="margin:0;padding:0;background:#e2e2df;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e2e2df;padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
                <tr>
                    <td align="center" style="background:#E3000F;padding:26px 24px;">
                        <img src="{{ $message->embed(public_path('img/eurotur-logo-email.png')) }}" width="130" alt="Eurotur" style="display:block;border:0;">
                    </td>
                </tr>
                <tr>
                    <td style="padding:30px 32px 8px 32px;">
                        <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b6b68;">Portal Eurotur</div>
                        <h1 style="margin:6px 0 0 0;font-size:30px;line-height:1.1;font-weight:800;letter-spacing:-0.5px;color:#111;">Bienvenido/a, {{ $nombre }}<span style="color:#E3000F;">.</span></h1>
                        <p style="margin:16px 0 0 0;font-size:15px;line-height:1.5;color:#333;">Ya tenés tu usuario en el nuevo portal interno de Eurotur. Entrá con estos datos (necesitás estar conectado/a a la VPN):</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:16px 32px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;border-radius:12px;">
                            <tr>
                                <td style="padding:16px 18px;font-size:14px;line-height:1.7;">
                                    <span style="color:#6b6b68;">Portal</span><br>
                                    <a href="{{ $portal }}" style="color:#E3000F;font-weight:700;text-decoration:none;">{{ $portal }}</a><br>
                                    <span style="color:#6b6b68;">Usuario</span><br>
                                    <strong>{{ $correo }}</strong><br>
                                    <span style="color:#6b6b68;">Contraseña temporal</span><br>
                                    <strong style="font-family:Consolas,'Courier New',monospace;font-size:16px;letter-spacing:0.04em;">{{ $clave }}</strong>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:4px 32px 8px 32px;font-size:14px;line-height:1.6;color:#333;">
                        <div style="font-weight:700;margin-bottom:6px;">Tres pasos para empezar</div>
                        <ol style="margin:0;padding-left:20px;">
                            <li style="margin-bottom:6px;"><strong>Entrá</strong> con tu usuario y la contraseña temporal.</li>
                            <li style="margin-bottom:6px;"><strong>Cambiá la contraseña:</strong> el portal te la pide en el primer ingreso. La temporal deja de servir.</li>
                            <li><strong>Editá tus páginas:</strong> entrá a tu página y tocá <strong>EDITAR ✎</strong> (arriba, al lado del título), o usá <strong>Back Office → Editar páginas</strong>.</li>
                        </ol>
                        @if (count($paginas) > 0)
                            <p style="margin:14px 0 0 0;">Podés editar: <strong>{{ implode(', ', $paginas) }}</strong>. Solo esas páginas.</p>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding:18px 32px 26px 32px;">
                        <a href="{{ $portal }}" style="display:inline-block;background:#E3000F;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:999px;">Entrar al portal</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 32px 26px 32px;font-size:12px;line-height:1.5;color:#6b6b68;border-top:1px solid #ececea;">
                        <p style="margin:14px 0 0 0;">Este mensaje salió automáticamente del portal. Si no esperabas este usuario o algo no funciona, escribile a Valentina Homez (valentina.homez@eurotur.tur.ar). Por seguridad, no reenvíes este correo.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
