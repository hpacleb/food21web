# Food21 Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy Food21 to the existing DigitalOcean Droplet at `168.144.128.161`, serve it securely at `https://food21services.com`, and automate later releases from successful pushes to `master`.

**Architecture:** GitHub Actions validates and builds immutable Laravel releases, then uploads them to a native Ubuntu stack running Caddy, PHP 8.3 FPM, and SQLite. A root-owned deployment script activates timestamped releases atomically while persistent environment, storage, and database files remain under `/var/www/food21web/shared`.

**Tech Stack:** Laravel 13, Fortify, Pest 5, React 19, Vite Plus, PHP 8.3, Node 22, GitHub Actions, Ubuntu 24.04, Caddy, PHP-FPM, SQLite, Bash, systemd, UFW

**Spec:** `docs/superpowers/specs/2026-09-16-production-deployment-design.md`

## Global Constraints

- Production runs on Ubuntu 24.04 at `168.144.128.161` with one vCPU, 458 MiB usable RAM, 8.7 GB disk, and a 1 GiB swap file.
- Production PHP and build-job PHP are version 8.3; GitHub Actions uses Node 22.
- The Droplet must not install Node, npm, Composer, Docker, Redis, or a database server.
- Caddy serves `food21services.com`; `www.food21services.com` permanently redirects to the apex hostname.
- SQLite stores application data, sessions, and cache; queues run synchronously.
- Public registration, password-reset email, and email-verification flows remain disabled until outbound email is intentionally added.
- Every provisioned application user is an administrator, so account creation is available only through the interactive server command.
- Production secrets, `.env`, private keys, and SQLite files never enter Git, release artifacts, command output, or chat.
- GitHub deployment runs only after validation succeeds on a push to `master`.
- Daily and pre-deployment SQLite backups remain local and are retained for 14 days; complete Droplet loss is not covered.
- Root SSH is disabled only after owner and workflow access through the `deploy` account are proven.
- The repository-local Git identity remains `Harvey Christian Pacleb <24486552+hpacleb@users.noreply.github.com>`; do not change global Git configuration.

## File Map

- Modify `config/fortify.php` to expose only login, two-factor authentication, and passkeys.
- Create `app/Console/Commands/CreateAdmin.php` as the only supported production account-provisioning interface.
- Create `tests/Feature/Auth/DisabledPublicAuthTest.php` to prove public account and email-dependent routes are absent.
- Create `tests/Feature/Console/CreateAdminCommandTest.php` to prove secure administrator creation and duplicate rejection.
- Create `deploy/bin/food21-backup` for consistent SQLite backup, integrity validation, and retention.
- Create `deploy/bin/food21-deploy-release` for locked, atomic release activation and rollback.
- Create `deploy/bin/food21-healthcheck` for origin and public health checks.
- Create `deploy/config/Caddyfile` for TLS, canonical redirects, static files, FastCGI, Cloudflare proxy trust, headers, and log rotation.
- Create `deploy/config/php-fpm.conf` for a memory-limited on-demand application pool.
- Create `deploy/config/php.ini` for conservative production PHP and OPcache settings.
- Create `deploy/config/sshd-hardening.conf` for key-only SSH and disabled root login.
- Create `deploy/config/sudoers-food21` for one narrowly scoped PHP-FPM reload command.
- Create `deploy/systemd/food21-backup.service` and `deploy/systemd/food21-backup.timer` for daily backups.
- Create `deploy/provision.sh` for idempotent server package, account, filesystem, environment, firewall, and service setup.
- Create `deploy/tests/backup-test.sh`, `deploy/tests/release-test.sh`, `deploy/tests/config-test.sh`, and `deploy/tests/run.sh` for infrastructure automation checks.
- Modify `.github/workflows/tests.yml` to validate `master`, build the release, and deploy only after CI succeeds.

---

### Task 1: Restrict Authentication And Add Interactive Administrator Provisioning

**Files:**
- Modify: `config/fortify.php:163-175`
- Create: `app/Console/Commands/CreateAdmin.php`
- Create: `tests/Feature/Auth/DisabledPublicAuthTest.php`
- Create: `tests/Feature/Console/CreateAdminCommandTest.php`

**Interfaces:**
- Consumes: Existing `App\Models\User`, Fortify feature configuration, Laravel console auto-discovery.
- Produces: `php artisan app:create-admin`, an interactive command with no password argument or option.

- [ ] **Step 1: Write the failing public-authentication test**

```php
<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

test('public and email dependent account routes are disabled', function () {
    expect(Features::enabled(Features::registration()))->toBeFalse()
        ->and(Features::enabled(Features::resetPasswords()))->toBeFalse()
        ->and(Features::enabled(Features::emailVerification()))->toBeFalse()
        ->and(Route::has('register'))->toBeFalse()
        ->and(Route::has('register.store'))->toBeFalse()
        ->and(Route::has('password.request'))->toBeFalse()
        ->and(Route::has('password.email'))->toBeFalse()
        ->and(Route::has('verification.notice'))->toBeFalse()
        ->and(Route::has('verification.send'))->toBeFalse();
});
```

- [ ] **Step 2: Write the failing administrator-command tests**

```php
<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('an administrator can be provisioned interactively', function () {
    $this->artisan('app:create-admin')
        ->expectsQuestion('Administrator name', 'Harvey Pacleb')
        ->expectsQuestion('Administrator email', 'admin@food21services.com')
        ->expectsQuestion('Password', 'Correct-Horse-21!')
        ->expectsQuestion('Confirm password', 'Correct-Horse-21!')
        ->expectsOutputToContain('Administrator created')
        ->assertSuccessful();

    $user = User::query()->where('email', 'admin@food21services.com')->firstOrFail();

    expect($user->name)->toBe('Harvey Pacleb')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Hash::check('Correct-Horse-21!', $user->password))->toBeTrue();
});

test('an existing email cannot be provisioned again', function () {
    User::factory()->create(['email' => 'admin@food21services.com']);

    $this->artisan('app:create-admin')
        ->expectsQuestion('Administrator name', 'Another Admin')
        ->expectsQuestion('Administrator email', 'admin@food21services.com')
        ->expectsQuestion('Password', 'Correct-Horse-21!')
        ->expectsQuestion('Confirm password', 'Correct-Horse-21!')
        ->expectsOutputToContain('email has already been taken')
        ->assertFailed();

    expect(User::query()->where('email', 'admin@food21services.com')->count())->toBe(1);
});
```

