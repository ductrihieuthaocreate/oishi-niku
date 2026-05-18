'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from './actions'
import { toast } from 'sonner'

export function DeleteProductButton({ id }: { id: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setIsLoading(true)
    try {
      const result = await deleteProduct(id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Product deleted')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors disabled:opacity-50"
      aria-label="Delete product"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
