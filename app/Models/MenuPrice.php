<?php

namespace App\Models;

use App\Support\Menu;
use Illuminate\Database\Eloquent\Model;

class MenuPrice extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'label',
        'group',
        'price',
        'sort',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort' => 'integer',
        ];
    }

    public static function syncFromConfig(): void
    {
        foreach (Menu::rows() as $row) {
            static::firstOrCreate(['key' => $row['key']], $row);
        }
    }
}