- [ ] **Step 3: Run the focused tests and verify both fail**

Run: `php artisan test tests/Feature/Auth/DisabledPublicAuthTest.php tests/Feature/Console/CreateAdminCommandTest.php`

Expected: FAIL because registration routes are enabled and `app:create-admin` is undefined.

- [ ] **Step 4: Disable the three Fortify features**

Change `config/fortify.php` so the feature list is exactly:

```php
'features' => [
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
    Features::passkeys([
        'confirmPassword' => true,
    ]),
],
```

- [ ] **Step 5: Implement the interactive command**

Create `app/Console/Commands/CreateAdmin.php` with this behavior:

```php
<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdmin extends Command
{
    protected $signature = 'app:create-admin';

    protected $description = 'Interactively create a Food21 administrator';

    public function handle(): int
    {
        $input = [
            'name' => (string) $this->ask('Administrator name'),
            'email' => (string) $this->ask('Administrator email'),
            'password' => (string) $this->secret('Password'),
            'password_confirmation' => (string) $this->secret('Confirm password'),
        ];

        $validator = Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = new User([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);
        $user->email_verified_at = now();
        $user->save();

        $this->info("Administrator created for {$user->email}.");

        return self::SUCCESS;
    }
}
```

- [ ] **Step 6: Run focused and full application checks**

Run: `php artisan test tests/Feature/Auth/DisabledPublicAuthTest.php tests/Feature/Console/CreateAdminCommandTest.php`

Expected: PASS.

Run: `composer ci:check`

Expected: PASS; legacy Fortify tests guarded by `skipUnlessFortifyHas` are skipped for disabled features.

- [ ] **Step 7: Commit the application security change**

```bash
git add config/fortify.php app/Console/Commands/CreateAdmin.php tests/Feature/Auth/DisabledPublicAuthTest.php tests/Feature/Console/CreateAdminCommandTest.php
git commit -m "feat(auth): restrict administrator provisioning"
```

---

### Task 2: Add Consistent SQLite Backups

**Files:**
- Create: `deploy/bin/food21-backup`
- Create: `deploy/systemd/food21-backup.service`
- Create: `deploy/systemd/food21-backup.timer`
- Create: `deploy/tests/backup-test.sh`

**Interfaces:**
- Consumes: `sqlite3`, the shared database path, and a writable backup directory.
- Produces: `food21-backup`, with test overrides `FOOD21_DATABASE_PATH`, `FOOD21_BACKUP_DIR`, and `FOOD21_RETENTION_DAYS`.

- [ ] **Step 1: Write the failing backup integration test**

Create `deploy/tests/backup-test.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TEST_DIR"' EXIT

DATABASE_PATH="$TEST_DIR/database.sqlite"
BACKUP_DIR="$TEST_DIR/backups"

sqlite3 "$DATABASE_PATH" "CREATE TABLE messages (body TEXT NOT NULL); INSERT INTO messages VALUES ('saved');"
mkdir -p "$BACKUP_DIR"
touch -t 202001010000 "$BACKUP_DIR/database-20200101T000000Z.sqlite"

FOOD21_DATABASE_PATH="$DATABASE_PATH" \
FOOD21_BACKUP_DIR="$BACKUP_DIR" \
FOOD21_RETENTION_DAYS=14 \
bash "$ROOT_DIR/deploy/bin/food21-backup"

BACKUP_PATH=$(find "$BACKUP_DIR" -type f -name 'database-*.sqlite' -print | sort | tail -n 1)
[[ "$(sqlite3 "$BACKUP_PATH" 'SELECT body FROM messages;')" == 'saved' ]]
[[ "$(sqlite3 "$BACKUP_PATH" 'PRAGMA quick_check;')" == 'ok' ]]
[[ ! -e "$BACKUP_DIR/database-20200101T000000Z.sqlite" ]]
[[ ! -e "$BACKUP_PATH.tmp" ]]
```

- [ ] **Step 2: Run the test and verify it fails because the command is absent**

Run: `bash deploy/tests/backup-test.sh`

Expected: FAIL with `deploy/bin/food21-backup: No such file or directory`.

- [ ] **Step 3: Implement the backup command**

Create an executable `deploy/bin/food21-backup`:

```bash
#!/usr/bin/env bash
set -euo pipefail

umask 077

DATABASE_PATH=${FOOD21_DATABASE_PATH:-/var/www/food21web/shared/database/database.sqlite}
BACKUP_DIR=${FOOD21_BACKUP_DIR:-/var/backups/food21web}
RETENTION_DAYS=${FOOD21_RETENTION_DAYS:-14}
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_PATH="$BACKUP_DIR/database-$TIMESTAMP.sqlite"
TEMP_PATH="$BACKUP_PATH.tmp"

[[ -f "$DATABASE_PATH" ]] || { printf 'Database not found: %s\n' "$DATABASE_PATH" >&2; exit 1; }
mkdir -p "$BACKUP_DIR"
trap 'rm -f "$TEMP_PATH"' EXIT

sqlite3 "$DATABASE_PATH" ".backup '$TEMP_PATH'"
[[ "$(sqlite3 "$TEMP_PATH" 'PRAGMA quick_check;')" == 'ok' ]] || { printf 'Backup integrity check failed\n' >&2; exit 1; }
mv "$TEMP_PATH" "$BACKUP_PATH"
find "$BACKUP_DIR" -type f -name 'database-*.sqlite' -mtime "+$RETENTION_DAYS" -delete

printf 'Created %s\n' "$BACKUP_PATH"
```

- [ ] **Step 4: Add the root-owned daily systemd schedule**

Create `deploy/systemd/food21-backup.service`:

```ini
[Unit]
Description=Back up the Food21 SQLite database
After=local-fs.target

[Service]
Type=oneshot
User=deploy
Group=www-data
ExecStart=/usr/local/bin/food21-backup
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/backups/food21web /var/www/food21web/shared/database
```

Create `deploy/systemd/food21-backup.timer`:

```ini
[Unit]
Description=Run the Food21 database backup daily

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=15m

[Install]
WantedBy=timers.target
```

- [ ] **Step 5: Run syntax and integration checks**

