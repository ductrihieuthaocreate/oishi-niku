// Sets up schema and seeds products via Neon HTTP API
import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const CONN = 'postgresql://neondb_owner:npg_98MpCQofyiOD@ep-odd-voice-aqayl0tm-pooler.c-8.us-east-1.aws.neon.tech/neondb'
const HOST = 'https://ep-odd-voice-aqayl0tm-pooler.c-8.us-east-1.aws.neon.tech'

function sql(query, params = []) {
  const tmp = join(tmpdir(), `neon-${Date.now()}.json`)
  const body = JSON.stringify(params.length ? { query, params } : { query })
  writeFileSync(tmp, body, 'utf8')
  try {
    const result = execSync(
      `curl -s --max-time 60 -X POST "${HOST}/sql" -H "Neon-Connection-String: ${CONN}" -H "Content-Type: application/json" -d @"${tmp}"`,
      { encoding: 'utf8' }
    )
    const json = JSON.parse(result)
    if (json.message && !json.fields) throw new Error(JSON.stringify(json))
    return json.rows ?? []
  } finally {
    try { unlinkSync(tmp) } catch {}
  }
}

// ── Schema ──────────────────────────────────────────────────────────────────

console.log('Creating tables...')

sql(`CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  parent_id  INT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`)

sql(`CREATE TABLE IF NOT EXISTS products (
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
)`)

sql(`CREATE TABLE IF NOT EXISTS orders (
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
)`)

sql(`CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity     INT NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
)`)

sql(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`)
sql(`CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE`)
sql(`CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(stock)`)
sql(`CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status)`)
sql(`CREATE INDEX IF NOT EXISTS idx_orders_email      ON orders(shipping_email)`)
sql(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`)

console.log('Tables created.')

// ── Categories ───────────────────────────────────────────────────────────────

sql(`INSERT INTO categories (name, slug) VALUES
  ('Wagyu Beef',   'wagyu'),
  ('Regular Beef', 'beef'),
  ('Pork',         'pork'),
  ('Chicken',      'chicken'),
  ('Lamb',         'lamb'),
  ('Seafood',      'seafood')
ON CONFLICT (slug) DO NOTHING`)

const cats = sql(`SELECT id, slug FROM categories ORDER BY slug`)
const catId = Object.fromEntries(cats.map(c => [c.slug, c.id]))
console.log('Categories:', catId)

// ── Products ─────────────────────────────────────────────────────────────────

