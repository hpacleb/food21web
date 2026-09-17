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

# Runtime files created by the web server (www-data) are already group
# www-data and cannot be chgrp'd/chmod'd by the deploy user, so only fix
# the files the deploy user owns.
find storage bootstrap/cache database -user deploy -exec chgrp www-data {} +
find storage bootstrap/cache database -user deploy -exec chmod g+rwX {} +

echo "SERVER_DEPLOY_OK $(git rev-parse --short HEAD)"
