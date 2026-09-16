<?php

use Inertia\Testing\AssertableInertia as Assert;

test('the home page renders with featured dishes', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('featuredDishes', 3)
            ->has('site'));
});

test('the menu page renders the menu', function () {
    $this->get(route('menu'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('menu')
            ->has('menu.categories'));
});

test('the about page renders', function () {
    $this->get(route('about'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('about'));
});

test('the gallery page renders images', function () {
    $this->get(route('gallery'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('gallery')
            ->has('gallery'));
});

test('the delivery order page renders', function () {
    $this->get(route('order'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('order'));
});

test('the contact page renders event types', function () {
    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('contact')
            ->has('eventTypes'));
});
