export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  weight_grams: number | null
  cut_type: string | null
  grade: string | null
  origin: string | null
  image_url: string | null
  images: string[]
  category_id: number | null
  sales_count: number
  is_featured: boolean
  stars: number | null
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Order {
  id: number
  user_id: string | null
  total: number
  subtotal: number
  shipping_fee: number
  tax: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  tracking_number: string | null
  shipping_name: string | null
  shipping_email: string | null
  shipping_phone: string | null
  shipping_address: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_postal: string | null
  shipping_country: string | null
  payment_method: string | null
  notes: string | null
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number | null
  quantity: number
  unit_price: number
  product_name: string
  products?: Product
}
