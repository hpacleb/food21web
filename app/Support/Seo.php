<?php

namespace App\Support;

use Illuminate\Http\Request;

class Seo
{
    /**
     * @return array<string, array{title: string, description: string, changefreq: string, priority: string}>
     */
    public static function pages(): array
    {
        return config('seo.pages');
    }

    /**
     * @return array{title: string, description: string, canonical: string, image: string|null, json_ld: array<string, mixed>|null}
     */
    public static function forRequest(Request $request): array
    {
        $routeName = $request->route()?->getName();
        $page = self::pages()[$routeName] ?? [];

        return [
            'title' => $page['title'] ?? config('site.name'),
            'description' => $page['description'] ?? config('site.description'),
            'canonical' => self::canonicalPath($request->path()),
            'image' => self::absolute(config('site.hero_image')),
            'json_ld' => $routeName === 'home' ? self::businessJsonLd() : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected static function businessJsonLd(): array
    {
        $address = config('site.address_parts');

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'FoodEstablishment',
            'name' => config('site.name'),
            'description' => config('site.description'),
            'url' => self::canonicalPath(''),
            'image' => self::absolute(config('site.hero_image')),
            'telephone' => config('site.phone'),
            'email' => config('site.email'),
            'priceRange' => config('site.price_range'),
            'servesCuisine' => config('site.cuisine'),
            'areaServed' => config('site.area_served'),
            'openingHours' => config('site.opening_hours'),
            'sameAs' => array_values(array_filter([config('site.facebook'), config('site.instagram')])),
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $address['street'],
                'addressLocality' => $address['locality'],
                'addressRegion' => $address['region'],
                'postalCode' => $address['postal_code'],
                'addressCountry' => $address['country'],
            ],
            'geo' => [
                '@type' => 'GeoCoordinates',
                'latitude' => config('site.geo.latitude'),
                'longitude' => config('site.geo.longitude'),
            ],
        ], fn ($value) => $value !== null && $value !== []);
    }

    protected static function canonicalPath(string $path): string
    {
        return rtrim(config('site.url'), '/').'/'.ltrim($path, '/');
    }

    protected static function absolute(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return self::canonicalPath($path);
    }
}
