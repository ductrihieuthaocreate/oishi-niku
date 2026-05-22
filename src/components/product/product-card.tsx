'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useLang } from '@/lib/lang-context'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart()
  const { t } = useLang()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      weight_grams: product.weight_grams,
    })
    toast.success(product.name + t.product.addedToCartSuffix)
  }

  const inStock = product.stock > 0

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="relative bg-background rounded-3xl overflow-hidden go2go-shadow go2go-transition group-hover:scale-[1.02] h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-square bg-card overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority={priority}
              className="object-contain go2go-transition group-hover:scale-105 p-2"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-foreground/80 text-background text-[10px] font-medium px-3 py-1 rounded-full">
                {t.product.soldOut}
              </span>
            </div>
          )}

          {/* Badge */}
          {inStock && product.sales_count >= 100 && (
            <span className="absolute top-3 left-3 bg-white text-foreground text-[9px] font-medium px-2.5 py-1 rounded-full go2go-shadow">
              {t.product.popular}
            </span>
          )}
          {inStock && product.is_featured && (
            <span className="absolute top-3 right-3 bg-accent/20 text-foreground text-[9px] font-medium px-2.5 py-1 rounded-full">
              {t.product.featuredBadge}
            </span>
          )}

          {/* Quick add */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-0 inset-x-0 bg-primary text-primary-foreground font-medium text-xs py-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {t.product.quickAdd}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 gap-1">
          {product.grade && (
            <p className="text-[10px] text-muted-foreground tracking-wider font-mono">{product.grade}</p>
          )}
          {!product.grade && product.categories && (
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase">{product.categories.name}</p>
          )}
          <h3
            className="font-serif text-base text-foreground leading-snug go2go-transition group-hover:text-primary/80"
            style={{ fontFamily: 'var(--font-cormorant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {product.name}
          </h3>
          <div className="mt-auto pt-2 flex items-end justify-between">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground text-base">¥{product.price.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">税込 ¥{Math.round(product.price * 1.1).toLocaleString()}</span>
            </div>
            {product.weight_grams && (
              <span className="text-[10px] text-muted-foreground">{product.weight_grams}g</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
