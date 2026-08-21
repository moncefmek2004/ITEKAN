import { Head, Link, router, usePage } from '@inertiajs/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import type {
    Brand,
    CatalogFilters,
    Category,
    PaginatedData,
    Product,
} from '@/types';

type CatalogProps = {
    categories: Category[];
    brands: Brand[];
    products: PaginatedData<Product>;
    filters: CatalogFilters;
};

const SORT_OPTIONS = [
    { value: 'default', label: 'Recommandé' },
    { value: 'newest', label: 'Plus récent' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
] as const;

const PRICE_PRESETS = [
    { label: 'Tous les prix', min: '', max: '' },
    { label: 'Moins de 50 000 DA', min: '', max: '50000' },
    { label: '50 000 – 100 000 DA', min: '50000', max: '100000' },
    { label: '100 000 – 200 000 DA', min: '100000', max: '200000' },
    { label: 'Plus de 200 000 DA', min: '200000', max: '' },
] as const;

function buildUrl(
    base: string,
    params: Record<string, string | null>,
): string {
    const url = new URL(base, window.location.origin);

    for (const [key, value] of Object.entries(params)) {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    }

    return url.pathname + url.search;
}

function ActiveFilters({
    filters,
    categories,
    brands,
}: {
    filters: CatalogFilters;
    categories: Category[];
    brands: Brand[];
}) {
    const tags: { label: string; href: string }[] = [];

    if (filters.category) {
        const cat = categories.find((c) => c.slug === filters.category);
        tags.push({
            label: cat?.name ?? filters.category,
            href: buildUrl('/catalogue', {
                category: null,
                brand: filters.brand,
                sort: filters.sort,
                min_price: filters.min_price,
                max_price: filters.max_price,
                page: null,
            }),
        });
    }

    if (filters.brand) {
        const brand = brands.find((b) => b.slug === filters.brand);
        tags.push({
            label: brand?.name ?? filters.brand,
            href: buildUrl('/catalogue', {
                category: filters.category,
                brand: null,
                sort: filters.sort,
                min_price: filters.min_price,
                max_price: filters.max_price,
                page: null,
            }),
        });
    }

    if (filters.min_price || filters.max_price) {
        const min = filters.min_price
            ? Number(filters.min_price).toLocaleString('fr-DZ')
            : '0';
        const max = filters.max_price
            ? Number(filters.max_price).toLocaleString('fr-DZ')
            : '∞';
        tags.push({
            label: `${min} – ${max} DA`,
            href: buildUrl('/catalogue', {
                category: filters.category,
                brand: filters.brand,
                sort: filters.sort,
                min_price: null,
                max_price: null,
                page: null,
            }),
        });
    }

    if (tags.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <Link
                    key={tag.label}
                    href={tag.href}
                    className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium transition-colors hover:bg-muted/60"
                >
                    {tag.label}
                    <X className="h-3 w-3" />
                </Link>
            ))}
        </div>
    );
}

