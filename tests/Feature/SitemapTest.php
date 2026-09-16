<?php

test('the sitemap lists every public page on the production domain', function () {
    $response = $this->get('/sitemap.xml');

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/xml')
        ->assertSee('<urlset', false);

    foreach ([
        'https://food21services.com/',
        'https://food21services.com/menu',
        'https://food21services.com/about',
        'https://food21services.com/gallery',
        'https://food21services.com/order',
        'https://food21services.com/contact',
    ] as $url) {
        $response->assertSee($url, false);
    }
});

test('the sitemap does not list private pages', function () {
    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertDontSee('https://food21services.com/dashboard', false)
        ->assertDontSee('https://food21services.com/settings', false);
});

test('robots.txt points crawlers to the sitemap and away from private pages', function () {
    $robots = file_get_contents(public_path('robots.txt'));

    expect($robots)
        ->toContain('Sitemap: https://food21services.com/sitemap.xml')
        ->toContain('Disallow: /dashboard')
        ->toContain('Disallow: /settings');
});
