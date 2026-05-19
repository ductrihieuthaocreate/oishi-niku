'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const isOutOfStock = product.stock <= 0

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      weight_grams: product.weight_grams,
    }, qty)
    toast.success(`${qty}x ${product.name} added to cart`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setQty(q => Math.max(1, q - 1))}
          disabled={isOutOfStock}
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50"
          aria-label="数量を減らす"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <span className="w-10 text-center font-medium">{qty}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setQty(q => Math.min(product.stock, q + 1))}
          disabled={isOutOfStock}
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50"
          aria-label="数量を増やす"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      <Button
        onClick={handleAdd}
        disabled={isOutOfStock}
        size="lg"
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-lg tracking-wider gap-2"
      >
        <ShoppingBag className="w-5 h-5" />
        {isOutOfStock ? '在庫切れ' : 'カートに追加'}
      </Button>
    </div>
  )
}
