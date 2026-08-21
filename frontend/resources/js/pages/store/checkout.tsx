import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, ChevronDown, MapPin, Package, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type CheckoutCartItem = {
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
};

type Address = {
    id: number;
    label: string | null;
    full_name: string;
    phone: string;
    line1: string;
    line2: string | null;
    wilaya_code: string;
    wilaya_name: string | null;
    city: string;
    postal_code: string | null;
    is_default: boolean;
};

type Wilaya = {
    code: string;
    name: string;
};

type CheckoutProps = {
    cart: {
        items: CheckoutCartItem[];
        total: number;
        item_count: number;
    };
    addresses: Address[];
    wilayas: Wilaya[];
    shipping_cost: number;
};

function formatPrice(price: number): string {
    return (
        new Intl.NumberFormat('fr-DZ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price) + ' DA'
    );
}

function AddressSelector({
    addresses,
    selectedId,
    onSelect,
}: {
    addresses: Address[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
}) {
    if (addresses.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium">Adresse de livraison</p>
            {addresses.map((addr) => (
                <button
                    key={addr.id}
                    type="button"
                    onClick={() => onSelect(addr.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                        selectedId === addr.id
                            ? 'border-[#DDBBFF] bg-[#DDBBFF]/5'
                            : 'border-border/40 bg-muted/20 hover:border-border'
                    }`}
                >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selectedId === addr.id
                            ? 'border-[#DDBBFF] bg-[#DDBBFF]'
                            : 'border-border'
                    }`}>
                        {selectedId === addr.id && (
                            <Check className="h-3 w-3 text-black" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{addr.full_name}</p>
                            {addr.label && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {addr.label}
                                </span>
                            )}
                            {addr.is_default && (
                                <span className="rounded bg-[#00EE99]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#00EE99]">
                                    Par défaut
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {addr.city}, {addr.wilaya_name ?? addr.wilaya_code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Tél: {addr.phone}
                        </p>
                    </div>
                </button>
            ))}
            <button
                type="button"
                onClick={() => onSelect(null)}
                className={`flex w-full items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:border-[#DDBBFF] hover:text-foreground ${
                    selectedId === null ? 'border-[#DDBBFF] text-foreground' : ''
                }`}
            >
                <Plus className="h-4 w-4" />
                Utiliser une nouvelle adresse
            </button>
        </div>
    );
}

function NewAddressForm({
    wilayas,
    errors,
}: {
    wilayas: Wilaya[];
    errors: Record<string, string>;
}) {
    return (
        <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="full_name" className="mb-1 block text-xs font-medium text-muted-foreground">
                        Nom complet *
                    </label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required
                        className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                    />
                    {errors.full_name && <p className="mt-1 text-xs text-destructive">{errors.full_name}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="mb-1 block text-xs font-medium text-muted-foreground">
                        Téléphone *
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="line1" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Adresse (ligne 1) *
                </label>
                <input
                    id="line1"
                    name="line1"
                    type="text"
                    required
                    className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                />
                {errors.line1 && <p className="mt-1 text-xs text-destructive">{errors.line1}</p>}
            </div>

            <div>
                <label htmlFor="line2" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Adresse (ligne 2)
                </label>
                <input
                    id="line2"
                    name="line2"
                    type="text"
                    className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                    <label htmlFor="wilaya_code" className="mb-1 block text-xs font-medium text-muted-foreground">
                        Wilaya *
                    </label>
                    <div className="relative">
                        <select
                            id="wilaya_code"
                            name="wilaya_code"
                            required
                            className="w-full appearance-none rounded-lg border border-border/50 bg-background px-3 py-2 pr-8 text-sm focus:border-[#DDBBFF] focus:outline-none"
                        >
                            <option value="">Choisir...</option>
                            {wilayas.map((w) => (
                                <option key={w.code} value={w.code}>
                                    {w.code} - {w.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {errors.wilaya_code && <p className="mt-1 text-xs text-destructive">{errors.wilaya_code}</p>}
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="city" className="mb-1 block text-xs font-medium text-muted-foreground">
                        Ville *
                    </label>
                    <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                    />
                    {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="postal_code" className="mb-1 block text-xs font-medium text-muted-foreground">
                        Code postal
                    </label>
                    <input
                        id="postal_code"
                        name="postal_code"
                        type="text"
                        className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

export default function Checkout() {
    const { cart, addresses, wilayas, shipping_cost } =
        usePage().props as unknown as CheckoutProps;

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
        addresses.find((a) => a.is_default)?.id ?? (addresses.length > 0 ? addresses[0].id : null),
    );
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const subtotal = cart.total;
    const total = subtotal + shipping_cost;

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload: Record<string, string> = {
            payment_method: 'cod',
        };

        if (selectedAddressId !== null) {
            payload.address_id = String(selectedAddressId);
        } else {
            payload.full_name = formData.get('full_name') as string;
            payload.phone = formData.get('phone') as string;
            payload.line1 = formData.get('line1') as string;
            payload.line2 = (formData.get('line2') as string) || '';
            payload.wilaya_code = formData.get('wilaya_code') as string;
            payload.city = formData.get('city') as string;
            payload.postal_code = (formData.get('postal_code') as string) || '';
        }

        const notes = formData.get('notes') as string;

        if (notes) {
            payload.notes = notes;
        }

        router.post('/checkout', payload, {
            preserveScroll: true,
            onError: (serverErrors) => {
                setErrors(serverErrors as Record<string, string>);
                toast.error('Veuillez corriger les erreurs.');
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <>
            <Head title="Paiement" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
                <Link
                    href="/panier"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour au panier
                </Link>

                <h1 className="mb-6 text-2xl font-bold">Paiement</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left — Address + Notes */}
                        <div className="space-y-6 lg:col-span-2">
                            <AddressSelector
                                addresses={addresses}
                                selectedId={selectedAddressId}
                                onSelect={setSelectedAddressId}
                            />

                            {selectedAddressId === null && (
                                <NewAddressForm wilayas={wilayas} errors={errors} />
                            )}

                            {errors.cart && (
                                <p className="text-sm text-destructive">{errors.cart}</p>
                            )}
                            {errors.product && (
                                <p className="text-sm text-destructive">{errors.product}</p>
                            )}
                            {errors.variant && (
                                <p className="text-sm text-destructive">{errors.variant}</p>
                            )}
                            {errors.stock && (
                                <p className="text-sm text-destructive">{errors.stock}</p>
                            )}
                            {errors.address_id && (
                                <p className="text-sm text-destructive">{errors.address_id}</p>
                            )}

                            {/* Notes */}
                            <div>
                                <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                                    Notes (optionnel)
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    placeholder="Instructions de livraison, code d'entrée, etc."
                                    className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:border-[#DDBBFF] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Right — Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-xl border border-border/40 bg-muted/20 p-6">
                                <h2 className="mb-4 text-lg font-bold">
                                    Votre commande
                                </h2>

                                <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted/30">
                                                {item.product.image ? (
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-5 w-5 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium">
                                                    {item.product.name}
                                                </p>
                                                {item.variant && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {item.variant.name}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="shrink-0 text-xs font-semibold">
                                                {formatPrice(item.total_price)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="mb-4 bg-border/40" />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Sous-total</span>
                                        <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Livraison</span>
                                        <span className="font-medium text-foreground">{formatPrice(shipping_cost)}</span>
                                    </div>
                                </div>

                                <Separator className="my-4 bg-border/40" />

                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>

                                <div className="mt-4 rounded-lg bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
                                    <MapPin className="mr-1 inline h-3.5 w-3.5" />
                                    Paiement à la livraison
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full bg-[#DDBBFF] text-black hover:bg-[#c9a5f0]"
                                    size="lg"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Traitement...' : 'Confirmer la commande'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