Run: `bash -n deploy/bin/food21-backup deploy/tests/backup-test.sh`

Expected: no output and exit code 0.

Run: `bash deploy/tests/backup-test.sh`

Expected: PASS with one current, integrity-checked backup and no obsolete fixture.

- [ ] **Step 6: Commit the backup unit**

```bash
git add deploy/bin/food21-backup deploy/systemd/food21-backup.service deploy/systemd/food21-backup.timer deploy/tests/backup-test.sh
git commit -m "ops(backup): add SQLite backup rotation"
```

---

### Task 3: Add Atomic Release Activation And Rollback

**Files:**
- Create: `deploy/bin/food21-deploy-release`
- Create: `deploy/bin/food21-healthcheck`
- Create: `deploy/tests/release-test.sh`

**Interfaces:**
- Consumes: A 40-character Git commit SHA and `/tmp/food21-release-SHA.tar.gz` archive created by GitHub Actions.
- Produces: An activated `/var/www/food21web/current` symlink, five retained releases, a pre-migration backup, and automatic symlink rollback after failed health checks.
- Test overrides: `FOOD21_APP_ROOT`, `FOOD21_BACKUP_BIN`, `FOOD21_PHP_BIN`, `FOOD21_SUDO_BIN`, `FOOD21_RELOAD_BIN`, `FOOD21_HEALTHCHECK_BIN`, and `FOOD21_WEB_GROUP`.

- [ ] **Step 1: Write a failing release integration test**

Create `deploy/tests/release-test.sh` that performs these exact assertions:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TEST_DIR"' EXIT

APP_ROOT="$TEST_DIR/app"
TOOLS_DIR="$TEST_DIR/tools"
SOURCE_DIR="$TEST_DIR/source"
mkdir -p "$APP_ROOT/shared/database" "$APP_ROOT/shared/storage" "$TOOLS_DIR" \
    "$SOURCE_DIR/public/build" "$SOURCE_DIR/bootstrap/cache" "$SOURCE_DIR/vendor"
printf 'APP_KEY=base64:test\n' > "$APP_ROOT/shared/.env"
sqlite3 "$APP_ROOT/shared/database/database.sqlite" 'CREATE TABLE initial (id INTEGER);'
printf '<?php\n' > "$SOURCE_DIR/artisan"
printf '<?php\n' > "$SOURCE_DIR/public/index.php"
printf '<?php\n' > "$SOURCE_DIR/vendor/autoload.php"
printf '{}\n' > "$SOURCE_DIR/public/build/manifest.json"

cat > "$TOOLS_DIR/php" <<'SCRIPT'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$FOOD21_TEST_LOG"
exit 0
SCRIPT

cat > "$TOOLS_DIR/backup" <<'SCRIPT'
#!/usr/bin/env bash
printf 'backup\n' >> "$FOOD21_TEST_LOG"
exit 0
SCRIPT

cat > "$TOOLS_DIR/sudo" <<'SCRIPT'
#!/usr/bin/env bash
"$@"
SCRIPT

cat > "$TOOLS_DIR/reload" <<'SCRIPT'
#!/usr/bin/env bash
printf 'reload\n' >> "$FOOD21_TEST_LOG"
SCRIPT

cat > "$TOOLS_DIR/healthy" <<'SCRIPT'
#!/usr/bin/env bash
exit 0
SCRIPT

cat > "$TOOLS_DIR/unhealthy" <<'SCRIPT'
#!/usr/bin/env bash
exit 1
SCRIPT

