import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronRight, Minus, Package, Plus, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import ProductCard from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Product, ProductVariant } from '@/types';

type ProductShowProps = {
    product: Product;
    relatedProducts: Product[];
};

const SPEC_LABELS: Record<string, Record<string, string>> = {
    claviers: {
        switch_type: 'Type de switch',
        switch_color: 'Couleur du switch',
        layout: 'Layout',
        backlight: 'Rétroéclairage',
        backlight_type: 'Type de rétroéclairage',
        connectivity: 'Connexion',
        key_count: 'Nombre de touches',
        material: 'Matériau',
        dimensions: 'Dimensions',
    },
    souris: {
        dpi: 'DPI',
        sensor: 'Capteur',
        weight_g: 'Poids',
        connectivity: 'Connexion',
        buttons: 'Boutons',
        side_buttons: 'Boutons latéraux',
        rgb: 'RGB',
        material: 'Matériau',
        cable_length: 'Longueur du câble',
    },
    casques: {
        driver_size: 'Taille des drivers',
        frequency_response: 'Réponse fréquentielle',
        impedance: 'Impédance',
        surround: 'Son surround',
        microphone: 'Microphone',
        mic_type: 'Type de micro',
        connectivity: 'Connexion',
        noise_cancelling: 'Réduction de bruit',
        weight_g: 'Poids',
        battery_life: 'Autonomie',
        rgb: 'RGB',
    },
    combos: {
        items: 'Contenu',
        keyboard_type: 'Type de clavier',
        mouse_sensor: 'Capteur souris',
        mouse_dpi: 'DPI souris',
        connectivity: 'Connexion',
        rgb: 'RGB',
        includes_mousepad: 'Tapis inclus',
    },
    'micro-webcam': {
        type: 'Type',
        connection: 'Connexion',
        pattern: 'Pattern',
        sample_rate: "Taux d'échantillonnage",
        bit_depth: 'Profondeur de bits',
        resolution: 'Résolution',
        fps: 'FPS',
        fov: 'Champ de vision',
        autofocus: 'Autofocus',
        low_light: 'Basse luminosité',
        noise_cancelling: 'Réduction de bruit',
        built_in_mic: 'Micro intégré',
        tripod_mount: 'Support trépied',
    },
    'deco-gaming': {
        type: 'Type',
        power: 'Puissance',
        voltage: 'Voltage',
        color: 'Couleur',
        rgb: 'RGB',
        length: 'Longueur',
        material: 'Matériau',
        compatibility: 'Compatibilité',
    },
    manettes: {
        connectivity: 'Connexion',
        compatibility: 'Compatibilité',
        vibration: 'Vibration',
        gyroscope: 'Gyroscope',
        battery_life: 'Autonomie',
        analog_triggers: 'Gâchettes analogiques',
        paddles: 'Palettes',
        color: 'Couleur',
    },
    'tapis-de-souris': {
        dimensions: 'Dimensions',
        surface: 'Surface',
        base: 'Base',
        thickness: 'Épaisseur',
        edge_stitching: 'Surpiqûre',
        rgb: 'RGB',
        rgb_zones: 'Zones RGB',
    },
    moniteurs: {
        screen_size: "Taille d'écran",
        resolution: 'Résolution',
        panel: 'Type de panneau',
        refresh_rate: 'Taux de rafraîchissement',
        response_time: 'Temps de réponse',
        hdr: 'HDR',
        ports: 'Ports',
        freesync: 'FreeSync',
        gsync: 'G-Sync',
        curved: 'Écran incurvé',
        height_adjustable: 'Réglage en hauteur',
    },
    laptops: {
        cpu: 'Processeur',
        cpu_gen: 'Génération',
        ram: 'RAM',
        ram_type: 'Type de RAM',
        storage: 'Stockage',
        storage_type: 'Type de stockage',
        gpu: 'Carte graphique',
        gpu_vram: 'VRAM',
        screen_size: "Taille d'écran",
        resolution: 'Résolution',
        refresh_rate: 'Taux de rafraîchissement',
        battery: 'Batterie',
        battery_wh: 'Capacité batterie',
        os: 'Système',
        weight_kg: 'Poids',
        ports: 'Ports',
        keyboard_backlight: 'Rétroéclairage clavier',
    },
    desktops: {
        cpu: 'Processeur',
        ram: 'RAM',
        ram_type: 'Type de RAM',
        storage: 'Stockage',
        gpu: 'Carte graphique',
        psu: 'Alimentation',
        case_type: 'Format boîtier',
        os: 'Système',
        wifi: 'WiFi',
        bluetooth: 'Bluetooth',
    },
    composants: {
        type: 'Type',
        socket: 'Socket',
        chipset: 'Chipset',
        form_factor: 'Format',
        capacity: 'Capacité',
        speed: 'Vitesse',
        tdp: 'TDP',
        wattage: 'Puissance',
        modular: 'Modulaire',
        certification: 'Certification',
        fan_size: 'Taille ventilateur',
        aio: 'AIO',
    },
    reseau: {
        type: 'Type',
        wifi_standard: 'Standard WiFi',
        ports: 'Ports',
        speed: 'Vitesse',
        poe: 'PoE',
        range: 'Portée',
    },
    accessoires: {
        type: 'Type',
        compatibility: 'Compatibilité',
        material: 'Matériau',
        color: 'Couleur',
    },
};

