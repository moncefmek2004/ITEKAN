<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'address_id',
        'order_number',
        'order_status',
        'payment_status',
        'subtotal',
        'discount',
        'shipping',
        'tax',
        'total',
        'payment_method',
        'currency',
        'notes',
        'admin_notes',
        'placed_at',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'cancelled_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'discount' => 'float',
            'shipping' => 'float',
            'tax' => 'float',
            'total' => 'float',
            'placed_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = static::where('order_number', 'like', "ITK-{$date}-%")
            ->orderByDesc('order_number')
            ->first();

        if ($lastOrder) {
            $sequence = (int) substr($lastOrder->order_number, -4) + 1;
        } else {
            $sequence = 1;
        }

        return sprintf('ITK-%s-%04d', $date, $sequence);
    }

    public static function boot(): void
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
            if (is_null($order->placed_at)) {
                $order->placed_at = now();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    private const VALID_TRANSITIONS = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function transitionTo(string $status): void
    {
        if (! in_array($status, self::VALID_TRANSITIONS[$this->order_status] ?? [])) {
            return;
        }

        match ($status) {
            'confirmed' => $this->confirm(),
            'shipped' => $this->ship(),
            'delivered' => $this->deliver(),
            'cancelled' => $this->cancel(),
        };
    }

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, self::VALID_TRANSITIONS[$this->order_status] ?? []);
    }

    public function confirm(): void
    {
        if ($this->order_status !== 'pending') {
            return;
        }

        $this->update(['order_status' => 'confirmed', 'confirmed_at' => now()]);
        $this->decrementStock();
    }

    public function ship(): void
    {
        if ($this->order_status !== 'confirmed') {
            return;
        }

        $this->update(['order_status' => 'shipped', 'shipped_at' => now()]);
    }

    public function deliver(): void
    {
        if ($this->order_status !== 'shipped') {
            return;
        }

        $this->update([
            'order_status' => 'delivered',
            'delivered_at' => now(),
            'payment_status' => 'paid',
        ]);

        $this->payments()->where('status', 'pending')->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    public function cancel(?string $reason = null): void
    {
        if ($this->order_status === 'delivered' || $this->order_status === 'cancelled') {
            return;
        }

        $wasConfirmed = in_array($this->order_status, ['confirmed', 'shipped']);

        $this->update([
            'order_status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_reason' => $reason,
            'payment_status' => $this->payment_status === 'paid' ? 'refunded' : 'cancelled',
        ]);

        if ($wasConfirmed) {
            $this->restoreStock();
        }
    }

    private function decrementStock(): void
    {
        foreach ($this->items as $item) {
            if ($item->variant_id) {
                $item->variant->decrement('stock_quantity', $item->quantity);
            } elseif ($item->product->track_inventory) {
                $item->product->decrement('stock_quantity', $item->quantity);
            }
        }
    }

    private function restoreStock(): void
    {
        foreach ($this->items as $item) {
            if ($item->variant_id) {
                $item->variant->increment('stock_quantity', $item->quantity);
            } elseif ($item->product->track_inventory) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }
    }
}
