#!/bin/sh
# Corre TODOS los chequeos del portal sin cortarse en el primero que falle y muestra, de cada
# uno, solo lo necesario para arreglarlo (lo mismo que `composer run ci:check`, pero completo).
# Es lo que ejecuta por defecto la imagen docker/Dockerfile.test.

fallos=""

seccion() {
    echo
    echo "=================== $1"
}

# 1) Build de Vite (genera tambien los tipos de rutas que necesita tsc)
seccion "BUILD"
if npm run build >/tmp/build.log 2>&1; then
    echo "[OK] build"
else
    echo "[FALLO] build"
    tail -40 /tmp/build.log
    fallos="$fallos build"
fi

# 2) ESLint
seccion "LINT (eslint)"
if npm run lint:check >/tmp/lint.log 2>&1; then
    echo "[OK] lint"
else
    echo "[FALLO] lint"
    tail -40 /tmp/lint.log
    fallos="$fallos lint"
fi

# 3) Prettier: lista los archivos y muestra las diferencias exactas
seccion "FORMATO (prettier)"
if npm run format:check >/tmp/format.log 2>&1; then
    echo "[OK] formato"
else
    echo "[FALLO] formato"
    for f in $(npx prettier --list-different resources/ 2>/dev/null); do
        echo "--- diferencias en $f (- actual / + prettier)"
        npx prettier "$f" | diff "$f" - | head -40
    done
    fallos="$fallos formato"
fi

# 4) TypeScript
seccion "TIPOS (tsc)"
if npm run types:check >/tmp/tipos.log 2>&1; then
    echo "[OK] tipos"
else
    echo "[FALLO] tipos"
    tail -50 /tmp/tipos.log
    fallos="$fallos tipos"
fi

# 5) Pint (estilo de PHP)
seccion "ESTILO PHP (pint)"
if vendor/bin/pint --test >/tmp/pint.log 2>&1; then
    echo "[OK] pint"
else
    echo "[FALLO] pint"
    vendor/bin/pint --test -v 2>&1 | tail -80
    fallos="$fallos pint"
fi

# 6) PHPStan
seccion "ANALISIS ESTATICO PHP (phpstan)"
if vendor/bin/phpstan analyse --no-progress >/tmp/stan.log 2>&1; then
    echo "[OK] phpstan"
else
    echo "[FALLO] phpstan"
    tail -60 /tmp/stan.log
    fallos="$fallos phpstan"
fi

# 7) Pruebas de PHP
seccion "PRUEBAS (phpunit)"
php artisan config:clear >/dev/null 2>&1
if php artisan test --compact >/tmp/tests.log 2>&1; then
    echo "[OK] pruebas"
    tail -6 /tmp/tests.log
else
    echo "[FALLO] pruebas"
    tail -90 /tmp/tests.log
    fallos="$fallos pruebas"
fi

echo
echo "=================== RESUMEN"
if [ -z "$fallos" ]; then
    echo "TODO VERDE: build, lint, formato, tipos, pint, phpstan y pruebas."
    exit 0
fi
echo "FALLARON:$fallos"
exit 1
