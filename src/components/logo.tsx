import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const dims = { sm: 32, md: 40, lg: 52 }
  const px = dims[size]
  const textSizes = {
    sm: { brand: 'text-[15px]', sub: 'text-[7px]' },
    md: { brand: 'text-[18px]', sub: 'text-[8px]' },
    lg: { brand: 'text-[22px]', sub: 'text-[9px]' },
  }

  return (
    <div className="flex items-center gap-2">
      <Image
        src="/oishi-logo.png"
        alt="Oishi Niku"
        width={px}
        height={px}
        className="object-contain flex-shrink-0"
        priority
      />

      {showText && (
        <div className="flex flex-col justify-center">
          <span
            className={`font-serif font-semibold tracking-[0.08em] text-foreground leading-tight ${textSizes[size].brand}`}
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Oishi Niku
          </span>
          <span
            className={`tracking-[0.22em] text-muted-foreground uppercase font-medium leading-tight ${textSizes[size].sub}`}
          >
            Premium Meats
          </span>
        </div>
      )}
    </div>
  )
}
