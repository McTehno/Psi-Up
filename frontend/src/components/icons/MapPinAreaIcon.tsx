import type { CSSProperties } from 'react'

type MapPinAreaIconProps = {
  size?: number | string
  color?: string
  opacity?: number
  rotation?: number
  shadow?: number
  flipHorizontal?: boolean
  flipVertical?: boolean
  className?: string
  style?: CSSProperties
}

function MapPinAreaIcon({
  size = 24,
  color = 'currentColor',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  className,
  style,
}: MapPinAreaIconProps) {
  const transforms: string[] = []

  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`)
  if (flipHorizontal) transforms.push('scaleX(-1)')
  if (flipVertical) transforms.push('scaleY(-1)')

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill={color}
      className={className}
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
        filter:
          shadow > 0
            ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))`
            : undefined,
        ...style,
      }}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M112 80a16 16 0 1 1 16 16a16 16 0 0 1-16-16m-48 0a64 64 0 0 1 128 0c0 59.95-57.58 93.54-60 94.95a8 8 0 0 1-7.94 0C121.58 173.54 64 140 64 80m16 0c0 42.2 35.84 70.21 48 78.5c12.15-8.28 48-36.3 48-78.5a48 48 0 0 0-96 0m122.77 67.63a8 8 0 0 0-5.54 15C213.74 168.74 224 176.92 224 184c0 13.36-36.52 32-96 32s-96-18.64-96-32c0-7.08 10.26-15.26 26.77-21.36a8 8 0 0 0-5.54-15C29.22 156.49 16 169.41 16 184c0 31.18 57.71 48 112 48s112-16.82 112-48c0-14.59-13.22-27.51-37.23-36.37" />
    </svg>
  )
}

export default MapPinAreaIcon

