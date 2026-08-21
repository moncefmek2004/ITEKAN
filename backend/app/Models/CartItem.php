<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'product_id', 'variant_id', 'quantity', 'specs'];

    protected function casts(): array
    {
        return [
            'specs' => 'array',
        ];
    }

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function getUnitPrice(): float
    {
        if ($this->variant && $this->variant->price) {
            return $this->variant->price;
        }

        return $this->product->price;
    }

    public function getTotalPrice(): float
    {
        return $this->getUnitPrice() * $this->quantity;
    }
}
