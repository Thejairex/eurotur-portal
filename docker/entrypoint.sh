#!/bin/sh
set -e

cd /var/www/html

if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=.\+" .env; then
    php artisan key:generate --force
fi

php artisan storage:link || true
php artisan migrate --force

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
