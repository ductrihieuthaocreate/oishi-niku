'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  try {
    const [product] = await sql`
      INSERT INTO products (name, slug, description, description_ja, price, stock, weight_grams, cut_type, grade, origin, category_id, image_url, images, is_featured, stars, sort_order)
      VALUES (
        ${name},
        ${slugify(name)},
        ${(formData.get('description') as string) || null},
        ${(formData.get('description_ja') as string) || null},
        ${parseFloat(formData.get('price') as string)},
        ${parseInt(formData.get('stock') as string)},
        ${formData.get('weight_grams') ? parseInt(formData.get('weight_grams') as string) : null},
        ${(formData.get('cut_type') as string) || null},
        ${(formData.get('grade') as string) || null},
        ${(formData.get('origin') as string) || null},
        ${formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null},
        ${(formData.get('image_url') as string) || null},
        '{}',
        ${formData.get('is_featured') === 'true'},
        ${formData.get('stars') ? parseInt(formData.get('stars') as string) : null},
        ${formData.get('sort_order') ? parseInt(formData.get('sort_order') as string) : null}
      )
      RETURNING id
    `
    if (!product) return { error: 'Failed to create product.' }
  } catch (e: any) {
    return { error: e.message }
  }

  revalidatePath('/admin/products')
  revalidatePath('/')
  redirect('/admin/products')
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get('name') as string
  try {
    await sql`
      UPDATE products SET
        name         = ${name},
        slug         = ${slugify(name)},
        description    = ${(formData.get('description') as string) || null},
        description_ja = ${(formData.get('description_ja') as string) || null},
        price        = ${parseFloat(formData.get('price') as string)},
        stock        = ${parseInt(formData.get('stock') as string)},
        weight_grams = ${formData.get('weight_grams') ? parseInt(formData.get('weight_grams') as string) : null},
        cut_type     = ${(formData.get('cut_type') as string) || null},
        grade        = ${(formData.get('grade') as string) || null},
        origin       = ${(formData.get('origin') as string) || null},
        category_id  = ${formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null},
        image_url    = ${(formData.get('image_url') as string) || null},
        is_featured  = ${formData.get('is_featured') === 'true'},
        stars        = ${formData.get('stars') ? parseInt(formData.get('stars') as string) : null},
        sort_order   = ${formData.get('sort_order') ? parseInt(formData.get('sort_order') as string) : null},
        updated_at   = NOW()
      WHERE id = ${id}
    `
  } catch (e: any) {
    return { error: e.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
  redirect('/admin/products')
}

export async function deleteProduct(id: number) {
  try {
    await sql`UPDATE order_items SET product_id = NULL WHERE product_id = ${id}`
    await sql`DELETE FROM products WHERE id = ${id}`
  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath('/admin/products')
  revalidatePath('/')
  return { success: true }
}
