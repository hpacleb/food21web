<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PriceController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/menu', [PageController::class, 'menu'])->name('menu');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/gallery', [PageController::class, 'gallery'])->name('gallery');
Route::get('/order', [PageController::class, 'order'])->name('order');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::post('/contact', [InquiryController::class, 'store'])->name('inquiries.store');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('dashboard/inquiries', [InquiryController::class, 'index'])->name('inquiries.index');
    Route::patch('dashboard/inquiries/{inquiry}/status', [InquiryController::class, 'status'])->name('inquiries.status');
    Route::delete('dashboard/inquiries/{inquiry}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');
    Route::get('dashboard/prices', [PriceController::class, 'index'])->name('prices.index');
    Route::patch('dashboard/prices/{menuPrice}', [PriceController::class, 'update'])->name('prices.update');
});

require __DIR__.'/settings.php';
