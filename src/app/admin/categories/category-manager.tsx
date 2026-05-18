'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, deleteCategory } from './actions'
import { toast } from 'sonner'

interface CategoryManagerProps {
  categories: Array<{ id: number; name: string; slug: string; products: { count: number }[] }>
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    const formData = new FormData()
    formData.set('name', name)
    const result = await createCategory(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Category created')
      setName('')
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Products in this category won't be deleted.`)) return
    const result = await deleteCategory(id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Category deleted')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Create */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-heading tracking-wider text-foreground mb-4 text-sm uppercase">New Category</h3>
        <form onSubmit={handleCreate} className="flex gap-3">
          <div className="flex-1">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Wagyu Beef"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
        </form>
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No categories yet</div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{cat.products?.[0]?.count ?? 0} products</span>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
