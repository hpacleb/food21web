<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = collect(Seo::pages())
            ->map(fn (array $page, string $routeName): array => [
                'loc' => rtrim(config('site.url'), '/').route($routeName, absolute: false),
                'changefreq' => $page['changefreq'],
                'priority' => $page['priority'],
            ])
            ->values()
            ->all();

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml');
    }
}
