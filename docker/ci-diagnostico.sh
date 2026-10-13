#!/bin/sh
# Corre TODOS los chequeos del portal sin cortarse en el primero que falle (lo mismo que
# `composer run ci:check`, pero completo) y muestra de cada uno solo lo necesario para arreglarlo.
# Es lo que ejecuta por defecto la imagen docker/Dockerfile.test.
#
# Si existe docker/mis-archivos.txt (una ruta por linea: los archivos que cambia una entrega), cada falla
# sale etiquetada "(MIO)" o "(ya estaba en main)" y el resumen cuenta solo las propias. Sirve para
# distinguir lo que introduce una entrega de la deuda que ya tenia el proyecto.

LISTA="docker/mis-archivos.txt"

etiqueta() {
    # $1 = ruta relativa
    if [ -f "$LISTA" ] && grep -qxF "$1" "$LISTA"; then
        echo "MIO"
    else
        echo "ya estaba en main"
    fi
}

cuerpo() {
    echo "=================== BUILD"
    if npm run build >/tmp/build.log 2>&1; then
        echo "[OK] build"
    else
        echo "[FALLO] build (MIO)"
        tail -40 /tmp/build.log
    fi

    echo
    echo "=================== LINT (eslint)"
    if npm run lint:check >/tmp/lint.log 2>&1; then
        echo "[OK] lint"
    else
        echo "[FALLO] lint"
        grep -E "^/app/|error|warning" /tmp/lint.log | head -30 | while IFS= read -r l; do
            ruta=$(echo "$l" | sed -n 's#^/app/\(.*\)$#\1#p')
            if [ -n "$ruta" ]; then echo "$l   ($(etiqueta "$ruta"))"; else echo "$l"; fi
        done
    fi

    echo
    echo "=================== FORMATO (prettier)"
    npx prettier --list-different resources/ >/tmp/fmt.txt 2>/dev/null
    if [ ! -s /tmp/fmt.txt ]; then
        echo "[OK] formato"
    else
        echo "[FALLO] formato: $(wc -l </tmp/fmt.txt) archivo(s)"
        while IFS= read -r f; do
            echo "  - $f   ($(etiqueta "$f"))"
        done </tmp/fmt.txt
        while IFS= read -r f; do
            if [ "$(etiqueta "$f")" = "MIO" ]; then
                echo "--- diferencias en $f (< actual / > prettier)"
                npx prettier "$f" | diff "$f" - | head -60
            fi
        done </tmp/fmt.txt
    fi

    echo
    echo "=================== TIPOS (tsc)"
    if npm run types:check >/tmp/tipos.log 2>&1; then
        echo "[OK] tipos"
    else
        echo "[FALLO] tipos"
        grep "error TS" /tmp/tipos.log | head -30 | while IFS= read -r l; do
            ruta=${l%%(*}
            echo "$l   ($(etiqueta "$ruta"))"
        done
    fi

    echo
    echo "=================== ESTILO PHP (pint)"
    if vendor/bin/pint --test >/tmp/pint.log 2>&1; then
        echo "[OK] pint"
    else
        echo "[FALLO] pint"
        vendor/bin/pint --test -v 2>&1 | grep -E "^\s+⨯" | head -30 | while IFS= read -r l; do
            ruta=$(echo "$l" | sed -E 's/^\s+⨯\s+([^ ]+).*/\1/')
            echo "$l   ($(etiqueta "$ruta"))"
        done
        vendor/bin/pint --test -v 2>&1 | head -120
    fi

    echo
    echo "=================== ANALISIS ESTATICO PHP (phpstan)"
    if vendor/bin/phpstan analyse --no-progress --memory-limit=1G >/tmp/stan.log 2>&1; then
        echo "[OK] phpstan"
    else
        echo "[FALLO] phpstan"
        vendor/bin/phpstan analyse --no-progress --memory-limit=1G --error-format=raw 2>/dev/null | head -40 | while IFS= read -r l; do
            ruta=$(echo "$l" | sed -E 's#^/app/##; s#:[0-9]+:.*$##')
            echo "$l   ($(etiqueta "$ruta"))"
        done
    fi

    echo
    echo "=================== PRUEBAS (phpunit)"
    php artisan config:clear >/dev/null 2>&1
    if php artisan test --compact >/tmp/tests.log 2>&1; then
        echo "[OK] pruebas"
        tail -6 /tmp/tests.log
    else
        echo "[FALLO] pruebas"
        grep -E "FAILED|Tests:" /tmp/tests.log | head -30
    fi
}

cuerpo | tee /tmp/informe.txt

fallos=$(grep -c '^\[FALLO\]' /tmp/informe.txt)
mios=$(grep -c '(MIO)' /tmp/informe.txt)

echo
echo "=================== RESUMEN"
if [ "$fallos" -eq 0 ]; then
    echo "TODO VERDE: build, lint, formato, tipos, pint, phpstan y pruebas."
    exit 0
fi
echo "Chequeos con fallas: $fallos"
if [ -f "$LISTA" ]; then
    echo "Problemas MIOS (de esta entrega): $mios"
    if [ "$mios" -eq 0 ]; then
        echo "=> Ninguna falla es de esta entrega: lo que falla ya estaba en main."
    fi
fi
[ "$fallos" -eq 0 ]
