export type Media = {
    id: number;
    mediable_type: string;
    mediable_id: number;
    path: string;
    filename: string;
    mime_type: string;
    size: number;
    alt_text: string | null;
    title: string | null;
    position: number;
};

export type Category = {
    id: number;
    parent_id: number | null;
    name: string;
    name_ar: string;
    slug: string;
    description: string | null;
    image: string | null;
    icon: string | null;
    order: number;
    is_active: boolean;
    children?: Category[];
};

export type Brand = {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
    is_active: boolean;
    order: number;
};

export type Product = {
    id: number;
    category_id: number;
    brand_id: number | null;
    name: string;
    name_ar: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    description_ar: string | null;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
    sku: string | null;
    barcode: string | null;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    weight: number | null;
    dimensions: Record<string, unknown> | null;
    specs: Record<string, unknown>;
    meta_title: string | null;
    meta_description: string | null;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    category?: Category;
    brand?: Brand;
    media?: Media[];
    variants?: ProductVariant[];
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
};

export type CatalogFilters = {
    category: string | null;
    brand: string | null;
    sort: string;
    min_price: string | null;
    max_price: string | null;
};

export type ProductVariant = {
    id: number;
    product_id: number;
    name: string;
    sku: string | null;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
    stock_quantity: number;
    weight: number | null;
    specs: Record<string, unknown>;
    option_values: Record<string, unknown>;
    is_active: boolean;
    position: number;
    media?: Media[];
};
