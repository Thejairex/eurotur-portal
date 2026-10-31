<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        @if (config('app.preprod'))
            {{-- Distintivo del entorno de PRE-PRODUCCION (APP_PREPROD=true). Inerte en produccion. --}}
            <div style="position:fixed;top:0;left:0;right:0;height:4px;background:#f59e0b;z-index:2147483647;pointer-events:none"></div>
            <div style="position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#111;font:700 12px/1 ui-monospace,monospace;letter-spacing:.08em;padding:8px 14px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.35);z-index:2147483647;pointer-events:none">PREPRODUCCIÓN · ENTORNO DE PRUEBAS</div>
            <script>
                (function () {
                    var t = document.querySelector('title');
                    function mark() { if (document.title.indexOf('[PREPRO]') !== 0) { document.title = '[PREPRO] ' + document.title; } }
                    mark();
                    new MutationObserver(mark).observe(t || document.head, { childList: true, subtree: true, characterData: true });
                })();
            </script>
        @endif
        <x-inertia::app />
    </body>
</html>
