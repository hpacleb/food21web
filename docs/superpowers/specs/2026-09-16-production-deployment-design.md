# Food21 Production Deployment Design

Date: 2026-09-16
Status: Approved

## Objective

Deploy the Laravel 13 and React/Inertia application to the existing DigitalOcean Droplet at `168.144.128.161` and serve it at `https://food21services.com`. The deployment must fit the Droplet's limited resources, restrict dashboard access to deliberately provisioned administrators, support repeatable deployments from GitHub Actions, and preserve application data between releases.

## Current State

- The application requires PHP 8.3 or newer and builds frontend assets with Node 22-era tooling.
- The Git repository is `hpacleb/food21web`, and its active branch is `master`.
- The current test workflow listens for pushes to `main`, so it does not run on pushes to the active branch.
- The app uses database-backed sessions, cache, and queues by default.
- Public registration is enabled, and every authenticated user can read inquiries and update prices. There is no role or authorization boundary between authenticated users.
- The app has password-reset and email-verification flows, but production outbound email is intentionally deferred.
- The server is a clean Ubuntu 24.04 LTS Droplet with one virtual CPU, 458 MiB usable RAM, no swap, an 8.7 GB root filesystem, and only SSH listening. UFW is installed but inactive.

## Decisions

- Use a native Caddy and PHP-FPM stack rather than containers.
- Use SQLite for production data.
- Use `food21services.com` as the canonical hostname and redirect `www.food21services.com` to it.
- Build and test releases in GitHub Actions after pushes to `master`; do not build frontend assets on the Droplet.
- Keep production secrets and persistent data only on the server and in the GitHub production environment where appropriate.
- Permit only deliberately provisioned administrator accounts. Disable public registration and email-dependent authentication features while outbound email is unavailable.
- Keep local SQLite backups for 14 days. This explicitly does not protect against complete Droplet loss.

## Architecture

Cloudflare manages DNS for both hostnames. Caddy accepts HTTP and HTTPS traffic, redirects the `www` hostname to the apex hostname, obtains and renews the origin certificate, serves static files from Laravel's `public` directory, and sends PHP requests to PHP 8.3 FPM over its Unix socket.

PHP-FPM will use a small on-demand pool sized for the 458 MiB server. A 1 GiB swap file provides protection against short memory spikes, but Node, npm, and frontend compilation are excluded from the server entirely.

The application is installed under `/var/www/food21web`:

```text
/var/www/food21web/
  current -> releases/20260916T120000Z-a1b2c3d
  releases/
    20260916T120000Z-a1b2c3d/
  shared/
    .env
    database/database.sqlite
    storage/
```

Each release contains application code, production Composer dependencies, and compiled Vite assets. Its `.env`, `database/database.sqlite`, and `storage` paths point to persistent items under `shared`. Ownership and group permissions allow the `deploy` user to activate releases and the `www-data` PHP-FPM user to write Laravel runtime files and SQLite data without making application code world-writable.

## Server Baseline

The server will receive:

- A 1 GiB swap file with persistent `/etc/fstab` configuration.
- Caddy from its official Ubuntu package source.
- PHP 8.3 CLI and FPM plus Laravel's required extensions, including SQLite support.
- SQLite CLI, unzip, rsync, and ACL support required by deployment and backup scripts.
- A dedicated `deploy` account with key-based SSH access.
- UFW rules allowing only ports 22, 80, and 443, with SSH rate limiting.
- Automatic Ubuntu security updates.
- Caddy and Laravel log rotation appropriate for the 8.7 GB disk.

The deployment does not require a database server, Redis, Docker, Node, npm, or Composer on the Droplet.

## Web And TLS Configuration

Caddy will:

- Serve `/var/www/food21web/current/public` for `food21services.com`.
- Redirect every request for `www.food21services.com` to the equivalent apex URL.
- Route PHP requests through the PHP 8.3 FPM Unix socket.
- Enable static response compression.
- Deny access to hidden and application-only files through the public document root boundary.
- Emit rotated access logs.
- Add conservative security headers that do not interfere with the existing application.

