import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SEED_KEY = 'oishi-seed-2024'

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('key') !== SEED_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const steps: string[] = []

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      slug       TEXT NOT NULL UNIQUE,
      parent_id  INT REFERENCES categories(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  steps.push('categories table ok')

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id           SERIAL PRIMARY KEY,
      name         TEXT NOT NULL,
      slug         TEXT NOT NULL UNIQUE,
      description  TEXT,
      price        NUMERIC(10,2) NOT NULL,
      stock        INT NOT NULL DEFAULT 0,
      weight_grams INT,
      cut_type     TEXT,
      grade        TEXT,
      origin       TEXT,
      image_url    TEXT,
      images       TEXT[] DEFAULT '{}',
      category_id  INT REFERENCES categories(id) ON DELETE SET NULL,
      sales_count  INT NOT NULL DEFAULT 0,
      is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `
  steps.push('products table ok')

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id               SERIAL PRIMARY KEY,
      total            NUMERIC(10,2) NOT NULL,
      subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
      shipping_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax              NUMERIC(10,2) NOT NULL DEFAULT 0,
      status           TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
      tracking_number  TEXT,
      shipping_name    TEXT,
      shipping_email   TEXT,
      shipping_phone   TEXT,
      shipping_address TEXT,
      shipping_city    TEXT,
      shipping_state   TEXT,
      shipping_postal  TEXT,
      shipping_country TEXT DEFAULT 'US',
      payment_method   TEXT,
      notes            TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `
  steps.push('orders table ok')

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id           SERIAL PRIMARY KEY,
      order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id   INT REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      quantity     INT NOT NULL,
      unit_price   NUMERIC(10,2) NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `
  steps.push('order_items table ok')

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE`
  await sql`CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(stock)`
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone         TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `
  steps.push('customers table ok')

  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INT REFERENCES customers(id) ON DELETE SET NULL`
  steps.push('orders.user_id ok')

  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_email      ON orders(shipping_email)`
  await sql`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id) WHERE user_id IS NOT NULL`
  await sql`CREATE INDEX IF NOT EXISTS idx_customers_email   ON customers(email)`
  steps.push('indexes ok')

  // Seed categories
  await sql`
    INSERT INTO categories (name, slug) VALUES
      ('Wagyu Beef',   'wagyu'),
      ('Regular Beef', 'beef'),
      ('Pork',         'pork'),
      ('Chicken',      'chicken'),
      ('Lamb',         'lamb'),
      ('Seafood',      'seafood')
    ON CONFLICT (slug) DO NOTHING
  `
  steps.push('categories seeded')

  const cats = await sql`SELECT id, slug FROM categories ORDER BY slug`
  return NextResponse.json({ ok: true, steps, categories: cats })
}
