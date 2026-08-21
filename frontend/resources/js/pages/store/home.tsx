import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CreditCard, Headphones, Truck } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import type { Category, Product } from '@/types';

type HomeProps = {
    categories: Category[];
    featuredProducts: Product[];
};

export default function StoreHome() {
    const { categories, featuredProducts } = usePage().props as unknown as HomeProps;

    return (
        <>
            <Head title="Accueil" />

            {/* ── Hero ──────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0f0a1a]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_40%,rgba(221,187,255,0.07),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_80%,rgba(0,238,153,0.04),transparent)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:grid lg:grid-cols-2 lg:gap-12 lg:py-28">
                    {/* Left — Text */}
                    <div className="flex flex-col justify-center">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#00EE99]">
                            Gaming &amp; Informatique
                        </p>

                        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                            Power Your{' '}
                            <span className="bg-gradient-to-r from-[#DDBBFF] to-[#c49eff] bg-clip-text text-transparent">
                                Next Level
                            </span>
                        </h1>

                        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                            Laptops, ordinateurs et équipements technologiques pour
                            le gaming et le bureau. Livraison dans les 58 wilayas.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button
                                asChild
                                className="bg-[#DDBBFF] text-black hover:bg-[#c9a5f0]"
                            >
                                <Link href="/catalogue">
                                    Shop Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-border/60">
                                <Link href="/catalogue?category=gaming-laptops">
                                    Explore Gaming
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right — Laptop visual placeholder */}
                    <div className="relative mt-12 flex items-center justify-center lg:mt-0">
                        <div className="relative flex h-64 w-full max-w-md items-center justify-center sm:h-80 lg:h-[420px]">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#DDBBFF]/10 via-transparent to-[#00EE99]/10 blur-2xl" />
                            <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-white/[0.03] p-8 backdrop-blur-sm">
                                <svg
                                    className="h-16 w-16 text-[#DDBBFF]/60 sm:h-20 sm:w-20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <rect x="2" y="3" width="20" height="14" rx="2" />
                                    <path d="M2 20h20" />
                                    <path d="M8 17h8" />
                                </svg>
                                <span className="text-xs text-muted-foreground/60">
                                    Laptop Product Image
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Shop by Category ──────────────────────────── */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold sm:text-2xl">
                        Shop by Category
                    </h2>
                    <Link
                        href="/catalogue"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Tout voir →
                    </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/catalogue?category=${category.slug}`}
                            className="group relative flex h-36 items-end overflow-hidden rounded-xl border border-border/40 transition-all duration-300 hover:border-[#DDBBFF]/30 hover:shadow-lg hover:shadow-[#DDBBFF]/5 sm:h-44"
                        >
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1525] to-[#0d0d15]" />
                            )}

                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/70" />

                            <div className="relative z-10 w-full p-4">
                                <h3 className="text-sm font-semibold text-white sm:text-base">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Products ─────────────────────────── */}
            {featuredProducts.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold sm:text-2xl">
                            Produits vedettes
                        </h2>
                        <Link
                            href="/catalogue"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Tout voir →
                        </Link>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* ── Trust / Service ──────────────────────────── */}
            <section className="border-t border-border/50 bg-muted/20">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 sm:grid-cols-3 sm:gap-8 sm:py-16">
                    <div className="flex items-start gap-3">
                        <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#00EE99]" />
                        <div>
                            <h3 className="text-sm font-semibold">
                                Livraison 58 wilayas
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Livraison rapide partout en Algérie
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#00EE99]" />
                        <div>
                            <h3 className="text-sm font-semibold">
                                Paiement à la livraison
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Payez en cash à la réception de votre colis
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-[#00EE99]" />
                        <div>
                            <h3 className="text-sm font-semibold">
                                Support WhatsApp
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Contactez-nous directement sur WhatsApp
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
