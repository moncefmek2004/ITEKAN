<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'name',
        'sku',
        'price',
        'quantity',
        'specs',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'total' => 'float',
            'specs' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public static function fromCartItem(CartItem $item): self
    {
        $variant = $item->variant;
        $product = $item->product;

        return new static([
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'name' => $product->name,
            'sku' => $variant?->sku ?? $product->sku,
            'price' => $variant?->price ?? $product->price,
            'quantity' => $item->quantity,
            'specs' => $item->specs,
            'total' => ($variant?->price ?? $product->price) * $item->quantity,
        ]);
    }
}
