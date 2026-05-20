import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const beVietnamPro = localFont({
  src: [
    { path: '../../public/fonts/BeVietnamPro-Regular.ttf',   weight: '400', style: 'normal' },
    { path: '../../public/fonts/BeVietnamPro-Medium.ttf',    weight: '500', style: 'normal' },
    { path: '../../public/fonts/BeVietnamPro-SemiBold.ttf',  weight: '600', style: 'normal' },
    { path: '../../public/fonts/BeVietnamPro-Bold.ttf',      weight: '700', style: 'normal' },
    { path: '../../public/fonts/BeVietnamPro-ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-heading',
})

const beVietnamProBody = localFont({
  src: [
    { path: '../../public/fonts/BeVietnamPro-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/BeVietnamPro-Medium.ttf',  weight: '500', style: 'normal' },
  ],
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