function formatPrice(price: number): string {
    return (
        new Intl.NumberFormat('fr-DZ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price) + ' DA'
    );
}

function getStockInfo(quantity: number): {
    text: string;
    variant: 'default' | 'secondary' | 'destructive';
    available: boolean;
} {
    if (quantity <= 0) {
        return { text: 'Épuisé', variant: 'destructive', available: false };
    }

    if (quantity <= 5) {
        return {
            text: `Dernières pièces (${quantity})`,
            variant: 'destructive',
            available: true,
        };
    }

    if (quantity <= 10) {
        return {
            text: `Stock limité (${quantity})`,
            variant: 'secondary',
            available: true,
        };
    }

    return { text: 'En stock', variant: 'default', available: true };
}

function resolveSpecValue(
    value: unknown,
    key: string,
): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? 'Oui' : 'Non';
    }

    if (key === 'dpi' || key === 'mouse_dpi' || key === 'key_count' || key === 'buttons' || key === 'side_buttons' || key === 'rgb_zones' || key === 'fps') {
        return Number(value).toLocaleString('fr-FR');
    }

    return String(value);
}

function ImageGallery({
    media,
    name,
}: {
    media: Product['media'];
    name: string;
}) {
    const images = media ?? [];
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-xl border border-border/40 bg-muted/20">
                <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
        );
    }

    const activeImage = images[activeIndex];

    return (
        <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border/40 bg-muted/20">
                <img
                    src={activeImage.path}
                    alt={activeImage.alt_text ?? name}
                    className="h-full w-full object-contain"
                />
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                                index === activeIndex
                                    ? 'border-[#DDBBFF]'
                                    : 'border-border/40 hover:border-border'
                            }`}
                        >
                            <img
                                src={image.path}
                                alt={image.alt_text ?? name}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function VariantSelector({
    variants,
    selectedVariant,
    onSelect,
}: {
    variants: ProductVariant[];
    selectedVariant: ProductVariant | null;
    onSelect: (variant: ProductVariant) => void;
}) {
    const optionGroups = useMemo(() => {
        const groups: Record<string, { value: string; variant: ProductVariant }[]> = {};

        for (const variant of variants) {
            const opts = variant.option_values as Record<string, string>;

            for (const [optionKey, optionValue] of Object.entries(opts)) {
                if (!groups[optionKey]) {
                    groups[optionKey] = [];
                }

                groups[optionKey].push({
                    value: String(optionValue),
                    variant,
                });
            }
        }

        return groups;
    }, [variants]);

    if (Object.keys(optionGroups).length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {Object.entries(optionGroups).map(([optionKey, options]) => (
                <div key={optionKey}>
                    <p className="mb-2 text-sm font-medium capitalize">
                        {optionKey.replace(/_/g, ' ')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {options.map((opt) => {
                            const isSelected =
                                selectedVariant?.id === opt.variant.id;

                            return (
                                <button
                                    key={opt.variant.id}
                                    type="button"
                                    onClick={() => onSelect(opt.variant)}
                                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                        isSelected
                                            ? 'border-[#DDBBFF] bg-[#DDBBFF]/10 text-[#DDBBFF]'
                                            : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                                    }`}
                                >
                                    {opt.value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function SpecsTable({
    specs,
    categorySlug,
}: {
    specs: Record<string, unknown>;
    categorySlug: string;
}) {
    const labels = SPEC_LABELS[categorySlug] ?? {};

    const entries = Object.entries(specs).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
    );

    if (entries.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border border-border/40 bg-muted/20">
            {entries.map(([key, value], index) => (
                <div
                    key={key}
                    className={`flex items-center justify-between px-5 py-3 ${
                        index !== entries.length - 1 ? 'border-b border-border/30' : ''
                    }`}
                >
                    <span className="text-sm text-muted-foreground">
                        {labels[key] ?? key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium">
                        {resolveSpecValue(value, key)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function ProductShow() {
    const { product, relatedProducts } =
        usePage().props as unknown as ProductShowProps;

    const hasVariants = (product.variants?.length ?? 0) > 0;
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const effectivePrice = selectedVariant?.price ?? product.price;
    const effectiveComparePrice =
        selectedVariant?.compare_price ?? product.compare_price;
    const effectiveStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
    const effectiveSku = selectedVariant?.sku ?? product.sku;

    const hasDiscount =
        effectiveComparePrice !== null && effectiveComparePrice > effectivePrice;
    const discountPercent = hasDiscount
        ? Math.round(
              ((effectiveComparePrice! - effectivePrice) /
                  effectiveComparePrice!) *
                  100,
          )
        : 0;

    const stock = getStockInfo(effectiveStock);

    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    function incrementQuantity() {
        setQuantity((q) => Math.min(q + 1, effectiveStock));
    }

    function decrementQuantity() {
        setQuantity((q) => Math.max(1, q - 1));
    }

    function addToCart() {
        setAddingToCart(true);
        router.post(
            '/panier',
            {
                product_id: product.id,
                variant_id: selectedVariant?.id ?? null,
                quantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Produit ajouté au panier.', {
                        action: {
                            label: 'Voir le panier',
                            onClick: () => router.visit('/panier'),
                        },
                    });
                },
                onError: (errors) => {
                    const msg = errors.quantity ?? errors.product_id ?? errors.variant_id;
                    toast.error(msg ?? 'Impossible d\'ajouter ce produit au panier.');
                },
                onFinish: () => setAddingToCart(false),
            },
        );
    }

    const categorySlug = product.category?.slug ?? '';

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Link href="/" className="transition-colors hover:text-foreground">
                        Accueil
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link
                        href="/catalogue"
                        className="transition-colors hover:text-foreground"
                    >
                        Catalogue
                    </Link>
                    {product.category && (
                        <>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <Link
                                href={`/catalogue?category=${product.category.slug}`}
                                className="transition-colors hover:text-foreground"
                            >
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="truncate text-foreground">{product.name}</span>
                </nav>

                {/* ── Product main section ────────────────── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Left — Gallery */}
                    <ImageGallery media={product.media} name={product.name} />

                    {/* Right — Info */}
                    <div className="flex flex-col gap-5">
                        {product.brand && (
                            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                {product.brand.name}
                            </p>
                        )}

                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {product.name}
                        </h1>

                        {product.short_description && (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {product.short_description}
                            </p>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-foreground">
                                {formatPrice(effectivePrice)}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-lg text-muted-foreground line-through">
                                        {formatPrice(effectiveComparePrice!)}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                        -{discountPercent}%
                                    </Badge>
                                </>
                            )}
                        </div>

                        {/* Stock */}
                        <Badge variant={stock.variant} className="w-fit">
                            {stock.text}
                        </Badge>

                        {/* SKU */}
                        {effectiveSku && (
                            <p className="text-xs text-muted-foreground">
                                SKU: {effectiveSku}
                            </p>
                        )}

                        <Separator className="bg-border/40" />

                        {/* Variants */}
                        {hasVariants && product.variants && (
                            <>
                                <VariantSelector
                                    variants={product.variants.filter(
                                        (v) => v.is_active,
                                    )}
                                    selectedVariant={selectedVariant}
                                    onSelect={setSelectedVariant}
                                />
                                <Separator className="bg-border/40" />
                            </>
                        )}

                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-lg border border-border/50">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                    className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    disabled={quantity >= effectiveStock}
                                    className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <Button
                                className="flex-1 bg-[#DDBBFF] text-black hover:bg-[#c9a5f0]"
                                disabled={!stock.available || addingToCart}
                                size="lg"
                                onClick={addToCart}
                            >
                                {addingToCart ? 'Ajout...' : 'Ajouter au panier'}
                            </Button>
                        </div>

                        {/* Delivery info */}
                        <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                            <Truck className="h-4 w-4 shrink-0 text-[#00EE99]" />
                            <span className="text-sm text-muted-foreground">
                                Livraison dans les 58 wilayas — Paiement à la
                                livraison
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Tabs: Description / Specs ────────────── */}
                <div className="mt-12 space-y-8">
                    {/* Description */}
                    {product.description && (
                        <section>
                            <h2 className="mb-4 text-lg font-bold">
                                Description
                            </h2>
                            <div className="rounded-xl border border-border/40 bg-muted/20 px-6 py-5 text-sm leading-relaxed text-muted-foreground">
                                {product.description}
                            </div>
                        </section>
                    )}

                    {/* Specs */}
                    {Object.keys(product.specs).length > 0 && (
                        <section>
                            <h2 className="mb-4 text-lg font-bold">
                                Caractéristiques
                            </h2>
                            <SpecsTable
                                specs={product.specs}
                                categorySlug={categorySlug}
                            />
                        </section>
                    )}
                </div>

                {/* ── Related products ─────────────────────── */}
                {relatedProducts.length > 0 && (
                    <section className="mt-12">
                        <h2 className="mb-6 text-lg font-bold">
                            Produits similaires
                        </h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                            {relatedProducts.map((rp) => (
                                <ProductCard key={rp.id} product={rp} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
