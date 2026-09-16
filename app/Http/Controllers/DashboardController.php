<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'new' => Inquiry::where('status', 'new')->count(),
                'upcoming' => Inquiry::whereNotNull('event_date')
                    ->whereDate('event_date', '>=', today())
                    ->count(),
                'total' => Inquiry::count(),
            ],
            'recentInquiries' => Inquiry::latest()->limit(5)->get(),
        ]);
    }
}
