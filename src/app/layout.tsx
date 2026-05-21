import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const montserrat = localFont({
  src: [
    { path: '../../public/fonts/Montserrat-Regular.otf',   weight: '400', style: 'normal' },
    { path: '../../public/fonts/Montserrat-Medium.otf',    weight: '500', style: 'normal' },
    { path: '../../public/fonts/Montserrat-SemiBold.otf',  weight: '600', style: 'normal' },
    { path: '../../public/fonts/Montserrat-Bold.otf',      weight: '700', style: 'normal' },
    { path: '../../public/fonts/Montserrat-ExtraBold.otf', weight: '800', style: 'normal' },
    { path: '../../public/fonts/Montserrat-Black.otf',     weight: '900', style: 'normal' },
  ],
  variable: '--font-heading',
})

const montserratBody = localFont({
  src: [
    { path: '../../public/fonts/Montserrat-Regular.otf',  weight: '400', style: 'normal' },
    { path: '../../public/fonts/Montserrat-Medium.otf',   weight: '500', style: 'normal' },
    { path: '../../public/fonts/Montserrat-SemiBold.otf', weight: '600', style: 'normal' },
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
    <html lang="ja" className={`${montserrat.variable} ${montserratBody.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
