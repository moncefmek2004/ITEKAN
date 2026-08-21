<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = ['user_id', 'session_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function getTotal(): float
    {
        return $this->items->sum(function ($item) {
            $price = $item->variant?->price ?? $item->product->price;

            return $price * $item->quantity;
        });
    }

    public function getItemCount(): int
    {
        return $this->items->sum('quantity');
    }
}
