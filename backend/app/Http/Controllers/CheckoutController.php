<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Models\Wilaya;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $cart = $user->getOrCreateCart();

        if ($cart->items()->count() === 0) {
            return redirect()->route('cart.show');
        }

        $cart->load([
            'items.product.media',
            'items.variant',
        ]);

        $addresses = $user->addresses()->with('wilaya')->get();
        $wilayas = Wilaya::orderBy('code')->get();

        return Inertia::render('store/checkout', [
            'cart' => [
                'items' => $cart->items->map(function ($item) {
                    $product = $item->product;
                    $variant = $item->variant;
                    $unitPrice = $item->getUnitPrice();

                    return [
                        'id' => $item->id,
                        'product' => [
                            'id' => $product->id,
                            'name' => $product->name,
                            'slug' => $product->slug,
                            'image' => $product->media->first()?->path ?? null,
                        ],
                        'variant' => $variant ? [
                            'id' => $variant->id,
                            'name' => $variant->name,
                        ] : null,
                        'unit_price' => $unitPrice,
                        'quantity' => $item->quantity,
                        'total_price' => $item->getTotalPrice(),
                    ];
                }),
                'total' => $cart->getTotal(),
                'item_count' => $cart->getItemCount(),
            ],
            'addresses' => $addresses->map(fn ($addr) => [
                'id' => $addr->id,
                'label' => $addr->label,
                'full_name' => $addr->full_name,
                'phone' => $addr->phone,
                'line1' => $addr->line1,
                'line2' => $addr->line2,
                'wilaya_code' => $addr->wilaya_code,
                'wilaya_name' => $addr->wilaya?->name,
                'city' => $addr->city,
                'postal_code' => $addr->postal_code,
                'is_default' => $addr->is_default,
            ]),
            'wilayas' => $wilayas->map(fn ($w) => [
                'code' => $w->code,
                'name' => $w->name,
            ]),
            'shipping_cost' => 600,
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse
    {
        $service = app(CheckoutService::class);
        $order = $service->execute($request->user(), $request->validated());

        return redirect()->route('order.show', $order->id)
            ->with('success', 'Commande confirmée !');
    }
}
