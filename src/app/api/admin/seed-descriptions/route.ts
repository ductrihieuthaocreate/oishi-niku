import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const descriptions: { keyword: string; desc: string }[] = [
  // Pork
  { keyword: 'BA CHỈ KHÔNG DA',  desc: 'Lean pork belly with the skin removed. Thinly sliced and vacuum-packed. Great for grilling, hot pot, or stir-fry — cooks quickly and absorbs marinades beautifully.' },
  { keyword: 'CUỐNG HỌNG',       desc: 'Pork throat with natural cartilage. Tender and slightly chewy, popular in Vietnamese and Japanese cuisine. Excellent grilled over charcoal or simmered in broth.' },
  { keyword: 'CẬT HEO',         desc: 'Fresh pork kidney, cleaned and ready to cook. Rich in iron and protein. Best prepared quickly over high heat — slice thin, marinate, and stir-fry or grill.' },
  { keyword: 'DA HEO',           desc: 'Pork skin rich in natural collagen. Ideal for slow-cooked soups and broths where it melts into a silky texture. Also used to make crispy crackling.' },
  { keyword: 'DIỀM',             desc: 'Pork skirt — a thin, flavourful cut from the belly edge. Cooks fast and pairs well with bold seasonings. Perfect for grilling or quick stir-fry dishes.' },
  { keyword: 'DẠ DÀY',           desc: 'Cleaned pork stomach with a firm, satisfying texture. A staple in Vietnamese braised dishes, soups, and hot pot. Pre-cleaned and ready to season.' },
  { keyword: 'HEO TƯƠI',         desc: 'Fresh premium pork, sourced and frozen at peak quality. Versatile cut suitable for a wide range of cooking methods from roasting to braising.' },
  { keyword: 'HEO VỤN',          desc: 'Mixed pork trimmings — an economical and flavourful option for minced dishes, dumplings, spring rolls, or adding depth to any pork-based recipe.' },
  { keyword: 'KHẤU ĐUÔI',        desc: 'Pork rump — a lean cut from near the tail. Slightly firm with good flavour. Works well roasted, braised, or cut into cubes for stews and curries.' },
  { keyword: 'LÁ LÁCH',          desc: 'Pork spleen, an iron-rich organ meat with a mild, smooth flavour. Often used in Vietnamese soups (cháo) and traditional braised dishes.' },
  { keyword: 'LÒNG NON',         desc: 'Cleaned pork small intestine with a delicate, tender texture. A classic ingredient in Vietnamese bún bò Huế, lẩu, and grilled intestine skewers.' },
  { keyword: 'LƯỠI HEO',         desc: 'Pork tongue — smooth, tender, and rich in flavour. Excellent braised low and slow or served cold and sliced thin. A favourite in charcuterie and Vietnamese cuisine.' },
  { keyword: 'MÓNG CẮT',         desc: 'Pig trotters cut into pieces, packed with collagen and gelatine. Perfect for slow-cooked braised dishes and pho broth that is rich and naturally thick.' },
  { keyword: 'MỠ HEO',           desc: 'Pure pork back fat for rendering into lard or adding richness to dishes. Essential for traditional Vietnamese cooking — fragrant fried shallot lard (mỡ hành).' },
  { keyword: 'NẦM HEO',          desc: 'Pork udder — a unique specialty cut with a soft, creamy texture. Lightly marinated and grilled, it is a popular delicacy in Vietnamese street food.' },
  { keyword: 'NỌNG HEO',         desc: 'Pork jowl (cheek) — well-marbled with fat and wonderfully flavourful. Ideal for slow braising, curing, or slicing thin for hot pot. Rich taste and silky texture.' },
  { keyword: 'SƯỜN SỤN',         desc: 'Pork cartilage ribs — tender cartilage attached to the rib bone. Slow-cook or pressure-cook until the cartilage becomes soft and gelatinous. Great for soups and stews.' },
  { keyword: 'TAI HEO',          desc: 'Pig ear — crispy cartilage with a satisfying crunch when cooked correctly. Classic in cold Vietnamese salads, braised dishes, and as a grilled street food snack.' },
  { keyword: 'THỊT XAY',         desc: 'Freshly ground pork with a balanced fat ratio. Ready to use in dumplings, meatballs, bánh mì, spring rolls, or any dish that calls for minced pork.' },
  { keyword: 'TIM HEO',          desc: 'Pork heart — lean, firm, and high in protein. Slice thin and marinate before grilling or pan-frying. A clean flavour that pairs well with lemongrass and garlic.' },
  { keyword: 'TRÀNG HEO',        desc: 'Large intestine (pig intestine) — thoroughly cleaned. A crowd favourite in Vietnamese cuisine, excellent grilled, stir-fried with ginger, or added to lẩu.' },
  { keyword: 'TRÀNG TRỨNG GÀ',   desc: 'Chicken ovary with soft egg clusters still attached — a rare, prized delicacy. Silky texture with a rich, eggy flavour. Wonderful in Vietnamese soups and hot pot.' },
  { keyword: 'XƯƠNG LƯNG HEO',   desc: 'Pork spine (back bone) — meaty and full of collagen. The foundation of rich, clear pork broth. Roast first for extra depth, then simmer for hours.' },
  { keyword: 'XƯƠNG NHIỀU THỊT', desc: 'Pork bones with generous meat still attached. Excellent for slow-simmered broth or braised dishes where both the bone marrow and the meat add richness.' },
  { keyword: 'XƯƠNG ỐNG HEO',    desc: 'Pork shin bone filled with rich bone marrow. Roast and scoop the marrow, or simmer long to create an intensely flavourful stock base for pho and ramen.' },
  { keyword: 'ĐUÔI HEO',         desc: 'Pig tail — mostly skin and collagen with small amounts of meat. Braise until meltingly tender for a sticky, deeply savoury dish beloved in Vietnamese cooking.' },
  { keyword: 'ĐẦU HEO BỔ ĐÔI',  desc: 'Half pig head — used to make traditional head cheese (giò thủ) or slow-cooked in soups. Includes cheek meat, snout, and ear for a variety of textures and flavours.' },
  // Beef
  { keyword: 'BẮP BÒ',           desc: 'Beef shank — a dense, lean cut that becomes fork-tender after slow braising. The central bone adds rich marrow flavour. Essential for Vietnamese bò kho and pho bò.' },
  { keyword: 'GÂN BÒ SỐT VANG',  desc: 'Beef tendon slow-braised in red wine sauce (sốt vang). Ready to heat and serve. Rich, melt-in-the-mouth texture — perfect over rice or with baguette.' },
  { keyword: 'GÂN BÒ TRẮNG',     desc: 'Raw white beef tendon — pure collagen that transforms with long cooking. Simmer for 4+ hours until silky and gelatinous. A must-have for pho and bún bò Huế.' },
  { keyword: 'KHĂN LÔNG BÒ',     desc: 'Beef bible tripe (omasum / third stomach) — thin layers with a honeycomb-like texture. Mild flavour, absorbs seasonings well. Ideal for hot pot, stir-fry, and soups.' },
  { keyword: 'MÔNG BÒ',          desc: 'Beef rump — a lean, versatile cut with good flavour. Slice thin for shabu-shabu or bulgogi, cube for stews, or roast whole. Well-suited to a wide range of dishes.' },
  { keyword: 'TỔ ONG BÒ',        desc: 'Beef honeycomb tripe — the most popular tripe cut, with its distinctive honeycomb pattern. Tender with a mild flavour when properly cleaned and cooked. Perfect for hot pot.' },
  { keyword: 'ĐUÔI BÒ',          desc: 'Oxtail — collagen-rich cuts that produce an incredibly gelatinous, deeply flavoured broth. Braise low and slow until the meat falls off the bone. A true comfort food classic.' },
  // Chicken
  { keyword: 'CHÂN GÀ DÀI',      desc: 'Long chicken feet — full of natural collagen and cartilage. Popular braised in soy and spices or deep-fried until crispy. A beloved snack and broth-booster.' },
  { keyword: 'CHÂN GÀ NGẮN',     desc: 'Short chicken feet — compact and collagen-rich. Great for slow-cooking in broths or marinating and braising. Soft, sticky, and deeply satisfying when cooked right.' },
  { keyword: 'CHÂN GÀ RÚT XƯƠNG',desc: 'Boneless chicken feet — all the collagen with none of the bones. Perfect for stuffing, marinating, or adding to soups. Saves prep time without sacrificing flavour.' },
  { keyword: 'GÀ DAI KHÔNG ĐẦU', desc: 'Headless free-range (tough) chicken — firm, flavourful meat from naturally raised birds. The chewy texture is prized in Vietnamese cuisine. Excellent for pho gà and cháo gà.' },
  { keyword: 'GÀ MÁI NGON SIZE L','desc': 'Premium quality hen, size Large — rich flavour from matured free-range birds. Ideal for slow-cooked soups, poached dishes, and traditional Vietnamese family recipes.' },
  { keyword: 'GÀ MÁI NGON SIZE M','desc': 'Premium quality hen, size Medium — tender and flavourful, perfect for everyday cooking. Great for boiling, steaming, braising, or making a rich, clear chicken soup.' },
  { keyword: 'ĐÙI GÀ DAI',       desc: 'Free-range chicken thigh — bone-in, with firm and flavourful meat. Higher fat content than breast gives it natural juiciness. Perfect for grilling, braising, and roasting.' },
  { keyword: 'ĐÙI GÀ DAI RÚT XƯƠNG','desc': 'Boneless free-range chicken thigh — all the rich flavour of free-range chicken with the convenience of no bones. Quick to cook, great for stir-fry, grilling, or stuffing.' },
]

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let updated = 0
  let skipped = 0

  for (const { keyword, desc } of descriptions) {
    const result = await sql`
      UPDATE products SET description = ${desc}
      WHERE name ILIKE ${'%' + keyword + '%'}
        AND (description IS NULL OR description = '')
    `
    const count = (result as any).count ?? (Array.isArray(result) ? result.length : 0)
    if (count > 0) updated++
    else skipped++
  }

  const all = await sql`SELECT id, name, LEFT(description, 60) AS desc_preview FROM products ORDER BY name`
  return NextResponse.json({ updated, skipped, products: all })
}
