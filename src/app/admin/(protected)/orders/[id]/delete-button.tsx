'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteOrder } from './actions'

export function DeleteOrderButton({ orderId }: { orderId: number }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Order
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Are you sure?</span>
      <button
        onClick={async () => {
          setLoading(true)
          await deleteOrder(orderId)
        }}
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Deleting...' : 'Yes, delete'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
