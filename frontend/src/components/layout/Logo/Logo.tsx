import favicon from '../../../assets/favicon.svg'

type LogoProps = {
  label?: string
  hideLabel?: boolean
  className?: string
  iconContainerClassName?: string
  iconClassName?: string
}

function Logo({ 
  label = 'Psi-Up', 
  hideLabel = false, 
  className = '',
  iconContainerClassName = 'h-11 w-11 rounded-full bg-white shadow-sm border border-sand-200',
  iconClassName = 'h-6 w-6'
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex items-center justify-center ${iconContainerClassName}`}>
        <img 
          src={favicon} 
          alt={`${label} Logo`}
          className={iconClassName} 
        />
      </div>
      {!hideLabel && (
        <span className="font-display text-xl font-bold text-brown-900">
          {label}
        </span>
      )}
    </div>
  )
}

export default Logo

