'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart()

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
    toast.success(`${product.name} added to cart`)
  }

  const isOutOfStock = product.stock <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col"
    >
      <Link href={`/products/${product.id}`} className="group flex flex-col h-full">
        <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority={priority}
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-60' : ''}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded-full">
                完売
              </span>
            )}
            {!isOutOfStock && product.sales_count >= 100 && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                人気
              </span>
            )}
            {product.is_featured && !isOutOfStock && (
              <span className="bg-secondary/90 text-foreground text-xs font-semibold px-2 py-1 rounded-full border border-border">
                おすすめ
              </span>
            )}
          </div>

          {/* Quick Add */}
          {!isOutOfStock && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="absolute bottom-2 left-2 right-2 bg-primary text-primary-foreground font-heading tracking-wider text-sm py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              クイック追加
            </motion.button>
          )}
        </div>

        <div className="mt-3 flex flex-col flex-1 gap-1">
          {product.categories && (
            <p className="text-xs text-muted-foreground tracking-wider uppercase">{product.categories.name}</p>
          )}
          <h3 className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-primary font-semibold">{formatPrice(product.price)}</span>
            {product.weight_grams && (
              <span className="text-xs text-muted-foreground">{product.weight_grams}g</span>
            )}
          </div>
          {product.grade && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span className="text-xs text-muted-foreground">{product.grade}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
