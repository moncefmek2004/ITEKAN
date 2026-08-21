import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type OrderItem = {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    quantity: number;
    total: number;
    product: {
        id: number;
        slug: string;
        image: string | null;
    };
};

type OrderAddress = {
    full_name: string;
    phone: string;
    line1: string;
    line2: string | null;
    wilaya_name: string | null;
    city: string;
};

type OrderProps = {
    order: {
        id: number;
        order_number: string;
        order_status: string;
        payment_status: string;
        payment_method: string;
        subtotal: number;
        shipping: number;
        discount: number;
        total: number;
        notes: string | null;
        placed_at: string | null;
        confirmed_at: string | null;
        items: OrderItem[];
        address: OrderAddress;
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

function formatDate(dateStr: string | null): string {
    if (!dateStr) {
        return '';
    }

    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrderConfirmation() {
    const { order } = usePage().props as unknown as OrderProps;

    return (
        <>
            <Head title={`Commande ${order.order_number}`} />

            <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
                {/* Success header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00EE99]/10">
                        <CheckCircle className="h-8 w-8 text-[#00EE99]" />
                    </div>
                    <h1 className="text-2xl font-bold">Commande confirmée</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Merci pour votre commande. Vous recevrez un paiement à la livraison.
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#DDBBFF]">
                        N° {order.order_number}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(order.placed_at)}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Order items */}
                    <section className="rounded-xl border border-border/40 bg-muted/20 p-5">
                        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Articles
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted/30">
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/produit/${item.product.slug}`}
                                            className="text-sm font-semibold hover:text-[#DDBBFF] transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                        {item.sku && (
                                            <p className="text-[10px] text-muted-foreground">
                                                SKU: {item.sku}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} x {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-bold">
                                        {formatPrice(item.total)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4 bg-border/40" />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Sous-total</span>
                                <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Livraison</span>
                                <span className="font-medium text-foreground">{formatPrice(order.shipping)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Remise</span>
                                    <span className="font-medium text-[#00EE99]">-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                        </div>

                        <Separator className="my-4 bg-border/40" />

                        <div className="flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </section>

                    {/* Delivery address */}
                    <section className="rounded-xl border border-border/40 bg-muted/20 p-5">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Adresse de livraison
                        </h2>
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#DDBBFF]" />
                            <div>
                                <p className="text-sm font-semibold">{order.address.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {order.address.city}, {order.address.wilaya_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Tél: {order.address.phone}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Payment info */}
                    <section className="rounded-xl border border-border/40 bg-muted/20 p-5">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Paiement
                        </h2>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Méthode</span>
                            <span className="text-sm font-medium">Paiement à la livraison</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Statut</span>
                            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                                En attente
                            </span>
                        </div>
                    </section>

                    {/* Status */}
                    <section className="rounded-xl border border-border/40 bg-muted/20 p-5">
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Statut de la commande
                        </h2>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Statut</span>
                            <span className="rounded bg-[#DDBBFF]/10 px-2 py-0.5 text-xs font-medium text-[#DDBBFF]">
                                En attente de confirmation
                            </span>
                        </div>
                        {order.confirmed_at && (
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Confirmée le</span>
                                <span className="text-sm font-medium">{formatDate(order.confirmed_at)}</span>
                            </div>
                        )}
                    </section>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href="/catalogue" className="flex-1">
                            <Button variant="outline" className="w-full border-border/50">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Continuer les achats
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
