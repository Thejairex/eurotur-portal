# syntax=docker/dockerfile:1

## ---------- Etapa 1: dependencias de Composer ----------
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-progress \
    --optimize-autoloader \
    --ignore-platform-reqs

## ---------- Etapa 2: build de assets (Vite/React) ----------
# Basada en PHP porque el plugin de Wayfinder ejecuta `artisan wayfinder:generate`
# durante el build de Vite.
FROM php:8.3-cli-alpine AS frontend

RUN apk add --no-cache nodejs npm sqlite-libs

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY --from=vendor /app/vendor ./vendor

RUN cp .env.example .env \
    && touch database/database.sqlite \
    && php artisan key:generate --force \
    && npm run build

## ---------- Etapa 3: imagen final (PHP-FPM + Nginx) ----------
FROM php:8.3-fpm-alpine AS app

ARG APP_ENV=production

RUN apk add --no-cache \
        nginx \
        supervisor \
        sqlite \
        sqlite-libs \
        icu \
        libzip \
    && apk add --no-cache --virtual .build-deps \
        sqlite-dev \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-install \
        pdo_sqlite \
        intl \
        zip \
        opcache \
        bcmath \
    && apk del .build-deps

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN cp .env.example .env \
    && mkdir -p database storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && touch database/database.sqlite \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache database

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