const products = [
  // PORK
  { name: 'ĐẦU HEO BỔ ĐÔI 豚頭半割り HALF PIG HEAD',                              slug: 'dau-heo-bo-doi',           price: 650,  cat: 'pork' },
  { name: 'TRÀNG HEO 豚腸 PIG INTESTINE',                                          slug: 'trang-heo',                price: 880,  cat: 'pork' },
  { name: 'XƯƠNG NHIỀU THỊT 肉付き豚骨 MEATY PORK BONES',                          slug: 'xuong-nhieu-thit',         price: 480,  cat: 'pork' },
  { name: 'KHẤU ĐUÔI 豚尾根 PORK RUMP',                                            slug: 'khau-duoi',                price: 950,  cat: 'pork' },
  { name: 'HEO VỤN 豚端材 PORK OFFCUTS',                                           slug: 'heo-vun',                  price: 680,  cat: 'pork' },
  { name: 'NẦM HEO 豚乳房 PORK UDDER',                                             slug: 'nam-heo',                  price: 1100, cat: 'pork' },
  { name: 'DIỀM 豚スカート PORK SKIRT',                                             slug: 'diem-heo',                 price: 680,  cat: 'pork' },
  { name: 'BA CHỈ KHÔNG DA 皮なし豚バラ SKINLESS PORK BELLY',                       slug: 'ba-chi-ko-da',             price: 1000, cat: 'pork' },
  { name: 'NỌNG HEO 豚頬肉 PORK JOWL',                                             slug: 'nong-heo',                 price: 480,  cat: 'pork' },
  { name: 'XƯƠNG ỐNG HEO 豚すね骨 PORK LEG BONE',                                  slug: 'xuong-ong-heo',            price: 350,  cat: 'pork' },
  { name: 'XƯƠNG LƯNG HEO 豚背骨 PORK SPINE',                                      slug: 'xuong-lung-heo',           price: 330,  cat: 'pork' },
  { name: 'ĐUÔI HEO 豚しっぽ PIG TAIL',                                            slug: 'duoi-heo',                 price: 480,  cat: 'pork' },
  { name: 'TIM HEO 豚ハート PORK HEART',                                           slug: 'tim-heo',                  price: 450,  cat: 'pork' },
  { name: 'LÁ LÁCH 豚脾臓 PORK SPLEEN',                                            slug: 'la-lach',                  price: 380,  cat: 'pork' },
  { name: 'THỊT XAY 豚ひき肉 GROUND PORK',                                         slug: 'thit-xay',                 price: 720,  cat: 'pork' },
  { name: 'SƯỜN SỤN 豚軟骨 PORK CARTILAGE RIBS',                                   slug: 'suon-sun',                 price: 680,  cat: 'pork' },
  { name: 'LÒNG NON 豚小腸 SMALL INTESTINE',                                       slug: 'long-non',                 price: 550,  cat: 'pork' },
  { name: 'LÒNG NGỌT 豚大腸 LARGE INTESTINE',                                      slug: 'long-ngot',                price: 700,  cat: 'pork' },
  { name: 'LƯỠI HEO 豚タン PORK TONGUE',                                           slug: 'luoi-heo',                 price: 780,  cat: 'pork' },
  { name: 'CUỐNG HỌNG 豚のど PORK THROAT',                                          slug: 'cuong-hong',               price: 450,  cat: 'pork' },
  { name: 'DẠ DÀY 豚胃 PORK STOMACH',                                              slug: 'da-day',                   price: 420,  cat: 'pork' },
  { name: 'HEO TƯƠI 新鮮豚肉 FRESH PORK',                                          slug: 'heo-tuoi',                 price: 680,  cat: 'pork' },
  { name: 'CẬT HEO 豚腎臓 PORK KIDNEY',                                            slug: 'cat-heo',                  price: 460,  cat: 'pork' },
  { name: 'MÓNG CẮT 豚足カット PIG TROTTERS',                                       slug: 'mong-cat',                 price: 390,  cat: 'pork' },
  { name: 'TAI HEO 豚耳 PIG EAR',                                                  slug: 'tai-heo',                  price: 460,  cat: 'pork' },
  { name: 'MỠ HEO 豚脂 PORK FAT',                                                  slug: 'mo-heo',                   price: 410,  cat: 'pork' },
  { name: 'DA HEO 豚皮 PORK SKIN',                                                 slug: 'da-heo',                   price: 380,  cat: 'pork' },
  // BEEF
  { name: 'ĐUÔI BÒ 牛テール OXTAIL',                                               slug: 'duoi-bo',                  price: 1150, cat: 'beef' },
  { name: 'TỔ ONG BÒ 牛ハチノス BEEF HONEYCOMB TRIPE',                             slug: 'to-ong-bo',                price: 1100, cat: 'beef' },
  { name: 'KHĂN LÔNG BÒ 牛センマイ BEEF BLANKET TRIPE',                            slug: 'khan-long-bo',             price: 1200, cat: 'beef' },
  { name: 'GÂN BÒ TRẮNG 牛スジ白 WHITE BEEF TENDON',                               slug: 'gan-bo-trang',             price: 950,  cat: 'beef' },
  { name: 'GÂN BÒ SỐT VANG 牛スジ赤煮 BRAISED BEEF TENDON',                       slug: 'gan-bo-sot-vang',          price: 950,  cat: 'beef' },
  { name: 'MÔNG BÒ 牛もも BEEF RUMP',                                              slug: 'mong-bo',                  price: 1880, cat: 'beef' },
  { name: 'BẮP BÒ 牛すね肉 BEEF SHANK',                                            slug: 'bap-bo',                   price: 1980, cat: 'beef' },
  // CHICKEN
  { name: 'GÀ DAI KHÔNG ĐẦU 地鶏頭なし TOUGH CHICKEN HEADLESS',                   slug: 'ga-dai-ko-dau',            price: 460,  cat: 'chicken' },
  { name: 'GÀ MÁI NGON SIZE M 雌鶏Mサイズ HEN SIZE M',                             slug: 'ga-mai-ngon-m',            price: 880,  cat: 'chicken' },
  { name: 'GÀ MÁI NGON SIZE L 雌鶏Lサイズ HEN SIZE L',                             slug: 'ga-mai-ngon-l',            price: 990,  cat: 'chicken' },
  { name: 'ĐÙI GÀ DAI 地鶏もも TOUGH CHICKEN THIGH',                               slug: 'dui-ga-dai',               price: 660,  cat: 'chicken' },
  { name: 'ĐÙI GÀ DAI RÚT XƯƠNG 地鶏もも骨なし BONELESS TOUGH CHICKEN THIGH',     slug: 'dui-ga-dai-rut-xuong',     price: 660,  cat: 'chicken' },
  { name: 'CHÂN GÀ RÚT XƯƠNG 鶏足骨なし BONELESS CHICKEN FEET',                   slug: 'chan-ga-rut-xuong',        price: 950,  cat: 'chicken' },
  { name: 'TRÀNG TRỨNG GÀ 鶏卵巣 CHICKEN OVARY',                                   slug: 'trang-trung-ga',           price: 520,  cat: 'chicken' },
  { name: 'CHÂN GÀ NGẮN 鶏足短 SHORT CHICKEN FEET',                               slug: 'chan-ga-ngan',             price: 350,  cat: 'chicken' },
  { name: 'CHÂN GÀ DÀI 鶏足長 LONG CHICKEN FEET',                                 slug: 'chan-ga-dai',              price: 390,  cat: 'chicken' },
]

console.log(`\nSeeding ${products.length} products...`)
let inserted = 0, skipped = 0

for (const p of products) {
  const cid = catId[p.cat]
  if (!cid) { console.log(`  ✗ No category: ${p.cat}`); continue }
  try {
    sql(
      `INSERT INTO products (name, slug, price, stock, category_id, is_featured, sales_count)
       VALUES ($1, $2, $3, 99, $4, false, 0)
       ON CONFLICT (slug) DO NOTHING`,
      [p.name, p.slug, p.price, parseInt(cid)]
    )
    console.log(`  ✓ ${p.name}`)
    inserted++
  } catch (e) {
    console.log(`  ✗ ${p.slug}: ${e.message}`)
    skipped++
  }
}

console.log(`\nDone: ${inserted} inserted, ${skipped} skipped/error`)

const count = sql(`SELECT COUNT(*) as n FROM products`)
console.log(`Total products in DB: ${count[0].n}`)
