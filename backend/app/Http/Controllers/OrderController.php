<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function show(Request $request, Order $order): Response
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $order->load([
            'items.product',
            'items.variant',
            'address.wilaya',
            'payments',
        ]);

        return Inertia::render('store/order-confirmation', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'subtotal' => $order->subtotal,
                'shipping' => $order->shipping,
                'discount' => $order->discount,
                'total' => $order->total,
                'notes' => $order->notes,
                'placed_at' => $order->placed_at?->toISOString(),
                'confirmed_at' => $order->confirmed_at?->toISOString(),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'sku' => $item->sku,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'product' => [
                        'id' => $item->product->id,
                        'slug' => $item->product->slug,
                        'image' => $item->product->media->first()?->path ?? null,
                    ],
                ]),
                'address' => [
                    'full_name' => $order->address->full_name,
                    'phone' => $order->address->phone,
                    'line1' => $order->address->line1,
                    'line2' => $order->address->line2,
                    'wilaya_name' => $order->address->wilaya?->name,
                    'city' => $order->address->city,
                ],
            ],
        ]);
    }
}
