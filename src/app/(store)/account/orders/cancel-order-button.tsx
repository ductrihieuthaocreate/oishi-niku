'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cancelOrder } from './actions'
import { toast } from 'sonner'

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setIsLoading(true)
    try {
      const result = await cancelOrder(orderId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Order cancelled')
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={isLoading}
      className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
    >
      {isLoading ? 'Cancelling...' : 'Cancel Order'}
    </Button>
  )
}
