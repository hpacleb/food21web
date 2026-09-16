<?php

use App\Models\MenuPrice;
use App\Models\User;
use App\Support\Menu;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot manage menu prices', function () {
    $this->get(route('prices.index'))->assertRedirect(route('login'));
});

test('authenticated users can view the price table', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('prices.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prices/index')
            ->has('prices', count(Menu::rows()))
            ->has('groups'));
});

test('price rows are created from the menu config', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('prices.index'))
        ->assertOk();

    expect(MenuPrice::count())->toBe(count(Menu::rows()));
});

test('authenticated users can update a price', function () {
    $price = MenuPrice::create([
        'key' => 'dish:test-dish',
        'label' => 'Test dish',
        'group' => 'Mains',
        'price' => 'From ₱100 / good for 2',
        'sort' => 99,
    ]);

    $this->actingAs(User::factory()->create())
        ->patch(route('prices.update', $price), [
            'price' => 'From ₱150 / good for 2',
        ])
        ->assertRedirect();

    expect($price->refresh()->price)->toBe('From ₱150 / good for 2');
});

test('a price is required when updating', function () {
    $price = MenuPrice::create([
        'key' => 'dish:test-dish',
        'label' => 'Test dish',
        'group' => 'Mains',
        'price' => 'From ₱100 / good for 2',
        'sort' => 99,
    ]);

    $this->actingAs(User::factory()->create())
        ->patch(route('prices.update', $price), ['price' => ''])
        ->assertSessionHasErrors('price');
});

test('updated prices appear on the public menu', function () {
    $dish = config('menu.categories.0.items.0');

    MenuPrice::create([
        'key' => 'dish:'.Str::slug($dish['name']),
        'label' => $dish['name'],
        'group' => 'Mains and Filipino Favorites',
        'price' => 'From ₱999 / good for 2',
        'sort' => 0,
    ]);

    $this->get(route('menu'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('menu.categories.0.items.0.price', 'From ₱999 / good for 2'));
});
