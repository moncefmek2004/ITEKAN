<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'price',
        'compare_price',
        'cost_price',
        'stock_quantity',
        'weight',
        'specs',
        'option_values',
        'is_active',
        'position',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'compare_price' => 'float',
            'cost_price' => 'float',
            'weight' => 'float',
            'specs' => 'array',
            'option_values' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
