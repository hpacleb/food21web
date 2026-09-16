<?php

namespace App\Http\Controllers;

use App\Support\Menu;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('home', [
            'featuredDishes' => Menu::featuredDishes(),
        ]);
    }

    public function menu(): Response
    {
        return Inertia::render('menu', [
            'menu' => Menu::menu(),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('about');
    }

    public function gallery(): Response
    {
        return Inertia::render('gallery', [
            'gallery' => config('site.gallery'),
        ]);
    }

    public function order(): Response
    {
        return Inertia::render('order');
    }

    public function contact(): Response
    {
        return Inertia::render('contact', [
            'eventTypes' => config('site.event_types'),
        ]);
    }
}
