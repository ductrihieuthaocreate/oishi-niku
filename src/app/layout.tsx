import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
})

const montserratBody = Montserrat({
  weight: ['400', '500', '600'],
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
    <html lang="ja" className={`${montserrat.variable} ${montserratBody.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