Cloudflare records remain DNS-only during certificate issuance and smoke testing. After the origin is healthy over HTTPS, the records may be proxied and Cloudflare SSL/TLS mode must be `Full (strict)`. Caddy will accept forwarded client IP information only from Cloudflare's officially published proxy ranges, preventing direct clients from spoofing their address for Laravel rate limits and logs.

## Production Application Configuration

The shared production `.env` will use, at minimum, these behaviors:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://food21services.com`
- A server-generated `APP_KEY` that never enters Git or workflow logs
- An absolute path to the shared SQLite database
- Database-backed sessions and cache
- `QUEUE_CONNECTION=sync` because the app currently dispatches no asynchronous work
- `SESSION_SECURE_COOKIE=true`
- Host-only cookies for the canonical hostname
- Daily Laravel logs at warning level or above
- `MAIL_MAILER=log` until an outbound mail provider is deliberately configured

The deployment runs Laravel's production optimization commands after the shared environment is linked. Configuration, routes, events, and views are cached where supported by the app.

## Authentication And Authorization

Fortify public registration will be removed from the enabled feature list. Password-reset and email-verification features will also be disabled while outbound email is deferred, avoiding UI that appears functional but cannot deliver messages. Login, profile password changes, two-factor authentication, and passkeys remain available.

Only directly provisioned users can authenticate. A dedicated Artisan command will prompt interactively for the initial administrator's name, email, and hidden password, then create a verified user without writing the plaintext password to shell history, Git, GitHub Actions, or chat. The owner should enable two-factor authentication immediately after first login.

The application currently treats every account as an administrator. That is acceptable only because public registration and general account creation are disabled. A future staff-invitation feature would require explicit roles and authorization policies before additional account creation is exposed.

Production initialization must not run `DatabaseSeeder`, because it creates a `test@example.com` account. Migrations will create the schema, and menu prices can initialize through the existing idempotent menu synchronization or the dedicated `MenuPriceSeeder` only.

## GitHub Actions Release Pipeline

The existing CI trigger will be corrected from `main` to `master`. Pull requests continue to run checks without deploying. A push to `master` runs the complete CI suite first and deploys only after it succeeds.

The validation job will use PHP 8.3 and Node 22 to install locked dependencies and run the existing PHP, frontend, type, and test checks once. After that job passes on a push to `master`, the production job will:

1. Install production Composer dependencies from `composer.lock` with optimized autoloading.
2. Install npm dependencies from `package-lock.json` and build the Vite production assets.
3. Package application code, `vendor`, and built public assets without `.env`, local databases, test artifacts, or development dependencies.
4. Verify the server's SSH host key from a pinned `known_hosts` value.
5. Upload and activate the release through the unprivileged `deploy` account.

The GitHub `production` environment will hold:

- `PRODUCTION_HOST`: `168.144.128.161`
- `PRODUCTION_USER`: `deploy`
- `PRODUCTION_SSH_PRIVATE_KEY`: a dedicated deployment key generated for this workflow
- `PRODUCTION_KNOWN_HOSTS`: the pinned SSH host-key entry for the Droplet

The owner's current `gh` CLI session belongs to another account and will not be changed. These values can be entered through the GitHub web interface for `hpacleb/food21web`.

## Release Activation And Rollback

The server-side deployment script will:

1. Extract the uploaded artifact into a new timestamped release directory.
2. Link the shared `.env`, SQLite file, and `storage` directory.
3. Validate required files and writable paths.
4. Create a consistent pre-deployment SQLite backup.
5. Run `php artisan migrate --force` against the shared database.
6. Build Laravel production caches.
7. Atomically replace the `current` symlink.
8. Reload PHP-FPM so workers use the new release.
9. Check Laravel's `/up` endpoint and the public homepage.
10. Retain the five newest releases and remove older ones only after success.