function FilterSidebar({
    categories,
    brands,
    filters,
}: {
    categories: Category[];
    brands: Brand[];
    filters: CatalogFilters;
}) {
    const [minPrice, setMinPrice] = useState(filters.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? '');

    function applyPriceRange() {
        router.get(
            '/catalogue',
            {
                category: filters.category,
                brand: filters.brand,
                sort: filters.sort,
                min_price: minPrice || null,
                max_price: maxPrice || null,
                page: null,
            },
            { preserveState: true, replace: true },
        );
    }

    const activePreset = PRICE_PRESETS.find(
        (p) =>
            p.min === (filters.min_price ?? '') &&
            p.max === (filters.max_price ?? ''),
    );

    return (
        <aside className="space-y-6">
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Catégories
                </h3>
                <ul className="space-y-0.5">
                    <li>
                        <Link
                            href={buildUrl('/catalogue', {
                                category: null,
                                brand: filters.brand,
                                sort: filters.sort,
                                min_price: filters.min_price,
                                max_price: filters.max_price,
                            })}
                            className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                                !filters.category
                                    ? 'bg-accent font-medium text-accent-foreground'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            Toutes les catégories
                        </Link>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <Link
                                href={buildUrl('/catalogue', {
                                    category: cat.slug,
                                    brand: filters.brand,
                                    sort: filters.sort,
                                    min_price: filters.min_price,
                                    max_price: filters.max_price,
                                })}
                                className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                                    filters.category === cat.slug
                                        ? 'bg-accent font-medium text-accent-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {cat.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <Separator />

            {brands.length > 0 && (
                <>
                    <div>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Marques
                        </h3>
                        <ul className="space-y-0.5">
                            <li>
                                <Link
                                    href={buildUrl('/catalogue', {
                                        category: filters.category,
                                        brand: null,
                                        sort: filters.sort,
                                        min_price: filters.min_price,
                                        max_price: filters.max_price,
                                    })}
                                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                                        !filters.brand
                                            ? 'bg-accent font-medium text-accent-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    Toutes les marques
                                </Link>
                            </li>
                            {brands.map((brand) => (
                                <li key={brand.id}>
                                    <Link
                                        href={buildUrl('/catalogue', {
                                            category: filters.category,
                                            brand: brand.slug,
                                            sort: filters.sort,
                                            min_price: filters.min_price,
                                            max_price: filters.max_price,
                                        })}
                                        className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                                            filters.brand === brand.slug
                                                ? 'bg-accent font-medium text-accent-foreground'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {brand.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Separator />
                </>
            )}

            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Prix
                </h3>
                <ul className="space-y-0.5">
                    {PRICE_PRESETS.map((preset) => (
                        <li key={preset.label}>
                            <Link
                                href={buildUrl('/catalogue', {
                                    category: filters.category,
                                    brand: filters.brand,
                                    sort: filters.sort,
                                    min_price: preset.min || null,
                                    max_price: preset.max || null,
                                    page: null,
                                })}
                                className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                                    activePreset?.label === preset.label
                                        ? 'bg-accent font-medium text-accent-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {preset.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-3 flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-8 text-xs"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-8 text-xs"
                    />
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 shrink-0 px-3"
                        onClick={applyPriceRange}
                    >
                        OK
                    </Button>
                </div>
            </div>
        </aside>
    );
}

function Pagination({
    products,
    filters,
}: {
    products: PaginatedData<Product>;
    filters: CatalogFilters;
}) {
    if (products.last_page <= 1) {
        return null;
    }

    const pages: (number | '...')[] = [];
    const current = products.current_page;
    const last = products.last_page;

    if (last <= 7) {
        for (let i = 1; i <= last; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        if (current > 3) {
            pages.push('...');
        }

        const start = Math.max(2, current - 1);
        const end = Math.min(last - 1, current + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (current < last - 2) {
            pages.push('...');
        }

        pages.push(last);
    }

    function pageUrl(page: number) {
        return buildUrl('/catalogue', {
            category: filters.category,
            brand: filters.brand,
            sort: filters.sort === 'default' ? null : filters.sort,
            min_price: filters.min_price,
            max_price: filters.max_price,
            page: page === 1 ? null : String(page),
        });
    }

    return (
        <nav className="mt-8 flex items-center justify-center gap-1">
            {products.prev_page_url ? (
                <Link
                    href={pageUrl(current - 1)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                    ← Précédent
                </Link>
            ) : (
                <span className="rounded-md px-3 py-2 text-sm text-muted-foreground/40">
                    ← Précédent
                </span>
            )}

            {pages.map((page, i) =>
                page === '...' ? (
                    <span
                        key={`dots-${i}`}
                        className="px-2 py-2 text-sm text-muted-foreground"
                    >
                        …
                    </span>
                ) : (
                    <Link
                        key={page}
                        href={pageUrl(page)}
                        className={`min-w-[36px] rounded-md px-3 py-2 text-center text-sm transition-colors ${
                            page === current
                                ? 'bg-[#DDBBFF] font-semibold text-black'
                                : 'text-muted-foreground hover:bg-accent'
                        }`}
                    >
                        {page}
                    </Link>
                ),
            )}

            {products.next_page_url ? (
                <Link
                    href={pageUrl(current + 1)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
                >
                    Suivant →
                </Link>
            ) : (
                <span className="rounded-md px-3 py-2 text-sm text-muted-foreground/40">
                    Suivant →
                </span>
            )}
        </nav>
    );
}

export default function StoreCatalog() {
    const { categories, brands, products, filters } =
        usePage().props as unknown as CatalogProps;
    const isMobile = useIsMobile();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const sortValue = filters.sort ?? 'default';

    function handleSort(value: string) {
        router.get(
            '/catalogue',
            {
                category: filters.category,
                brand: filters.brand,
                sort: value,
                min_price: filters.min_price,
                max_price: filters.max_price,
                page: null,
            },
            { preserveState: true, replace: true },
        );
    }

    const sidebarContent = (
        <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
        />
    );

    return (
        <>
            <Head title="Catalogue" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {isMobile && (
                    <div className="mb-4 flex items-center gap-2">
                        <Sheet
                            open={mobileFiltersOpen}
                            onOpenChange={setMobileFiltersOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filtres
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-72 overflow-y-auto"
                            >
                                <SheetHeader>
                                    <SheetTitle>Filtres</SheetTitle>
                                </SheetHeader>
                                <div className="mt-4">{sidebarContent}</div>
                            </SheetContent>
                        </Sheet>

                        <Select value={sortValue} onValueChange={handleSort}>
                            <SelectTrigger className="h-9 w-auto flex-1 text-sm">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold sm:text-2xl">
                        Catalogue
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {products.total} résultat
                        {products.total !== 1 ? 's' : ''}
                    </p>
                </div>

                <ActiveFilters
                    filters={filters}
                    categories={categories}
                    brands={brands}
                />

                <div className="mt-6 flex gap-8">
                    {!isMobile && (
                        <div className="hidden w-64 shrink-0 lg:block">
                            {sidebarContent}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        {!isMobile && (
                            <div className="mb-4 flex items-center justify-end">
                                <Select
                                    value={sortValue}
                                    onValueChange={handleSort}
                                >
                                    <SelectTrigger className="h-9 w-[200px] text-sm">
                                        <SelectValue placeholder="Trier par" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SORT_OPTIONS.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {products.data.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 py-20">
                                <p className="text-lg font-medium text-muted-foreground">
                                    Aucun produit trouvé
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground/70">
                                    Essayez de modifier vos filtres
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="mt-4"
                                >
                                    <Link href="/catalogue">
                                        Réinitialiser les filtres
                                    </Link>
                                </Button>
                            </div>
                        )}

                        <Pagination products={products} filters={filters} />
                    </div>
                </div>
            </div>
        </>
    );
}
