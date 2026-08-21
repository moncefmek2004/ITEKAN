<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function show(Request $request): Response
    {
        $cart = $request->user()->getOrCreateCart();

        $cart->load([
            'items.product.media',
            'items.product.category',
            'items.variant',
        ]);

        return Inertia::render('store/cart', [
            'cart' => [
                'items' => $cart->items->map(function (CartItem $item) {
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
                        'stock_quantity' => $variant ? $variant->stock_quantity : $product->stock_quantity,
                        'is_active' => $product->is_active && ($variant ? $variant->is_active : true),
                    ];
                }),
                'total' => $cart->getTotal(),
                'item_count' => $cart->getItemCount(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (! $product->is_active) {
            return back()->withErrors(['product_id' => 'Ce produit n\'est plus disponible.']);
        }

        $variant = null;
        if (! empty($validated['variant_id'])) {
            $variant = ProductVariant::findOrFail($validated['variant_id']);

            if (! $variant->is_active || $variant->product_id !== $product->id) {
                return back()->withErrors(['variant_id' => 'Cette variante n\'est plus disponible.']);
            }
        }

        $availableStock = $variant
            ? $variant->stock_quantity
            : ($product->track_inventory ? $product->stock_quantity : PHP_INT_MAX);

        if ($validated['quantity'] > $availableStock) {
            return back()->withErrors(['quantity' => 'Stock insuffisant.']);
        }

        DB::transaction(function () use ($request, $validated) {
            $cart = $request->user()->getOrCreateCart();

            $existingItem = $cart->items()
                ->where('product_id', $validated['product_id'])
                ->where('variant_id', $validated['variant_id'] ?? null)
                ->first();

            if ($existingItem) {
                $newQuantity = $existingItem->quantity + $validated['quantity'];

                $product = $existingItem->product;
                $variant = $existingItem->variant;
                $availableStock = $variant
                    ? $variant->stock_quantity
                    : ($product->track_inventory ? $product->stock_quantity : PHP_INT_MAX);

                if ($newQuantity > $availableStock) {
                    return back()->withErrors(['quantity' => 'Stock insuffisant.']);
                }

                $existingItem->update(['quantity' => $newQuantity]);
            } else {
                $cart->items()->create([
                    'product_id' => $validated['product_id'],
                    'variant_id' => $validated['variant_id'] ?? null,
                    'quantity' => $validated['quantity'],
                ]);
            }
        });

        return back()->with('success', 'Produit ajouté au panier.');
    }

    public function update(Request $request, CartItem $item): RedirectResponse
    {
        $cart = $request->user()->getOrCreateCart();

        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = $item->product;
        $variant = $item->variant;
        $availableStock = $variant
            ? $variant->stock_quantity
            : ($product->track_inventory ? $product->stock_quantity : PHP_INT_MAX);

        if ($validated['quantity'] > $availableStock) {
            return back()->withErrors(['quantity' => 'Stock insuffisant.']);
        }

        $item->update(['quantity' => $validated['quantity']]);

        return back()->with('success', 'Panier mis à jour.');
    }

    public function destroy(Request $request, CartItem $item): RedirectResponse
    {
        $cart = $request->user()->getOrCreateCart();

        if ($item->cart_id !== $cart->id) {
            abort(403);
        }

        $item->delete();

        return back()->with('success', 'Produit retiré du panier.');
    }

    public function clear(Request $request): RedirectResponse
    {
        $cart = $request->user()->getOrCreateCart();
        $cart->items()->delete();

        return back()->with('success', 'Panier vidé.');
    }
}