chmod +x "$TOOLS_DIR"/*
tar -C "$SOURCE_DIR" -czf "$TEST_DIR/first.tar.gz" .
export FOOD21_TEST_LOG="$TEST_DIR/commands.log"

COMMON_ENV=(
    "FOOD21_APP_ROOT=$APP_ROOT"
    "FOOD21_BACKUP_BIN=$TOOLS_DIR/backup"
    "FOOD21_PHP_BIN=$TOOLS_DIR/php"
    "FOOD21_SUDO_BIN=$TOOLS_DIR/sudo"
    "FOOD21_RELOAD_BIN=$TOOLS_DIR/reload"
    "FOOD21_WEB_GROUP=$(id -gn)"
)

FIRST_SHA=1111111111111111111111111111111111111111
env "${COMMON_ENV[@]}" "FOOD21_HEALTHCHECK_BIN=$TOOLS_DIR/healthy" \
    bash "$ROOT_DIR/deploy/bin/food21-deploy-release" "$FIRST_SHA" "$TEST_DIR/first.tar.gz"

FIRST_RELEASE=$(readlink "$APP_ROOT/current")
[[ -d "$FIRST_RELEASE" ]]
[[ -L "$FIRST_RELEASE/.env" ]]
[[ -L "$FIRST_RELEASE/storage" ]]
[[ -L "$FIRST_RELEASE/database/database.sqlite" ]]
grep -Fxq 'backup' "$FOOD21_TEST_LOG"
grep -Fq 'artisan migrate --force' "$FOOD21_TEST_LOG"
grep -Fq 'artisan db:seed --class=Database\\Seeders\\MenuPriceSeeder --force' "$FOOD21_TEST_LOG"
grep -Fq 'artisan optimize' "$FOOD21_TEST_LOG"

SECOND_SHA=2222222222222222222222222222222222222222
if env "${COMMON_ENV[@]}" "FOOD21_HEALTHCHECK_BIN=$TOOLS_DIR/unhealthy" \
    bash "$ROOT_DIR/deploy/bin/food21-deploy-release" "$SECOND_SHA" "$TEST_DIR/first.tar.gz"; then
    printf 'Unhealthy release unexpectedly succeeded\n' >&2
    exit 1
fi

[[ "$(readlink "$APP_ROOT/current")" == "$FIRST_RELEASE" ]]
```

- [ ] **Step 2: Run the release test and verify it fails because the command is absent**

Run: `bash deploy/tests/release-test.sh`

Expected: FAIL with `deploy/bin/food21-deploy-release: No such file or directory`.

- [ ] **Step 3: Implement the public and origin health check**

Create executable `deploy/bin/food21-healthcheck`:

```bash
#!/usr/bin/env bash
set -euo pipefail

curl --fail --silent --show-error --retry 5 --retry-delay 2 \
    --resolve food21services.com:443:127.0.0.1 \
    https://food21services.com/up >/dev/null
curl --fail --silent --show-error --retry 5 --retry-delay 2 \
    https://food21services.com/ >/dev/null
```

- [ ] **Step 4: Implement release validation, extraction, and shared links**

Create executable `deploy/bin/food21-deploy-release` with `set -euo pipefail`, a restrictive `umask`, and an atomic lock directory at `$FOOD21_APP_ROOT/.deploy.lock`. Exit immediately when `mkdir` cannot acquire the lock, and remove the lock from the exit trap. Use these defaults:

```bash
APP_ROOT=${FOOD21_APP_ROOT:-/var/www/food21web}
BACKUP_BIN=${FOOD21_BACKUP_BIN:-/usr/local/bin/food21-backup}
PHP_BIN=${FOOD21_PHP_BIN:-/usr/bin/php}
SUDO_BIN=${FOOD21_SUDO_BIN:-/usr/bin/sudo}
RELOAD_BIN=${FOOD21_RELOAD_BIN:-/usr/bin/systemctl}
HEALTHCHECK_BIN=${FOOD21_HEALTHCHECK_BIN:-/usr/local/bin/food21-healthcheck}
WEB_GROUP=${FOOD21_WEB_GROUP:-www-data}
```

Require exactly two arguments, reject a SHA that does not match `^[0-9a-f]{40}$`, require the archive to be a regular file, and require `.env`, storage, and SQLite shared paths. Use release ID `$(date -u +%Y%m%dT%H%M%SZ)-${SHA:0:7}`. Extract with `tar -xzf "$ARCHIVE_PATH" -C "$RELEASE_PATH"`, then require `artisan`, `public/index.php`, `vendor/autoload.php`, and `public/build/manifest.json`.

Create these links and writable paths before running Artisan:

```bash
ln -s "$APP_ROOT/shared/.env" "$RELEASE_PATH/.env"
rm -rf "$RELEASE_PATH/storage"
ln -s "$APP_ROOT/shared/storage" "$RELEASE_PATH/storage"
mkdir -p "$RELEASE_PATH/database" "$RELEASE_PATH/bootstrap/cache"
rm -f "$RELEASE_PATH/database/database.sqlite"
ln -s "$APP_ROOT/shared/database/database.sqlite" "$RELEASE_PATH/database/database.sqlite"
chgrp -R "$WEB_GROUP" "$RELEASE_PATH/bootstrap/cache"
chmod -R g+rwX "$RELEASE_PATH/bootstrap/cache" "$APP_ROOT/shared/storage" "$APP_ROOT/shared/database"
```

- [ ] **Step 5: Implement migration, activation, health rollback, and retention**

The command sequence must be:

```bash
"$BACKUP_BIN"
"$PHP_BIN" "$RELEASE_PATH/artisan" migrate --force
"$PHP_BIN" "$RELEASE_PATH/artisan" db:seed --class='Database\Seeders\MenuPriceSeeder' --force
"$PHP_BIN" "$RELEASE_PATH/artisan" optimize
```

Capture the previous absolute symlink target before activation. Implement a `swap_current_link` function that removes a stale `current.next`, creates it for the requested target, and uses GNU `mv -Tf` on Linux or BSD `mv -fh` on macOS so tests and production both use an atomic rename:

```bash
swap_current_link() {
    local target=$1

    rm -f "$APP_ROOT/current.next"
    ln -s "$target" "$APP_ROOT/current.next"

    if mv --help >/dev/null 2>&1; then
        mv -Tf "$APP_ROOT/current.next" "$APP_ROOT/current"
    else
        mv -fh "$APP_ROOT/current.next" "$APP_ROOT/current"
    fi
}

swap_current_link "$RELEASE_PATH"
```

In production, reload with `"$SUDO_BIN" "$RELOAD_BIN" reload php8.3-fpm.service`; when `FOOD21_RELOAD_BIN` differs from `/usr/bin/systemctl`, execute `"$SUDO_BIN" "$RELOAD_BIN"` so the test double receives no production arguments. Run `"$HEALTHCHECK_BIN"` after reload. If reload or health checking fails, use `swap_current_link` to restore the prior target, or remove `current` when this was the first release, then reload again, remove the failed release, and exit nonzero. On success, delete the uploaded archive and all but the five newest release directories.

- [ ] **Step 6: Run release syntax and behavior checks**

Run: `bash -n deploy/bin/food21-deploy-release deploy/bin/food21-healthcheck deploy/tests/release-test.sh`

Expected: no output and exit code 0.

Run: `bash deploy/tests/release-test.sh`

Expected: PASS; the first release activates and the second unhealthy release restores the first symlink.

- [ ] **Step 7: Commit release activation**

```bash
git add deploy/bin/food21-deploy-release deploy/bin/food21-healthcheck deploy/tests/release-test.sh
git commit -m "ops(deploy): add atomic release activation"
```

---

### Task 4: Add Reproducible Server Configuration

**Files:**
- Create: `deploy/config/Caddyfile`
- Create: `deploy/config/php-fpm.conf`
- Create: `deploy/config/php.ini`
- Create: `deploy/config/sshd-hardening.conf`
- Create: `deploy/config/sudoers-food21`
- Create: `deploy/provision.sh`
- Create: `deploy/tests/config-test.sh`
- Create: `deploy/tests/run.sh`

**Interfaces:**
- Consumes: Root access to Ubuntu 24.04 and this repository's `deploy` directory.
- Produces: An idempotently provisioned Caddy/PHP-FPM host, shared application paths, production `.env`, firewall, backup timer, and restricted `deploy` account.

- [ ] **Step 1: Write the failing static configuration test**

Create `deploy/tests/config-test.sh` to run `bash -n` and assert every critical setting:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

bash -n deploy/provision.sh deploy/bin/food21-backup deploy/bin/food21-deploy-release deploy/bin/food21-healthcheck
grep -Fq 'food21services.com' deploy/config/Caddyfile
grep -Fq 'www.food21services.com' deploy/config/Caddyfile
grep -Fq 'trusted_proxies_strict' deploy/config/Caddyfile
grep -Fq 'resolve_root_symlink' deploy/config/Caddyfile
grep -Fq 'php8.3-fpm-food21web.sock' deploy/config/Caddyfile
grep -Fq 'pm = ondemand' deploy/config/php-fpm.conf
grep -Fq 'pm.max_children = 3' deploy/config/php-fpm.conf
grep -Fq 'PermitRootLogin no' deploy/config/sshd-hardening.conf
grep -Fq 'PasswordAuthentication no' deploy/config/sshd-hardening.conf
grep -Fq 'systemctl reload php8.3-fpm.service' deploy/config/sudoers-food21
grep -Fq 'APP_ENV=production' deploy/provision.sh
grep -Fq 'APP_DEBUG=false' deploy/provision.sh
grep -Fq 'QUEUE_CONNECTION=sync' deploy/provision.sh
grep -Fq 'SESSION_SECURE_COOKIE=true' deploy/provision.sh
grep -Fq 'ufw --force enable' deploy/provision.sh
```

- [ ] **Step 2: Run the static test and verify missing configuration fails**

Run: `bash deploy/tests/config-test.sh`

Expected: FAIL because `deploy/provision.sh` and the configuration files do not exist.

- [ ] **Step 3: Add the Caddy configuration**

Create `deploy/config/Caddyfile` with Cloudflare's published ranges and strict right-to-left proxy parsing:

```caddyfile
{
    servers {
        trusted_proxies static 173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22 2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32
        trusted_proxies_strict
        client_ip_headers CF-Connecting-IP X-Forwarded-For
        timeouts {
            read_header 10s
            idle 2m
        }
    }
}

(food21-common) {
    encode zstd gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
    log {
        output file /var/log/caddy/food21-access.log {
            roll_size 10MiB
            roll_keep 5
            roll_keep_for 168h
        }
        format json
    }
}

www.food21services.com {
    redir https://food21services.com{uri} permanent
}

food21services.com {
    import food21-common
    root * /var/www/food21web/current/public
    php_fastcgi unix//run/php/php8.3-fpm-food21web.sock {
        resolve_root_symlink
        env REMOTE_ADDR {client_ip}
    }
    file_server
}
```

- [ ] **Step 4: Add the PHP-FPM pool and PHP overrides**

Create `deploy/config/php-fpm.conf`:

```ini
[food21web]
user = www-data
group = www-data
listen = /run/php/php8.3-fpm-food21web.sock
listen.owner = caddy
listen.group = www-data
listen.mode = 0660
pm = ondemand
pm.max_children = 3
pm.process_idle_timeout = 10s
pm.max_requests = 500
catch_workers_output = yes
clear_env = no
```

Create `deploy/config/php.ini`:

```ini
expose_php = Off
memory_limit = 128M
max_execution_time = 30
post_max_size = 12M
upload_max_filesize = 10M
opcache.enable = 1
opcache.memory_consumption = 64
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 1
opcache.revalidate_freq = 2
```

- [ ] **Step 5: Add SSH and sudo policy files**

Create `deploy/config/sshd-hardening.conf`:

```text
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

Create `deploy/config/sudoers-food21`:

```text
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.3-fpm.service
```

- [ ] **Step 6: Implement idempotent provisioning**

Create executable `deploy/provision.sh`. It must stop unless `id -u` equals `0`, derive its own directory with `BASH_SOURCE`, and perform these operations idempotently:

```bash
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y debian-keyring debian-archive-keyring apt-transport-https ca-certificates curl gnupg php8.3-cli php8.3-fpm php8.3-curl php8.3-mbstring php8.3-sqlite3 php8.3-xml php8.3-zip php8.3-intl sqlite3 unzip rsync acl ufw unattended-upgrades
```

Install Caddy from its official Cloudsmith APT signing key and source only when `/etc/apt/sources.list.d/caddy-stable.list` is absent, then install `caddy`:

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    -o /etc/apt/sources.list.d/caddy-stable.list
chmod 0644 /usr/share/keyrings/caddy-stable-archive-keyring.gpg /etc/apt/sources.list.d/caddy-stable.list
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y caddy
```

Create `/swapfile` with `fallocate -l 1G`, mode `0600`, `mkswap`, `swapon`, and one `/etc/fstab` entry when swap is absent.

Create `deploy` with shell `/bin/bash` and a home directory, then add it to the `www-data` group. Copy `/root/.ssh/authorized_keys` to `/home/deploy/.ssh/authorized_keys` only when the deploy file does not yet exist. Set `.ssh` to `0700`, `authorized_keys` to `0600`, and all ownership to `deploy:deploy`.

Create these paths and permissions:

```text
/var/www/food21web                         deploy:www-data 02775
/var/www/food21web/releases                deploy:www-data 02775
/var/www/food21web/shared                  deploy:www-data 02775
/var/www/food21web/shared/database         deploy:www-data 02775
/var/www/food21web/shared/storage          deploy:www-data 02775
/var/backups/food21web                     deploy:www-data 02770
```

Create Laravel's `storage/app/private`, `storage/app/public`, `storage/framework/cache/data`, `storage/framework/sessions`, `storage/framework/testing`, `storage/framework/views`, and `storage/logs` subdirectories. Create the SQLite file as `deploy:www-data` mode `0660`.

When `/var/www/food21web/shared/.env` is absent, generate the app key with `APP_KEY="base64:$(openssl rand -base64 32)"` and write mode `0640`, owner `deploy:www-data`, with these exact non-secret settings:

```dotenv
APP_NAME="Food21 Catering Delivery"
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_URL=https://food21services.com
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12
LOG_CHANNEL=daily
LOG_LEVEL=warning
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/food21web/shared/database/database.sqlite
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
CACHE_STORE=database
MAIL_MAILER=log
MAIL_FROM_ADDRESS="food21catering@gmail.com"
MAIL_FROM_NAME="Food21 Catering Delivery"
```

Install files with these exact destinations and root ownership:

```text
deploy/bin/food21-backup                 /usr/local/bin/food21-backup                         0755
deploy/bin/food21-deploy-release         /usr/local/bin/food21-deploy-release                 0755
deploy/bin/food21-healthcheck            /usr/local/bin/food21-healthcheck                    0755
deploy/config/Caddyfile                  /etc/caddy/Caddyfile                                 0644
deploy/config/php-fpm.conf               /etc/php/8.3/fpm/pool.d/food21web.conf               0644
deploy/config/php.ini                    /etc/php/8.3/fpm/conf.d/99-food21.ini                 0644
deploy/config/sudoers-food21             /etc/sudoers.d/food21                                0440
deploy/systemd/food21-backup.service     /etc/systemd/system/food21-backup.service            0644
deploy/systemd/food21-backup.timer       /etc/systemd/system/food21-backup.timer              0644
```

Remove `/etc/php/8.3/fpm/pool.d/www.conf`; validate sudoers with `visudo -cf /etc/sudoers.d/food21`; run `systemctl daemon-reload`; validate Caddy and PHP-FPM before restarting either service.

Enable the backup timer, PHP-FPM, Caddy, and unattended upgrades. Configure UFW with `ufw limit 22/tcp`, `ufw allow 80/tcp`, `ufw allow 443/tcp`, and `ufw --force enable`. Do not install `sshd-hardening.conf` yet; print the later installation command instead.

- [ ] **Step 7: Add the aggregate infrastructure test runner**

Create executable `deploy/tests/run.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
bash "$ROOT_DIR/deploy/tests/backup-test.sh"
bash "$ROOT_DIR/deploy/tests/release-test.sh"
bash "$ROOT_DIR/deploy/tests/config-test.sh"
```

- [ ] **Step 8: Run infrastructure tests**

Run: `bash deploy/tests/run.sh`

Expected: PASS.

Run when ShellCheck is installed: `shellcheck deploy/provision.sh deploy/bin/* deploy/tests/*.sh`

Expected: no findings. Fix quoted variables, trap behavior, and test-only overrides rather than suppressing findings.

- [ ] **Step 9: Commit server configuration**

```bash
git add deploy/config deploy/provision.sh deploy/tests/config-test.sh deploy/tests/run.sh
git commit -m "ops(server): add production host configuration"
```

---

### Task 5: Add The Validated GitHub Actions Deployment Pipeline

**Files:**
- Modify: `.github/workflows/tests.yml`
- Modify: `deploy/tests/config-test.sh`

**Interfaces:**
- Consumes: GitHub `production` environment secrets `PRODUCTION_HOST`, `PRODUCTION_USER`, `PRODUCTION_SSH_PRIVATE_KEY`, and `PRODUCTION_KNOWN_HOSTS`.
- Produces: One validation job for pull requests and `master`, followed by one production build/deploy job only for successful `master` pushes.

- [ ] **Step 1: Extend the static test with workflow requirements**

Append to `deploy/tests/config-test.sh`:

```bash
grep -A4 '^on:' .github/workflows/tests.yml | grep -Fq -- '- master'
grep -Fq 'needs: ci' .github/workflows/tests.yml
grep -Fq "github.ref == 'refs/heads/master'" .github/workflows/tests.yml
grep -Fq 'environment: production' .github/workflows/tests.yml
grep -Fq 'PRODUCTION_SSH_PRIVATE_KEY' .github/workflows/tests.yml
grep -Fq 'food21-deploy-release' .github/workflows/tests.yml
```

- [ ] **Step 2: Run the static test and verify the branch assertion fails**

Run: `bash deploy/tests/config-test.sh`

Expected: FAIL because the workflow listens to `main` and has no deploy job.

- [ ] **Step 3: Correct and extend the workflow**

Modify `.github/workflows/tests.yml` with these rules:

- Change the pushed branch from `main` to `master`.
- Change CI PHP from `8.4` to `8.3` so validation matches production.
- Keep `permissions: contents: read` and pinned third-party action commit SHAs.
- Replace `composer setup` in CI with `composer install --no-interaction --prefer-dist`, creation of `.env` and `database/database.sqlite`, `php artisan key:generate`, `php artisan migrate --force`, `npm ci`, and `npm run build` so both dependency managers enforce their lock files.
- Install `shellcheck` and `sqlite3` with APT in CI, then run `shellcheck deploy/provision.sh deploy/bin/* deploy/tests/*.sh` before the infrastructure integration tests.
- Run `bash deploy/tests/run.sh` after `composer ci:check` in the `ci` job.
- Add a `deploy` job with `needs: ci`, `environment: production`, and `if: github.event_name == 'push' && github.ref == 'refs/heads/master'`.
- Set concurrency group `production` with `cancel-in-progress: false` so releases cannot overlap.

The deploy job must check out the exact tested commit, configure PHP 8.3 and Node 22, then run:

```bash
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
cp .env.example .env
php artisan key:generate
npm ci
npm run build
rm -f .env database/database.sqlite
tar --exclude='.git' --exclude='.github' --exclude='docs' --exclude='node_modules' --exclude='tests' --exclude='deploy/tests' -czf "/tmp/food21-release-${GITHUB_SHA}.tar.gz" .
```

The SSH setup step must use `install -d -m 0700 ~/.ssh`, write the private key with mode `0600`, and write the pinned known-host entry with mode `0600`. It must source values only from the four production environment secrets and must not run `ssh-keyscan` inside Actions.

The transfer and activation step must run:

```bash
scp -i ~/.ssh/food21_deploy "/tmp/food21-release-${GITHUB_SHA}.tar.gz" \
    "${PRODUCTION_USER}@${PRODUCTION_HOST}:/tmp/food21-release-${GITHUB_SHA}.tar.gz"
ssh -i ~/.ssh/food21_deploy "${PRODUCTION_USER}@${PRODUCTION_HOST}" \
    "/usr/local/bin/food21-deploy-release '${GITHUB_SHA}' '/tmp/food21-release-${GITHUB_SHA}.tar.gz'"
```

- [ ] **Step 4: Run repository-wide verification**

Run: `composer ci:check`

Expected: PASS.

Run: `bash deploy/tests/run.sh`

Expected: PASS.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 5: Commit the workflow**

```bash
git add .github/workflows/tests.yml deploy/tests/config-test.sh
git commit -m "ci: deploy successful master builds"
```

---

### Task 6: Provision The Droplet Without Disabling Root Recovery

**Files:**
- Read: `deploy/provision.sh`
- Install remotely: repository-owned files under `deploy/`
- Create locally outside Git: `/var/folders/ty/p6gyyrdd4bq0w381qrxgmwm00000gn/T/opencode/food21-github-actions`

**Interfaces:**
- Consumes: Existing key-based root SSH to `168.144.128.161`.
- Produces: Provisioned host, working owner SSH as `deploy`, dedicated GitHub Actions keypair, and pinned host-key value.

- [ ] **Step 1: Re-run local verification immediately before touching production**

Run: `composer ci:check`

Expected: PASS.

Run: `bash deploy/tests/run.sh`

Expected: PASS.

Run: `git status --short --branch`

Expected: `master` is ahead of `origin/master` only by the reviewed deployment commits, with no uncommitted files.

- [ ] **Step 2: Generate the dedicated workflow key outside the repository**

First verify the approved temporary parent exists:

Run: `ls -ld /var/folders/ty/p6gyyrdd4bq0w381qrxgmwm00000gn/T/opencode`

Then run:

```bash
ssh-keygen -t ed25519 -N '' \
    -C 'github-actions-food21' \
    -f /var/folders/ty/p6gyyrdd4bq0w381qrxgmwm00000gn/T/opencode/food21-github-actions
```

Expected: private and public keys exist only under the approved temporary directory and are absent from `git status`.

- [ ] **Step 3: Upload and run provisioning as root**

Verify the remote parent first: `ssh root@168.144.128.161 'ls -ld /root'`.

Run:

```bash
rsync -az deploy/ root@168.144.128.161:/root/food21-deploy/
ssh root@168.144.128.161 'bash /root/food21-deploy/provision.sh'
```

Expected: packages install, swap activates, shared paths and `.env` are created, UFW enables ports 22/80/443, and Caddy/PHP-FPM/backup timer enable. Root SSH remains available because the hardening fragment is not installed.

- [ ] **Step 4: Install the GitHub public key for the restricted account**

Append the contents of `food21-github-actions.pub` once to `/home/deploy/.ssh/authorized_keys` over the existing root connection, prefixed with the OpenSSH `restrict` option. Restore owner `deploy:deploy` and mode `0600`. Do not copy the private key to the server.

- [ ] **Step 5: Validate server configuration before DNS changes**

Run these read-only checks over root SSH:

```bash
swapon --show
caddy validate --config /etc/caddy/Caddyfile
php-fpm8.3 -tt
sshd -t
visudo -cf /etc/sudoers.d/food21
systemctl is-active php8.3-fpm caddy
systemctl is-enabled food21-backup.timer
ufw status verbose
ss -ltnp
```

Expected: swap is 1 GiB; Caddy, PHP-FPM, SSH, and sudoers validate; Caddy and PHP-FPM are active; the backup timer is enabled; only ports 22, 80, and 443 are allowed externally.

- [ ] **Step 6: Prove owner and workflow SSH access**

Run from the workstation with the existing owner key: `ssh deploy@168.144.128.161 'id && test -r /var/www/food21web/shared/.env'`

Expected: user is `deploy`, group includes `www-data`, and the environment is readable.

Run with the workflow key: `ssh -i /var/folders/ty/p6gyyrdd4bq0w381qrxgmwm00000gn/T/opencode/food21-github-actions deploy@168.144.128.161 'test -x /usr/local/bin/food21-deploy-release'`

Expected: exit code 0.

- [ ] **Step 7: Pin the verified SSH host key**

Read `/etc/ssh/ssh_host_ed25519_key.pub` over the already trusted root connection, record its SHA256 fingerprint with `ssh-keygen -lf`, and create the exact `168.144.128.161 ssh-ed25519 ...` known-host line. Compare that line with a fresh `ssh-keyscan -t ed25519 168.144.128.161` result before supplying `PRODUCTION_KNOWN_HOSTS`.

---

### Task 7: Complete The GitHub And Cloudflare Owner Checkpoint

**Files:**
- No repository changes.
- User-managed: GitHub repository environment and Cloudflare DNS.

**Interfaces:**
- Consumes: Values produced by Task 6 and owner access to `hpacleb/food21web` and Cloudflare.
- Produces: Push authorization, deployment secrets, and DNS resolution needed for Caddy TLS and the first workflow deployment.

- [ ] **Step 1: Switch GitHub authentication to the repository owner**

The owner runs:

```bash
gh auth login
gh auth switch --user hpacleb
gh auth setup-git
```

Verify: `gh api repos/hpacleb/food21web --jq '.permissions.push'`

Expected: `true`.

- [ ] **Step 2: Create the GitHub production environment through the web UI**

In `hpacleb/food21web` under **Settings → Environments**, create `production` and add:

```text
PRODUCTION_HOST=168.144.128.161
PRODUCTION_USER=deploy
PRODUCTION_SSH_PRIVATE_KEY=the complete temporary food21-github-actions private key
PRODUCTION_KNOWN_HOSTS=the verified 168.144.128.161 ed25519 known-host line
```

Do not paste the private key into chat, a shell command, a repository variable, or a file under the repository.

- [ ] **Step 3: Add DNS-only Cloudflare records**

Create these records without changing MX records:

```text
Type: A, Name: @, Content: 168.144.128.161, Proxy status: DNS only
Type: A, Name: www, Content: 168.144.128.161, Proxy status: DNS only
```

Remove only conflicting `@` or `www` A, AAAA, or CNAME records.

- [ ] **Step 4: Verify DNS and TLS readiness**

Run: `dig +short food21services.com A`

Expected: `168.144.128.161`.

Run: `dig +short www.food21services.com A`

Expected: `168.144.128.161`.

Inspect `journalctl -u caddy` until certificate issuance for both names succeeds. A 404 before the first release is acceptable; an ACME or TLS error is not.

- [ ] **Step 5: Remove the temporary private key only after GitHub stores it**

Confirm workflow-key SSH still succeeds, then run:

```bash
rm -f /var/folders/ty/p6gyyrdd4bq0w381qrxgmwm00000gn/T/opencode/food21-github-actions
```

Expected: the private key no longer exists on the workstation, the `.pub` file remains non-sensitive, and GitHub Actions retains the only deployment private-key copy. Rotation is performed by generating and installing a replacement key before deleting the old public key.

---

### Task 8: Push, Deploy, Provision The Administrator, And Smoke Test

**Files:**
- No new repository files expected.
- Runtime: `/var/www/food21web/releases`, `/var/www/food21web/current`, shared SQLite and storage paths.

**Interfaces:**
- Consumes: Reviewed local commits, GitHub environment secrets, DNS, and provisioned server.
- Produces: First healthy production release and the initial administrator.

- [ ] **Step 1: Review exactly what will be pushed**

Run: `git status --short --branch`

Expected: clean worktree, ahead of `origin/master` by the approved specification and implementation commits.

Run: `git log --oneline origin/master..HEAD`

Expected: only the deployment specification, auth restriction, backup, release, server configuration, and CI commits.

Run: `git diff --stat origin/master..HEAD`

Expected: only files listed in this plan.

- [ ] **Step 2: Push `master` using the verified `hpacleb` credentials**

Run: `git push origin master`

Expected: push succeeds without changing commit authors.

- [ ] **Step 3: Watch the validation and deployment jobs**

Run: `RUN_ID=$(gh run list --workflow tests.yml --branch master --limit 1 --json databaseId --jq '.[0].databaseId')`

Run: `gh run watch "$RUN_ID" --exit-status`

Expected: `ci` passes, `deploy` uploads one release, migration and menu seeding succeed, health checks pass, and the workflow exits successfully.

- [ ] **Step 4: Verify release and persistent state on the server**

Run over SSH as `deploy`:

```bash
readlink -f /var/www/food21web/current
php /var/www/food21web/current/artisan about --only=environment
php /var/www/food21web/current/artisan migrate:status
sqlite3 /var/www/food21web/shared/database/database.sqlite 'PRAGMA quick_check;'
```

Expected: `current` points into `releases`, Laravel reports production with debug off, every migration is complete, and SQLite reports `ok`.

- [ ] **Step 5: Create the initial administrator without exposing its password**

The owner runs directly in their terminal:

```bash
ssh -t deploy@168.144.128.161 'cd /var/www/food21web/current && php artisan app:create-admin'
```

Enter the intended administrator name, email, password, and confirmation at the hidden prompts. Do not send the password in chat. Expected: the success message includes the entered email address.

- [ ] **Step 6: Run public and authenticated smoke tests**

Verify in a browser:

```text
https://food21services.com/
https://food21services.com/menu
https://food21services.com/contact
https://food21services.com/login
https://food21services.com/up
```

Expected: pages and assets load over valid HTTPS; `/register`, `/forgot-password`, and `/email/verify` are unavailable; the administrator can log in, submit and view a test inquiry, change a menu price, change the password, and enable two-factor authentication. Delete the test inquiry and restore any test price afterward.

- [ ] **Step 7: Verify HTTP and hostname redirects**

Run:

```bash
curl -I http://food21services.com/
curl -I https://www.food21services.com/menu
```

Expected: HTTP redirects to HTTPS, and `www` redirects permanently to `https://food21services.com/menu`.

---

### Task 9: Enable Cloudflare Proxying, Verify Recovery, And Harden SSH

**Files:**
- Install remotely after validation: `deploy/config/sshd-hardening.conf`
- No repository changes expected.

**Interfaces:**
- Consumes: A healthy production release, working owner/workflow SSH, valid origin TLS, and DigitalOcean console access.
- Produces: Cloudflare-proxied production traffic, verified backup/reboot behavior, and key-only non-root SSH.

- [ ] **Step 1: Validate a real backup and restore copy**

Run: `ssh deploy@168.144.128.161 '/usr/local/bin/food21-backup'`

Run in a `deploy` SSH session:

```bash
BACKUP_PATH=$(find /var/backups/food21web -type f -name 'database-*.sqlite' -print | sort | tail -n 1)
cp "$BACKUP_PATH" /tmp/food21-restore-check.sqlite
sqlite3 /tmp/food21-restore-check.sqlite 'PRAGMA integrity_check;'
sqlite3 /tmp/food21-restore-check.sqlite 'SELECT COUNT(*) FROM migrations;'
sqlite3 /var/www/food21web/shared/database/database.sqlite 'SELECT COUNT(*) FROM migrations;'
rm -f /tmp/food21-restore-check.sqlite
```

Expected: integrity output is `ok`, migration counts match, and the live database remains untouched.

- [ ] **Step 2: Verify scheduled services and perform one controlled reboot before hardening**

Over root SSH, run:

```bash
systemctl list-timers food21-backup.timer
systemctl is-active caddy php8.3-fpm ufw unattended-upgrades
swapon --show
systemctl reboot
```

Wait for SSH to return, then repeat the service and swap checks and run `curl --fail --silent --show-error https://food21services.com/up`.

Expected: every service and the 1 GiB swap recover automatically.

- [ ] **Step 3: Enable Cloudflare proxying**

In Cloudflare, switch the `@` and `www` records from DNS-only to proxied and set SSL/TLS mode to `Full (strict)`.

Expected: the homepage and redirects still work, the origin certificate remains valid, and Caddy access logs record the real client address rather than a spoofed direct header.

- [ ] **Step 4: Install SSH hardening only after final access confirmation**

Open and retain one root SSH session. In separate terminals, confirm owner and workflow-key `deploy` logins both succeed. From the retained root session, run:

```bash
install -o root -g root -m 0644 /root/food21-deploy/config/sshd-hardening.conf /etc/ssh/sshd_config.d/99-food21-hardening.conf
sshd -t
systemctl reload ssh
```

Expected: a new `deploy` SSH connection succeeds, password authentication fails, and a new root SSH connection is rejected. Keep DigitalOcean console access as the administrative recovery path.

- [ ] **Step 5: Perform final production verification**

Run locally:

```bash
curl --fail --silent --show-error https://food21services.com/up
curl --fail --silent --show-error https://food21services.com/ >/dev/null
curl --fail --silent --show-error https://food21services.com/menu >/dev/null
```

Run in a `deploy` SSH session:

```bash
df -h /
free -h
readlink -f /var/www/food21web/current
sqlite3 /var/www/food21web/shared/database/database.sqlite 'PRAGMA integrity_check;'
find /var/backups/food21web -type f -name 'database-*.sqlite' -print | sort | tail -n 1
systemctl --failed
ss -ltn
```

Expected: all HTTP checks pass; disk has operational headroom; swap is active; SQLite is healthy; a current backup exists; no systemd unit is failed; only SSH, HTTP, and HTTPS listen publicly.

- [ ] **Step 6: Record launch evidence without secrets**

Add no credentials or production data to Git. Record the deployed Git SHA, workflow run URL, release path, TLS result, backup filename, and final verification results in the deployment summary returned to the owner.
