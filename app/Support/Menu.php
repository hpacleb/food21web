<?php

namespace App\Support;

use App\Models\MenuPrice;
use Illuminate\Support\Str;

class Menu
{
    /**
     * The editable price rows derived from the menu config.
     *
     * @return list<array{key: string, label: string, group: string, price: string, sort: int}>
     */
    public static function rows(): array
    {
        $rows = [];
        $sort = 0;

        foreach (config('menu.categories', []) as $category) {
            foreach ($category['items'] as $item) {
                $rows[] = [
                    'key' => 'dish:'.Str::slug($item['name']),
                    'label' => $item['name'],
                    'group' => $category['name'],
                    'price' => $item['price'],
                    'sort' => $sort++,
                ];
            }
        }

        return $rows;
    }

    /**
     * @return array<string, string>
     */
    public static function overrides(): array
    {
        return MenuPrice::query()->pluck('price', 'key')->all();
    }

    /**
     * The menu config with any saved price overrides applied.
     *
     * @return array<string, mixed>
     */
    public static function menu(): array
    {
        $menu = config('menu');
        $overrides = self::overrides();

        foreach ($menu['categories'] as $categoryIndex => $category) {
            foreach ($category['items'] as $itemIndex => $item) {
                $key = 'dish:'.Str::slug($item['name']);
                $menu['categories'][$categoryIndex]['items'][$itemIndex]['price'] = $overrides[$key] ?? $item['price'];
            }
        }

        return $menu;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function featuredDishes(int $limit = 3): array
    {
        $items = config('menu.categories.0.items', []);

        if (! is_array($items)) {
            return [];
        }

        $overrides = self::overrides();
        $dishes = [];

        foreach ($items as $item) {
            if (! is_array($item) || ! is_string($item['name'] ?? null)) {
                continue;
            }

            $dishes[] = [
                'name' => $item['name'],
                'description' => is_string($item['description'] ?? null) ? $item['description'] : '',
                'price' => $overrides['dish:'.Str::slug($item['name'])] ?? ($item['price'] ?? ''),
            ];
        }

        return array_slice($dishes, 0, $limit);
    }
}
