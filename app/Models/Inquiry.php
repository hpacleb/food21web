<?php

namespace App\Models;

use Database\Factories\InquiryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    /** @use HasFactory<InquiryFactory> */
    use HasFactory;

    public const STATUSES = ['new', 'contacted', 'booked', 'closed'];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'event_type',
        'event_date',
        'guests',
        'message',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'guests' => 'integer',
        ];
    }
}