A failure before activation leaves the existing release live. If post-activation health checks fail, the script restores the previous `current` symlink and reloads PHP-FPM. It does not automatically reverse database migrations because automatic migration rollback can destroy production data. Future schema changes must therefore remain compatible with the immediately previous application release for the duration of a deployment.

## Backups

A systemd timer will use SQLite's online backup mechanism once per day and retain 14 daily database copies under `/var/backups/food21web`. Each deployment also creates a pre-migration backup. Backup jobs fail loudly in the system journal, and deployment stops if its required pre-migration backup fails.

Restore verification will copy a backup to a temporary path, run SQLite integrity checks, and document the command used to replace the shared database during recovery. Local backups protect against accidental edits, a faulty release, and limited database corruption. They do not protect against Droplet deletion, disk failure, or account compromise; that limitation is accepted for this launch.

## SSH And Host Security

The existing root key will initially bootstrap the server. Before root SSH is disabled, both the owner's access to the new `deploy` account and GitHub's dedicated deployment key will be tested. SSH password authentication and root login will then be disabled. DigitalOcean console access remains the recovery path.

The deployment key is separate from the owner's personal key. The `deploy` account owns release files and receives only the limited sudo capabilities needed to reload PHP-FPM and run the installed deployment operation. Production secrets will not be printed by deployment scripts or included in release artifacts.

## Monitoring And Operations

Laravel's `/up` route is the deployment health endpoint. Caddy access/error logs, PHP-FPM logs, Laravel daily logs, deployment output, and backup timer results remain available through standard files or the system journal. Rotation prevents unbounded disk growth.

External uptime monitoring and centralized error reporting are not part of this launch. They can be added independently without changing the deployment architecture.

## Verification

Before launch:

- `composer ci:check` passes locally and in GitHub Actions.
- Caddy configuration validation succeeds.
- PHP-FPM configuration validation succeeds.
- The production `.env` has debug mode disabled and all required secrets populated.
- The deployment artifact contains compiled assets and production Composer dependencies but no `.env` or database.

Launch smoke tests verify:

- `https://food21services.com` returns the homepage with styles, scripts, fonts, and images.
- HTTP redirects to HTTPS.
- `https://www.food21services.com/...` redirects to the matching apex URL.
- `/up` reports healthy.
- The contact form stores an inquiry that appears in the dashboard.
- The administrator can log in, update a menu price, change a password, and configure two-factor authentication.
- Public registration and email-dependent recovery routes are unavailable.
- Application exceptions do not expose debug details.
- Session cookies are secure and HTTP-only.
- Only SSH, HTTP, and HTTPS are externally reachable.
- A fresh deployment preserves the database, storage, and environment.
- A simulated failed health check restores the prior release.
- A backup passes SQLite integrity checks and can be restored to a temporary database.
- Caddy, PHP-FPM, the firewall, and timers recover after a server reboot.

## Owner Actions

The owner must complete these account-controlled steps:

1. In Cloudflare DNS, create DNS-only `A` records for `@` and `www`, both targeting `168.144.128.161`, when server provisioning is ready for validation. Remove only conflicting records for those exact hostnames; do not alter MX or other mail records.
2. After HTTPS succeeds directly, switch both records to proxied if Cloudflare proxying is desired and set SSL/TLS mode to `Full (strict)`.
3. In the GitHub web UI for `hpacleb/food21web`, create or use the `production` environment and enter the four deployment values supplied during implementation.
4. Supply the initial administrator's name and email through the agreed interactive provisioning step, then enable two-factor authentication after first login.
5. Retain DigitalOcean console access for emergency recovery.

The owner must not share Cloudflare, DigitalOcean, or GitHub account passwords, or an existing personal SSH private key.

## Out Of Scope

- Outbound transactional email and inquiry email notifications
- Public or invited staff registration
- Multi-role authorization
- Redis, a database server, or a managed database
- Off-Droplet backups
- Docker or Kubernetes
- Horizontal scaling or multiple application servers
- External uptime monitoring and centralized error tracking
