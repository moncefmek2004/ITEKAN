<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function home(): Response
    {
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->with('children')
            ->get();

        $featuredProducts = Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with(['category', 'brand', 'media'])
            ->limit(8)
            ->get();

        return Inertia::render('store/home', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
        ]);
    }

    public function catalog(Request $request): Response
    {
        $categorySlug = $request->query('category');
        $sort = $request->query('sort', 'default');
        $brandSlug = $request->query('brand');
        $minPrice = $request->query('min_price');
        $maxPrice = $request->query('max_price');

        $products = Product::query()
            ->where('is_active', true)
            ->when($categorySlug, fn ($q) => $q->whereHas('category', fn ($cq) => $cq->where('slug', $categorySlug)))
            ->when($brandSlug, fn ($q) => $q->whereHas('brand', fn ($bq) => $bq->where('slug', $brandSlug)))
            ->when($minPrice !== null && is_numeric($minPrice), fn ($q) => $q->where('price', '>=', $minPrice))
            ->when($maxPrice !== null && is_numeric($maxPrice), fn ($q) => $q->where('price', '<=', $maxPrice))
            ->when($sort === 'price_asc', fn ($q) => $q->orderBy('price'))
            ->when($sort === 'price_desc', fn ($q) => $q->orderByDesc('price'))
            ->when($sort === 'newest', fn ($q) => $q->orderByDesc('created_at'))
            ->when(! in_array($sort, ['price_asc', 'price_desc', 'newest']), fn ($q) => $q->orderBy('name'))
            ->with(['category', 'brand', 'media'])
            ->paginate(24)
            ->withQueryString();

        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        $activeCategory = $categories->firstWhere('slug', $categorySlug);
        $childCategories = $activeCategory
            ? $categories->filter(fn ($c) => $c->id === $activeCategory->id || $c->parent_id === $activeCategory->id)
            : $categories;

        $availableBrandSlugs = $products->getCollection()
            ->pluck('brand')
            ->filter()
            ->pluck('slug')
            ->unique()
            ->values();

        $brands = Brand::where('is_active', true)
            ->whereIn('slug', $availableBrandSlugs)
            ->orderBy('order')
            ->get();

        return Inertia::render('store/catalog', [
            'categories' => $childCategories->values(),
            'brands' => $brands,
            'products' => $products,
            'filters' => [
                'category' => $categorySlug,
                'brand' => $brandSlug,
                'sort' => $sort,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load(['category', 'brand', 'variants', 'media']);

        $relatedProducts = Product::query()
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->with(['category', 'brand', 'media'])
            ->limit(4)
            ->get();

        return Inertia::render('store/product-show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
