import pg from 'pg'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const client = new pg.Client({ connectionString: env.DATABASE_URL })
await client.connect()
console.log('Connected!')

const { rows: cats } = await client.query('SELECT id, slug FROM categories')
const catId = Object.fromEntries(cats.map(c => [c.slug, c.id]))
console.log('Categories:', catId)

const products = [
  ['ĐẦU HEO BỔ ĐÔI 豚頭半割り HALF PIG HEAD','dau-heo-bo-doi',650,'pork'],
  ['TRÀNG HEO 豚腸 PIG INTESTINE','trang-heo',880,'pork'],
  ['XƯƠNG NHIỀU THỊT 肉付き豚骨 MEATY PORK BONES','xuong-nhieu-thit',480,'pork'],
  ['KHẤU ĐUÔI 豚尾根 PORK RUMP','khau-duoi',950,'pork'],
  ['HEO VỤN 豚端材 PORK OFFCUTS','heo-vun',680,'pork'],
  ['NẦM HEO 豚乳房 PORK UDDER','nam-heo',1100,'pork'],
  ['DIỀM 豚スカート PORK SKIRT','diem-heo',680,'pork'],
  ['BA CHỈ KHÔNG DA 皮なし豚バラ SKINLESS PORK BELLY','ba-chi-ko-da',1000,'pork'],
  ['NỌNG HEO 豚頬肉 PORK JOWL','nong-heo',480,'pork'],
  ['XƯƠNG ỐNG HEO 豚すね骨 PORK LEG BONE','xuong-ong-heo',350,'pork'],
  ['XƯƠNG LƯNG HEO 豚背骨 PORK SPINE','xuong-lung-heo',330,'pork'],
  ['ĐUÔI HEO 豚しっぽ PIG TAIL','duoi-heo',480,'pork'],
  ['TIM HEO 豚ハート PORK HEART','tim-heo',450,'pork'],
  ['LÁ LÁCH 豚脾臓 PORK SPLEEN','la-lach',380,'pork'],
  ['THỊT XAY 豚ひき肉 GROUND PORK','thit-xay',720,'pork'],
  ['SƯỜN SỤN 豚軟骨 PORK CARTILAGE RIBS','suon-sun',680,'pork'],
  ['LÒNG NON 豚小腸 SMALL INTESTINE','long-non',550,'pork'],
  ['LÒNG NGỌT 豚大腸 LARGE INTESTINE','long-ngot',700,'pork'],
  ['LƯỠI HEO 豚タン PORK TONGUE','luoi-heo',780,'pork'],
  ['CUỐNG HỌNG 豚のど PORK THROAT','cuong-hong',450,'pork'],
  ['DẠ DÀY 豚胃 PORK STOMACH','da-day',420,'pork'],
  ['HEO TƯƠI 新鮮豚肉 FRESH PORK','heo-tuoi',680,'pork'],
  ['CẬT HEO 豚腎臓 PORK KIDNEY','cat-heo',460,'pork'],
  ['MÓNG CẮT 豚足カット PIG TROTTERS','mong-cat',390,'pork'],
  ['TAI HEO 豚耳 PIG EAR','tai-heo',460,'pork'],
  ['MỠ HEO 豚脂 PORK FAT','mo-heo',410,'pork'],
  ['DA HEO 豚皮 PORK SKIN','da-heo',380,'pork'],
  ['ĐUÔI BÒ 牛テール OXTAIL','duoi-bo',1150,'beef'],
  ['TỔ ONG BÒ 牛ハチノス BEEF HONEYCOMB TRIPE','to-ong-bo',1100,'beef'],
  ['KHĂN LÔNG BÒ 牛センマイ BEEF BLANKET TRIPE','khan-long-bo',1200,'beef'],
  ['GÂN BÒ TRẮNG 牛スジ白 WHITE BEEF TENDON','gan-bo-trang',950,'beef'],
  ['GÂN BÒ SỐT VANG 牛スジ赤煮 BRAISED BEEF TENDON','gan-bo-sot-vang',950,'beef'],
  ['MÔNG BÒ 牛もも BEEF RUMP','mong-bo',1880,'beef'],
  ['BẮP BÒ 牛すね肉 BEEF SHANK','bap-bo',1980,'beef'],
  ['GÀ DAI KHÔNG ĐẦU 地鶏頭なし TOUGH CHICKEN HEADLESS','ga-dai-ko-dau',460,'chicken'],
  ['GÀ MÁI NGON SIZE M 雌鶏Mサイズ HEN SIZE M','ga-mai-ngon-m',880,'chicken'],
  ['GÀ MÁI NGON SIZE L 雌鶏Lサイズ HEN SIZE L','ga-mai-ngon-l',990,'chicken'],
  ['ĐÙI GÀ DAI 地鶏もも TOUGH CHICKEN THIGH','dui-ga-dai',660,'chicken'],
  ['ĐÙI GÀ DAI RÚT XƯƠNG 地鶏もも骨なし BONELESS TOUGH CHICKEN THIGH','dui-ga-dai-rut-xuong',660,'chicken'],
  ['CHÂN GÀ RÚT XƯƠNG 鶏足骨なし BONELESS CHICKEN FEET','chan-ga-rut-xuong',950,'chicken'],
  ['TRÀNG TRỨNG GÀ 鶏卵巣 CHICKEN OVARY','trang-trung-ga',520,'chicken'],
  ['CHÂN GÀ NGẮN 鶏足短 SHORT CHICKEN FEET','chan-ga-ngan',350,'chicken'],
  ['CHÂN GÀ DÀI 鶏足長 LONG CHICKEN FEET','chan-ga-dai',390,'chicken'],
]

let inserted = 0
for (const [name, slug, price, cat] of products) {
  const cid = catId[cat]
  if (!cid) { console.log(`No category: ${cat}`); continue }
  const r = await client.query(
    `INSERT INTO products (name, slug, price, stock, category_id, is_featured, sales_count)
     VALUES ($1,$2,$3,99,$4,false,0) ON CONFLICT (slug) DO NOTHING`,
    [name, slug, price, cid]
  )
  if (r.rowCount > 0) { console.log(`✓ ${name}`); inserted++ }
  else console.log(`skip: ${slug}`)
}

console.log(`\nDone: ${inserted} inserted`)
await client.end()
