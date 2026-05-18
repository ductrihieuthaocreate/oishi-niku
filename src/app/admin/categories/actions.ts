'use server'

import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  try {
    await sql`INSERT INTO categories (name, slug) VALUES (${name}, ${slugify(name)})`
  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}

export async function deleteCategory(id: number) {
  try {
    await sql`DELETE FROM categories WHERE id = ${id}`
  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}
