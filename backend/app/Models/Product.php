<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string $name_ar
 * @property string $slug
 * @property string|null $short_description
 * @property string|null $description
 * @property string|null $description_ar
 * @property float $price
 * @property float|null $compare_price
 * @property float|null $cost_price
 * @property string|null $sku
 * @property string|null $barcode
 * @property int $stock_quantity
 * @property int $low_stock_threshold
 * @property bool $track_inventory
 * @property float|null $weight
 * @property array|null $dimensions
 * @property array $specs
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property bool $is_active
 * @property bool $is_featured
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read Brand|null $brand
 * @property-read ProductVariant[] $variants
 * @property-read Media[] $media
 */
class Product extends Model
{
    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'name_ar',
        'slug',
        'short_description',
        'description',
        'description_ar',
        'price',
        'compare_price',
        'cost_price',
        'sku',
        'barcode',
        'stock_quantity',
        'low_stock_threshold',
        'track_inventory',
        'weight',
        'dimensions',
        'specs',
        'meta_title',
        'meta_description',
        'is_active',
        'is_featured',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function getEffectiveStock(): int
    {
        if ($this->variants()->exists()) {
            return $this->variants->sum('stock_quantity');
        }

        return $this->track_inventory ? $this->stock_quantity : PHP_INT_MAX;
    }

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'compare_price' => 'float',
            'cost_price' => 'float',
            'weight' => 'float',
            'dimensions' => 'array',
            'specs' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'track_inventory' => 'boolean',
        ];
    }
}
