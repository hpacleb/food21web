<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @php
            $seo = $page['props']['seo'] ?? null;
            $seoTitle = ($seo['title'] ?? config('app.name')).' | '.config('site.short_name');
            $seoDescription = $seo['description'] ?? config('site.description');
            $seoCanonical = $seo['canonical'] ?? config('site.url');
            $seoImage = $seo['image'] ?? null;
        @endphp
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
            <meta data-inertia="description" name="description" content="{{ $seoDescription }}">
            <link data-inertia="canonical" rel="canonical" href="{{ $seoCanonical }}">
            <meta data-inertia="og:type" property="og:type" content="website">
            <meta data-inertia="og:locale" property="og:locale" content="en_PH">
            <meta data-inertia="og:site_name" property="og:site_name" content="{{ config('site.name') }}">
            <meta data-inertia="og:title" property="og:title" content="{{ $seoTitle }}">
            <meta data-inertia="og:description" property="og:description" content="{{ $seoDescription }}">
            <meta data-inertia="og:url" property="og:url" content="{{ $seoCanonical }}">
            @if ($seoImage)
                <meta data-inertia="og:image" property="og:image" content="{{ $seoImage }}">
            @endif
            <meta data-inertia="twitter:card" name="twitter:card" content="summary_large_image">
            <meta data-inertia="twitter:title" name="twitter:title" content="{{ $seoTitle }}">
            <meta data-inertia="twitter:description" name="twitter:description" content="{{ $seoDescription }}">
            @if ($seoImage)
                <meta data-inertia="twitter:image" name="twitter:image" content="{{ $seoImage }}">
            @endif
            @if ($seo['json_ld'] ?? null)
                <script data-inertia="json-ld" type="application/ld+json">{!! json_encode($seo['json_ld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
            @endif
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
