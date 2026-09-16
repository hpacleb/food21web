#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/food21
cd "$APP_DIR"

git fetch origin master
git reset --hard origin/master

composer install --no-dev --optimize-autoloader --no-interaction --no-progress

php artisan migrate --force
php artisan db:seed --class=MenuPriceSeeder --force

[ -L public/storage ] || php artisan storage:link

php artisan config:cache
php artisan route:cache
php artisan view:cache

chgrp -R www-data storage bootstrap/cache database
chmod -R g+rwX storage bootstrap/cache database

echo "SERVER_DEPLOY_OK $(git rev-parse --short HEAD)"
