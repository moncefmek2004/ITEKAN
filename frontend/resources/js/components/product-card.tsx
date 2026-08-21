import { Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types';

type Props = {
    product: Product;
};

function formatPrice(price: number): string {
    return (
        new Intl.NumberFormat('fr-DZ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price) + ' DA'
    );
}

function getStockLabel(quantity: number): {
    text: string;
    variant: 'default' | 'secondary' | 'destructive';
} {
    if (quantity <= 0) {
return { text: 'Épuisé', variant: 'destructive' };
}

    if (quantity <= 5) {
return { text: 'Dernières pièces', variant: 'destructive' };
}

    if (quantity <= 10) {
return { text: 'Stock limité', variant: 'secondary' };
}

    return { text: 'En stock', variant: 'default' };
}

export default function ProductCard({ product }: Props) {
    const imageUrl = product.media?.[0]?.path ?? null;
    const hasDiscount =
        product.compare_price !== null && product.compare_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round(
              ((product.compare_price! - product.price) /
                  product.compare_price!) *
                  100,
          )
        : 0;
    const stock = getStockLabel(product.stock_quantity);

    return (
        <Link href={`/produits/${product.slug}`} prefetch>
            <Card className="group overflow-hidden border-border/50 bg-card transition-all duration-200 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
                <div className="relative aspect-square overflow-hidden bg-muted/30 p-6">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-sm text-muted-foreground/50">
                                Pas d'image
                            </span>
                        </div>
                    )}

                    {hasDiscount && (
                        <Badge
                            variant="destructive"
                            className="absolute top-2 left-2 text-xs"
                        >
                            -{discountPercent}%
                        </Badge>
                    )}

                    {product.is_featured && (
                        <Badge
                            variant="secondary"
                            className="absolute top-2 right-2 border-accent/30 bg-accent/10 text-xs text-accent-foreground"
                        >
                            ★ Vedette
                        </Badge>
                    )}
                </div>

                <CardContent className="space-y-2 p-4">
                    {product.brand && (
                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            {product.brand.name}
                        </p>
                    )}

                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                        {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                            {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.compare_price!)}
                            </span>
                        )}
                    </div>

                    <Badge variant={stock.variant} className="w-fit text-xs">
                        {stock.text}
                    </Badge>
                </CardContent>
            </Card>
        </Link>
    );
}
