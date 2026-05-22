import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const dims = { sm: 28, md: 36, lg: 48 }
  const px = dims[size]
  const textSizes = {
    sm: { brand: 'text-base', sub: 'text-[7px]' },
    md: { brand: 'text-xl',   sub: 'text-[8px]' },
    lg: { brand: 'text-2xl',  sub: 'text-[9px]' },
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon badge */}
      <div
        className="rounded-xl flex items-center justify-center flex-shrink-0 bg-primary shadow-sm"
        style={{ width: px, height: px }}
      >
        <Image
          src="/meat.png"
          alt="Oishi Niku"
          width={Math.round(px * 0.7)}
          height={Math.round(px * 0.7)}
          className="object-contain brightness-0 invert"
          priority
        />
      </div>

      {/* Text lockup */}
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
