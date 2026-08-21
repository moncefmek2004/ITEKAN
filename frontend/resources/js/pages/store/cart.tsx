import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Minus, Package, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type CartItem = {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
    };
    variant: {
        id: number;
        name: string;
    } | null;
    unit_price: number;
    quantity: number;
    total_price: number;
    stock_quantity: number;
    is_active: boolean;
};

type CartProps = {
    cart: {
        items: CartItem[];
        total: number;
        item_count: number;
    };
};

function formatPrice(price: number): string {
    return (
        new Intl.NumberFormat('fr-DZ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price) + ' DA'
    );
}

function CartItemRow({ item }: { item: CartItem }) {
    const [processing, setProcessing] = useState(false);

    function updateQuantity(newQuantity: number) {
        if (newQuantity < 1 || newQuantity > item.stock_quantity) {
            return;
        }

        setProcessing(true);
        router.patch(
            `/panier/${item.id}`,
            { quantity: newQuantity },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    }

    function removeItem() {
        setProcessing(true);
        router.delete(`/panier/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Produit retiré du panier.'),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="flex gap-4 rounded-xl border border-border/40 bg-muted/20 p-4">
            {/* Image */}
            <Link
                href={`/produit/${item.product.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted/30 sm:h-24 sm:w-24"
            >
                {item.product.image ? (
                    <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                )}
            </Link>

            {/* Details */}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="min-w-0">
                    <Link
                        href={`/produit/${item.product.slug}`}
                        className="block truncate text-sm font-semibold hover:text-[#DDBBFF] transition-colors"
                    >
                        {item.product.name}
                    </Link>
                    {item.variant && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.variant.name}
                        </p>
                    )}
                </div>

                <div className="mt-2 flex items-end justify-between gap-2">
                    {/* Quantity */}
                    <div className="flex items-center rounded-lg border border-border/50">
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.quantity - 1)}
                            disabled={processing || item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="flex h-8 w-10 items-center justify-center text-sm font-medium">
                            {item.quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.quantity + 1)}
                            disabled={processing || item.quantity >= item.stock_quantity}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-foreground">
                            {formatPrice(item.total_price)}
                        </p>
                        <button
                            type="button"
                            onClick={removeItem}
                            disabled={processing}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/40">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-lg font-bold">Votre panier est vide</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Parcourez notre catalogue et ajoutez des produits à votre panier.
            </p>
            <Link href="/catalogue" className="mt-6">
                <Button className="bg-[#DDBBFF] text-black hover:bg-[#c9a5f0]">
                    Parcourir le catalogue
                </Button>
            </Link>
        </div>
    );
}

export default function Cart() {
    const { cart } = usePage().props as unknown as CartProps;
    const [clearing, setClearing] = useState(false);

    function clearCart() {
        setClearing(true);
        router.delete('/panier', {
            preserveScroll: true,
            onSuccess: () => toast.success('Panier vidé.'),
            onFinish: () => setClearing(false),
        });
    }

    return (
        <>
            <Head title="Panier" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* Back */}
                <Link
                    href="/catalogue"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Continuer les achats
                </Link>

                <h1 className="mb-6 text-2xl font-bold">Panier</h1>

                {cart.items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Items */}
                        <div className="space-y-4 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {cart.item_count} article{cart.item_count > 1 ? 's' : ''}
                                </p>
                                <button
                                    type="button"
                                    onClick={clearCart}
                                    disabled={clearing}
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Vider le panier
                                </button>
                            </div>

                            {cart.items.map((item) => (
                                <CartItemRow key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-xl border border-border/40 bg-muted/20 p-6">
                                <h2 className="mb-4 text-lg font-bold">
                                    Résumé de la commande
                                </h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Sous-total ({cart.item_count} article{cart.item_count > 1 ? 's' : ''})</span>
                                        <span className="font-medium text-foreground">
                                            {formatPrice(cart.total)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Livraison</span>
                                        <span className="font-medium text-foreground">
                                            À la livraison
                                        </span>
                                    </div>
                                </div>

                                <Separator className="my-4 bg-border/40" />

                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(cart.total)}</span>
                                </div>

                                <Button
                                    className="mt-6 w-full bg-[#DDBBFF] text-black hover:bg-[#c9a5f0]"
                                    size="lg"
                                >
                                    Passer la commande
                                </Button>

                                <p className="mt-3 text-center text-xs text-muted-foreground">
                                    Paiement à la livraison
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
