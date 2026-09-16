<?php

namespace Database\Seeders;

use App\Models\MenuPrice;
use App\Support\Menu;
use Illuminate\Database\Seeder;

class MenuPriceSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Menu::rows() as $row) {
            MenuPrice::firstOrCreate(['key' => $row['key']], $row);
        }
    }
}
