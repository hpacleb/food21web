<?php

namespace App\Http\Controllers;

use App\Models\MenuPrice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PriceController extends Controller
{
    public function index(): Response
    {
        MenuPrice::syncFromConfig();

        $prices = MenuPrice::query()->orderBy('sort')->get();

        return Inertia::render('prices/index', [
            'prices' => $prices,
            'groups' => $prices->pluck('group')->unique()->values(),
        ]);
    }

    public function update(Request $request, MenuPrice $menuPrice): RedirectResponse
    {
        $validated = $request->validate([
            'price' => ['required', 'string', 'max:60'],
        ]);

        $menuPrice->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __(':label price updated.', ['label' => $menuPrice->label]),
        ]);

        return back();
    }
}
