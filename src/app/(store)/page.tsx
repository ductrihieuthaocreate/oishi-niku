import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { sql } from '@/lib/db'
import { ProductCard } from '@/components/product/product-card'
import { HeroSection } from '@/components/home/hero-section'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import type { Product } from '@/lib/types'


const faqs = [
  { q: 'What is the minimum order quantity?', a: 'Our minimum order is 20kg per product. For mixed pallets, the minimum total order is 100kg. Volume discounts apply automatically at 200kg, 500kg, and 1000kg thresholds.' },
  { q: 'How is the frozen meat packaged and shipped?', a: 'All products are vacuum-sealed and packed in insulated cartons with dry ice. We maintain a full cold chain from our warehouse to your door, ensuring product temperature never exceeds -18°C.' },
  { q: 'What certifications do your products carry?', a: 'Our supply chain is HACCP certified and all products meet international food safety standards. We can provide full traceability documentation, halal certification, and country-of-origin certificates on request.' },
  { q: 'Do you offer custom cuts for restaurants or hotels?', a: 'Yes. We offer custom portioning, trimming, and labelling for B2B clients with recurring orders. Contact us to discuss your specification requirements.' },
  { q: 'What are the payment and credit terms?', a: 'We accept bank transfer, and offer NET-30 credit terms for approved business accounts. First-time orders require prepayment. Contact our sales team to apply for a trade account.' },
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
              <p className="text-primary font-medium tracking-widest uppercase mb-1 text-xs sm:text-sm">Our Product Range</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-wider text-foreground">AVAILABLE PRODUCTS</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              View All <ArrowRight className="w-4 h-4" />
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
              <p className="text-muted-foreground text-lg mb-2">No featured products yet</p>
              <p className="text-sm text-muted-foreground">Add products in the admin dashboard and mark them as featured.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline"><Link href="/products">View All Products</Link></Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 lg:py-24 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-medium tracking-widest uppercase mb-4">Trade Enquiries</p>
            <h2 className="font-heading text-4xl lg:text-5xl tracking-wider text-foreground">FREQUENTLY ASKED QUESTIONS</h2>
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
            <p className="text-primary font-medium tracking-widest uppercase mb-4">Partner With Us</p>
            <h2 className="font-heading text-4xl lg:text-5xl tracking-wider text-foreground mb-6">OPEN A TRADE ACCOUNT</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Restaurants, hotels, and food distributors — get access to wholesale pricing, NET-30 credit terms, and a dedicated account manager.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your business email"
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading tracking-wider px-8">
                APPLY NOW
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
