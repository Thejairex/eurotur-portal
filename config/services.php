<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'bot_monitor' => [
        'url' => env('BOT_MONITOR_URL', 'http://euroturbot-monitor:8000'),
        'api_key' => env('BOT_MONITOR_API_KEY'),
    ],

    'receipt_ocr' => [
        'url' => env('RECEIPT_OCR_URL', 'http://ocr-comprobantes:8000'),
        'api_key' => env('RECEIPT_OCR_API_KEY'),
        'timeout' => 120,
    ],

    'invoice_loader' => [
        'url' => env('INVOICE_LOADER_URL', 'http://cargador-facturas:8000'),
        'api_key' => env('INVOICE_LOADER_API_KEY'),
        'timeout' => 120,
    ],

    'prepagos' => [
        'url' => env('PREPAGOS_URL', 'http://192.168.98.4:8498'),
    ],

    'balanz' => [
        'url' => env('BALANZ_URL', 'http://192.168.98.4:8499'),
    ],

    'big_brother' => [
        'url' => env('BIGBROTHER_URL', 'http://192.168.98.4:8497'),
    ],

    'organigrama' => [
        'url' => env('ORGANIGRAMA_URL', 'http://192.168.98.4:8003'),
    ],

    // Mesa de Información: sensores y teléfonos, leídos de dos hojas de Google con una cuenta de
    // servicio de solo lectura (GOOGLE_SERVICE_ACCOUNT_FILE = ruta al JSON dentro del contenedor).
    // MESA_DATOS_EJEMPLO=true muestra datos ficticios (preprod).
    'mesa' => [
        'datos_ejemplo' => (bool) env('MESA_DATOS_EJEMPLO', false),
        'credenciales' => env('GOOGLE_SERVICE_ACCOUNT_FILE'),
        'sensores_sheet_id' => env('MESA_SENSORES_SHEET_ID', '1R4cxK-mzpPb5ky5brcHvlwND1-o2QiD8TqNkJA-Isjw'),
        'telefonos_sheet_id' => env('MESA_TELEFONOS_SHEET_ID', '1WK6_rtiJfIVmYbW25lNPFZyXdNkMo9IKY6nzg-faoHo'),
        'sensores_rango' => env('MESA_SENSORES_RANGO', 'Actual!A1:D30'),
        'telefonos_rango' => env('MESA_TELEFONOS_RANGO', 'Telefonos!A1:B300'),
    ],

    'meeting_room' => [
        'calendar_url' => env('MEETING_ROOM_CALENDAR_URL'),
        'instructivo_url' => env('MEETING_ROOM_INSTRUCTIVO_URL'),
    ],

];
