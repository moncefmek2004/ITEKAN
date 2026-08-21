<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StoreController::class, 'home'])->name('home');
Route::get('/catalogue', [StoreController::class, 'catalog'])->name('catalog');
Route::get('/produits/{product:slug}', [StoreController::class, 'show'])->name('product.show');

Route::post('/locale', [LocaleController::class, 'switch'])->name('locale.switch');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('/panier', [CartController::class, 'show'])->name('cart.show');
    Route::post('/panier', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/panier/{item}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/panier/{item}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('/panier', [CartController::class, 'clear'])->name('cart.clear');

    Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout.show');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    Route::get('/commande/{order}', [OrderController::class, 'show'])->name('order.show');
});

require __DIR__.'/settings.php';
