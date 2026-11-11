# Food 21 Services

[![Tests](https://github.com/hpacleb/food21web/actions/workflows/tests.yml/badge.svg)](https://github.com/hpacleb/food21web/actions/workflows/tests.yml) [![Deploy](https://github.com/hpacleb/food21web/actions/workflows/deploy.yml/badge.svg)](https://github.com/hpacleb/food21web/actions/workflows/deploy.yml)

Production website for Food 21 Services, a catering and delivery business in Parañaque City.

Live: [food21services.com](https://food21services.com)

## Features

- Public menu catalog, gallery and catering information
- Catering quote form backed by a Laravel inquiry pipeline
- Authenticated staff dashboard for inquiries and menu prices
- Technical SEO: sitemap, robots, structured data and per-page metadata
- Server-side Inertia responses with React 19 and Tailwind CSS v4

## Stack

Laravel 13, Inertia.js, React 19, TypeScript, Tailwind CSS v4, Pest, Pint and PHPStan. Pushes to `master` run CI and deploy to the production server.

## Local development

```bash
composer setup
composer dev
```

## Checks

```bash
composer ci:check
```
