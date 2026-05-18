import Image from 'next/image'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/meat.png"
      alt="Oishi Niku"
      width={size}
      height={size}
      className="object-contain"
      priority
    />
  )
}
