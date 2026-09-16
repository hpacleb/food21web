<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function seoXPath(string $html): DOMXPath
{
    $document = new DOMDocument;
    libxml_use_internal_errors(true);
    $document->loadHTML($html);
    libxml_clear_errors();

    return new DOMXPath($document);
}

dataset('public pages', [
    'home',
    'menu',
    'about',
    'gallery',
    'order',
    'contact',
]);

dataset('public page canonicals', [
    'home' => ['home', 'https://food21services.com/'],
    'menu' => ['menu', 'https://food21services.com/menu'],
    'about' => ['about', 'https://food21services.com/about'],
    'gallery' => ['gallery', 'https://food21services.com/gallery'],
    'order' => ['order', 'https://food21services.com/order'],
    'contact' => ['contact', 'https://food21services.com/contact'],
]);

test('public pages expose a search title and description', function (string $routeName) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', fn ($title) => is_string($title) && $title !== '')
            ->where('seo.description', fn ($description) => is_string($description) && mb_strlen($description) >= 50));
})->with('public pages');

test('public pages use unique search titles and descriptions', function () {
    $titles = [];
    $descriptions = [];

    foreach (['home', 'menu', 'about', 'gallery', 'order', 'contact'] as $routeName) {
        $this->get(route($routeName))->assertInertia(function (Assert $page) use (&$titles, &$descriptions) {
            $page->has('seo.title')->has('seo.description');

            $seo = $page->toArray()['props']['seo'];
            $titles[] = $seo['title'];
            $descriptions[] = $seo['description'];
        });
    }

    expect(array_unique($titles))->toHaveCount(6)
        ->and(array_unique($descriptions))->toHaveCount(6);
});

test('public pages expose their production url as canonical', function (string $routeName, string $canonical) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('seo.canonical', $canonical));
})->with('public page canonicals');

test('public pages expose an absolute social image', function (string $routeName) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.image', fn ($image) => is_string($image) && str_starts_with($image, 'https://food21services.com/')));
})->with('public pages');

test('the home page exposes local business structured data', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.json_ld.@context', 'https://schema.org')
            ->where('seo.json_ld.@type', 'FoodEstablishment')
            ->where('seo.json_ld.name', 'Food21 Catering Delivery')
            ->where('seo.json_ld.url', 'https://food21services.com/')
            ->where('seo.json_ld.telephone', '0920 914 4322')
            ->where('seo.json_ld.address.addressLocality', 'Parañaque')
            ->where('seo.json_ld.address.addressCountry', 'PH')
            ->where('seo.json_ld.sameAs.0', 'https://www.facebook.com/Food21CateringDelivery/')
            ->where('seo.json_ld.openingHours.0', 'Mo-Su 08:00-20:00'));
});

test('pages other than home do not expose structured data', function (string $routeName) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('seo.json_ld', null));
})->with(['menu', 'about', 'gallery', 'order', 'contact']);

test('private pages tell crawlers not to index them', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');

    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
});

test('public pages are indexable by default', function () {
    $this->get(route('home'))->assertHeaderMissing('X-Robots-Tag');
});

test('the initial html exposes search metadata without javascript', function () {
    $xpath = seoXPath($this->get(route('home'))->assertOk()->getContent());

    expect($xpath->evaluate('string(//title)'))
        ->toBe('Filipino Catering & Delivery in Parañaque | Food 21')
        ->and($xpath->evaluate('string(//link[@rel="canonical"]/@href)'))
        ->toBe('https://food21services.com/')
        ->and($xpath->evaluate('string(//meta[@name="description"]/@content)'))
        ->toContain('Food 21 Catering Delivery')
        ->and($xpath->evaluate('string(//meta[@property="og:title"]/@content)'))
        ->toBe('Filipino Catering & Delivery in Parañaque | Food 21')
        ->and($xpath->evaluate('string(//meta[@property="og:image"]/@content)'))
        ->toBe('https://food21services.com/images/gallery/buffalo-wings.jpg')
        ->and($xpath->evaluate('string(//meta[@name="twitter:card"]/@content)'))
        ->toBe('summary_large_image');
});

test('the initial html embeds local business structured data on the home page', function () {
    $xpath = seoXPath($this->get(route('home'))->assertOk()->getContent());

    $json = $xpath->evaluate('string(//script[@type="application/ld+json"])');

    expect(json_decode($json, true))->toMatchArray([
        '@context' => 'https://schema.org',
        '@type' => 'FoodEstablishment',
        'name' => 'Food21 Catering Delivery',
        'telephone' => '0920 914 4322',
    ]);
});

test('the initial html exposes the canonical url of each public page', function (string $routeName, string $canonical) {
    $xpath = seoXPath($this->get(route($routeName))->assertOk()->getContent());

    expect($xpath->evaluate('string(//link[@rel="canonical"]/@href)'))->toBe($canonical);
})->with('public page canonicals');
