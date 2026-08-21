<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string $name_ar
 * @property string $slug
 * @property string|null $description
 * @property string|null $image
 * @property string|null $icon
 * @property int $order
 * @property bool $is_active
 * @property-read Category|null $parent
 * @property-read Category[] $children
 * @property-read Product[] $products
 */
class Category extends Model
{
    protected $fillable = ['parent_id', 'name', 'name_ar', 'slug', 'description', 'image', 'icon', 'order', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
