'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Product, Category } from '@/lib/types'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  action: (formData: FormData) => Promise<void>
}

export function ProductForm({ product, categories, action }: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload-product-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setImageUrl(data.url)
    } catch {
      alert('Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      {/* Image */}
      <div>
        <Label>Product Image</Label>
        <div className="mt-2 flex items-start gap-4">
          <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-secondary border border-border flex-shrink-0">
            {imageUrl ? (
              <>
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                No image
              </div>
            )}
          </div>
          <div>
            <input type="hidden" name="image_url" value={imageUrl} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP. Max 10MB.</p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" defaultValue={product?.name} required className="mt-1.5" placeholder="Wagyu A5 Ribeye" />
        </div>
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required className="mt-1.5" placeholder="49.99" />
        </div>
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? 0} required className="mt-1.5" placeholder="50" />
        </div>
        <div>
          <Label htmlFor="weight_grams">Weight (grams)</Label>
          <Input id="weight_grams" name="weight_grams" type="number" defaultValue={product?.weight_grams ?? ''} className="mt-1.5" placeholder="300" />
        </div>
        <div>
          <Label htmlFor="category_id">Category</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product?.category_id ?? ''}
            className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meat-specific fields */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Input id="grade" name="grade" defaultValue={product?.grade ?? ''} className="mt-1.5" placeholder="A5, A4, Choice..." />
        </div>
        <div>
          <Label htmlFor="cut_type">Cut Type</Label>
          <Input id="cut_type" name="cut_type" defaultValue={product?.cut_type ?? ''} className="mt-1.5" placeholder="Ribeye, Tenderloin..." />
        </div>
        <div>
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" name="origin" defaultValue={product?.origin ?? ''} className="mt-1.5" placeholder="Japan, USA, Australia..." />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (EN)</Label>
        <Textarea id="description" name="description" defaultValue={product?.description ?? ''} className="mt-1.5" rows={3} placeholder="Describe the product in English..." />
      </div>

      <div>
        <Label htmlFor="description_ja">Description (JP — 日本語説明)</Label>
        <Textarea id="description_ja" name="description_ja" defaultValue={product?.description_ja ?? ''} className="mt-1.5" rows={3} placeholder="日本語で商品説明を入力してください..." />
      </div>

      <div>
        <Label htmlFor="sort_order">Pin Position (push to top of listing)</Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          min="1"
          defaultValue={product?.sort_order ?? ''}
          className="mt-1.5"
          placeholder="e.g. 1 = first, 2 = second, leave empty to not pin"
        />
      </div>

      <div>
        <Label htmlFor="stars">Star Rating (shown on product card)</Label>
        <select
          id="stars"
          name="stars"
          defaultValue={product?.stars ?? ''}
          className="mt-1.5 flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">No stars</option>
          <option value="1">★☆☆☆☆  (1)</option>
          <option value="2">★★☆☆☆  (2)</option>
          <option value="3">★★★☆☆  (3)</option>
          <option value="4">★★★★☆  (4)</option>
          <option value="5">★★★★★  (5)</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_featured"
          name="is_featured"
          value="true"
          defaultChecked={product?.is_featured}
          className="w-4 h-4 accent-primary"
        />
        <Label htmlFor="is_featured">Featured on homepage</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
      </div>
    </form>
  )
}
