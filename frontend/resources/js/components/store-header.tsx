import { Link, usePage } from '@inertiajs/react';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Accueil', href: '/' },
    { title: 'Catalogue', href: '/catalogue' },
];

export default function StoreHeader() {
    const page = usePage();
    const { auth, locale, cartCount } = page.props as any;
    const getInitials = useInitials();
    const isMobile = useIsMobile();

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 items-center justify-between px-4 md:max-w-7xl">
                <div className="flex items-center gap-6">
                    {isMobile && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-1 h-9 w-9"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex w-72 flex-col bg-background"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation
                                </SheetTitle>
                                <SheetHeader className="flex justify-start border-b pb-4 text-left">
                                    <Link href="/" className="flex items-center gap-2">
                                        <img
                                            src="/images/logo.jpg"
                                            alt="ITEKAN"
                                            className="h-8 w-8 rounded-md object-cover"
                                        />
                                        <span className="text-lg font-bold">ITEKAN</span>
                                    </Link>
                                </SheetHeader>
                                <nav className="flex flex-1 flex-col gap-1 p-4">
                                    {mainNavItems.map((item) => (
                                        <Link
                                            key={toUrl(item.href)}
                                            href={item.href}
                                            className={cn(
                                                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                                                locale === 'ar' && 'text-right',
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                    <div className="my-2 border-t" />
                                    {auth.user ? (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                            >
                                                Tableau de bord
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                        >
                                            Se connecter
                                        </Link>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    )}

                    <Link href="/" className="flex items-center gap-2.5" prefetch>
                        <img
                            src="/images/logo.jpg"
                            alt="ITEKAN"
                            className="h-8 w-8 rounded-md object-cover"
                        />
                        <span className="text-lg font-bold tracking-tight">
                            ITEKAN
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {mainNavItems.map((item) => (
                            <Link
                                key={toUrl(item.href)}
                                href={item.href}
                                className={cn(
                                    'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                                    toUrl(item.href) === page.url
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                    >
                        <Search className="h-4.5 w-4.5" />
                    </Button>

                    <LanguageSwitcher />

                    <Link href="/panier" prefetch>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9"
                        >
                            <ShoppingCart className="h-4.5 w-4.5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DDBBFF] px-1 text-[10px] font-bold text-black">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full p-0.5"
                                >
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login" prefetch>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <User className="h-4.5 w-4.5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
