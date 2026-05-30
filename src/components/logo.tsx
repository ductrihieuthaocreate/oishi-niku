import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const dims = { sm: 32, md: 40, lg: 52 }
  const px = dims[size]
  const textSizes = {
    sm: { brand: 'text-base', sub: 'text-[7px]' },
    md: { brand: 'text-xl',   sub: 'text-[8px]' },
    lg: { brand: 'text-2xl',  sub: 'text-[9px]' },
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0" style={{ width: px, height: px }}>
        <Image
          src="/oishi-logo.png"
          alt="Oishi Niku"
          width={px}
          height={px}
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none gap-0.5">
          <span
            className={`font-serif font-semibold tracking-[0.12em] text-foreground ${textSizes[size].brand}`}
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Oishi Niku
          </span>
          <span
            className={`tracking-[0.25em] text-muted-foreground uppercase font-medium ${textSizes[size].sub}`}
          >
            Premium Meats
          </span>
        </div>
      )}
    </div>
  )
}
