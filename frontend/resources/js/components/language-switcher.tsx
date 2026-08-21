import { router, usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
] as const;

type Props = {
    className?: string;
};

export default function LanguageSwitcher({ className }: Props) {
    const { locale } = usePage().props;

    const switchLocale = (code: string) => {
        if (code === locale) {
return;
}

        router.post('/locale', { locale: code }, { preserveScroll: true });
    };

    const current = languages.find((l) => l.code === locale) ?? languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-9 gap-1.5 px-2 text-sm', className)}
                >
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={cn(
                            'cursor-pointer',
                            locale === lang.code && 'bg-accent',
                        )}
                    >
                        <span className="flex-1">{lang.label}</span>
                        {locale === lang.code && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                ✓
                            </span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
