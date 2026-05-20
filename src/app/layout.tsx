import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
})

const beVietnamProBody = Be_Vietnam_Pro({
  weight: ['400', '500'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Oishi Niku — プレミアム精肉',
    template: '%s | Oishi Niku',
  },
  description: '最高品質の農場から厳選した精肉。和牛、豚肉、鶏肉など、新鮮なままお届けします。',
  icons: { icon: '/meat.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${beVietnamPro.variable} ${beVietnamProBody.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
