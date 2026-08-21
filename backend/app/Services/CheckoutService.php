<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    private const SHIPPING_COST = 600;

    public function execute(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $cart = $user->cart()->with(['items.product', 'items.variant'])->first();

            if (! $cart || $cart->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Votre panier est vide.',
                ]);
            }

            $address = $this->resolveAddress($user, $data);

            [$orderItems, $subtotal] = $this->buildOrderItems($cart);

            $shipping = self::SHIPPING_COST;
            $total = $subtotal + $shipping;

            $order = $user->orders()->create([
                'address_id' => $address->id,
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => 'cod',
                'currency' => 'DZD',
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'discount' => 0,
                'tax' => 0,
                'notes' => $data['notes'] ?? null,
            ]);

            $order->items()->saveMany($orderItems);

            $order->payments()->create([
                'method' => 'cod',
                'status' => 'pending',
                'amount' => $total,
            ]);

            $order->confirm();

            $cart->items()->delete();

            return $order->load(['items.product', 'items.variant', 'address.wilaya', 'payments']);
        });
    }

    private function resolveAddress(User $user, array $data): Address
    {
        if (! empty($data['address_id'])) {
            $address = $user->addresses()->find($data['address_id']);

            if (! $address) {
                throw ValidationException::withMessages([
                    'address_id' => 'Cette adresse ne vous appartient pas.',
                ]);
            }

            return $address;
        }

        return $user->addresses()->create([
            'full_name' => $data['full_name'],
            'phone' => $data['phone'],
            'line1' => $data['line1'],
            'line2' => $data['line2'] ?? null,
            'wilaya_code' => $data['wilaya_code'],
            'city' => $data['city'],
            'postal_code' => $data['postal_code'] ?? null,
        ]);
    }

    private function buildOrderItems(Cart $cart): array
    {
        $items = [];
        $subtotal = 0.0;

        foreach ($cart->items as $item) {
            $product = $item->product;
            $variant = $item->variant;

            if (! $product->is_active) {
                throw ValidationException::withMessages([
                    'product' => "\"{$product->name}\" n'est plus disponible.",
                ]);
            }

            if ($variant && ! $variant->is_active) {
                throw ValidationException::withMessages([
                    'variant' => "La variante \"{$variant->name}\" n'est plus disponible.",
                ]);
            }

            $availableStock = $variant
                ? $variant->stock_quantity
                : ($product->track_inventory ? $product->stock_quantity : PHP_INT_MAX);

            if ($item->quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'stock' => "Stock insuffisant pour \"{$product->name}\".",
                ]);
            }

            $unitPrice = $variant?->price ?? $product->price;
            $itemTotal = $unitPrice * $item->quantity;

            $items[] = new OrderItem([
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'name' => $product->name,
                'sku' => $variant?->sku ?? $product->sku,
                'price' => $unitPrice,
                'quantity' => $item->quantity,
                'specs' => $item->specs ?? [],
                'total' => $itemTotal,
            ]);

            $subtotal += $itemTotal;
        }

        return [$items, $subtotal];
    }
}
