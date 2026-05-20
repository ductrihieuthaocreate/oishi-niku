import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { sql } from '@/lib/db'
import { ProductCard } from '@/components/product/product-card'
import { HeroSection } from '@/components/home/hero-section'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'


const faqs = [
  { q: '最小注文数量はどのくらいですか？', a: '1商品あたり最小20kgからご注文いただけます。混載パレットの場合、最小注文合計は100kgです。200kg、500kg、1000kgの各基準で数量割引が自動適用されます。' },
  { q: '冷凍肉の梱包・配送方法は？', a: '全商品は真空パックの上、ドライアイス入りの断熱カートンで梱包されます。倉庫からお届け先まで完全なコールドチェーンを維持し、製品温度が-18℃を超えることはありません。' },
  { q: '商品はどのような認証を取得していますか？', a: 'サプライチェーン全体がHACCP認証を取得しており、全商品が国際食品安全基準を満たしています。ご要望に応じて、完全なトレーサビリティ証明書、ハラール認証、原産国証明書を提供できます。' },
  { q: 'レストランやホテル向けのカスタムカットは対応可能ですか？', a: 'はい。定期注文のB2Bクライアント様には、カスタムポーション加工、トリミング、ラベリングに対応しています。仕様要件についてはお気軽にお問い合わせください。' },
  { q: '支払い・クレジット条件はどうなっていますか？', a: '銀行振込をお受けしており、承認済み法人口座にはNET-30の支払い条件を提供しています。初回注文は前払いが必要です。取引口座の開設については営業チームまでお問い合わせください。' },
]

async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await sql`
    SELECT p.*, p.price::float8 AS price,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_featured = true AND p.stock > 0
    ORDER BY p.sales_count DESC
    LIMIT 8
  `
  return rows as unknown as Product[]
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Featured Products */}
      <section className="py-10 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-7 lg:mb-12">
            <div>
              <p className="text-primary font-medium tracking-widest uppercase mb-1 text-xs sm:text-sm">商品ラインナップ</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-wider text-foreground">取扱商品</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-lg mb-2">おすすめ商品はまだありません</p>
              <p className="text-sm text-muted-foreground">管理画面から商品を追加し、おすすめに設定してください。</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline"><Link href="/products">すべての商品を見る</Link></Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 lg:py-24 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-medium tracking-widest uppercase mb-4">取引に関するお問い合わせ</p>
            <h2 className="font-heading text-4xl lg:text-5xl tracking-wider text-foreground">よくある質問</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4" id="faq">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0">
                <div className="bg-secondary/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <span className="font-heading tracking-wider text-foreground text-left">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0">
                    <p className="text-muted-foreground">{faq.a}</p>
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-2xl p-8 lg:p-16 text-center">
            <p className=”text-primary font-medium tracking-widest uppercase mb-4”>パートナーになる</p>
            <h2 className=”font-heading text-4xl lg:text-5xl tracking-wider text-foreground mb-6”>取引口座を開設する</h2>
            <p className=”text-lg text-muted-foreground max-w-2xl mx-auto mb-8”>
              レストラン、ホテル、食品卸業者の方へ — 卸売価格、NET-30 支払条件、専任アカウントマネージャーをご利用いただけます。
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="ビジネスメールアドレスを入力"
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wider px-8">
                今すぐ申し込む
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
