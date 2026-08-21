import { Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const categoryLinks = [
    { title: 'Claviers', href: '/catalogue?category=claviers' },
    { title: 'Souris', href: '/catalogue?category=souris' },
    { title: 'Casques', href: '/catalogue?category=casques' },
    { title: 'Combos', href: '/catalogue?category=combos' },
    { title: 'Moniteurs', href: '/catalogue?category=moniteurs' },
    { title: 'Accessoires', href: '/catalogue?category=accessoires' },
];

const customerLinks = [
    { title: 'Mon compte', href: '/dashboard' },
    { title: 'Mes commandes', href: '/orders' },
    { title: 'Mon panier', href: '/cart' },
];

const infoLinks = [
    { title: 'Livraison', href: '#' },
    { title: 'Retours', href: '#' },
    { title: 'FAQ', href: '#' },
];

export default function StoreFooter() {
    return (
        <footer className="border-t border-border/50 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img
                                src="/images/logo.jpg"
                                alt="ITEKAN"
                                className="h-8 w-8 rounded-md object-cover"
                            />
                            <span className="text-lg font-bold">ITEKAN</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Votre marketplace informatique & gaming en Algérie.
                            Livraison dans les 58 wilayas.
                        </p>
                        <a
                            href="https://wa.me/21300000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                        </a>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Catégories</h3>
                        <ul className="space-y-2">
                            {categoryLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Client</h3>
                        <ul className="space-y-2">
                            {customerLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Informations</h3>
                        <ul className="space-y-2">
                            {infoLinks.map((link) => (
                                <li key={link.href + link.title}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} ITEKAN. Tous droits réservés.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Paiement à la livraison — Livraison 58 wilayas
                    </p>
                </div>
            </div>
        </footer>
    );
}
