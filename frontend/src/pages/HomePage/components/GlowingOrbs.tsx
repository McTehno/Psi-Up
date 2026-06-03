import { useState } from 'react'
import { motion, MotionValue, useTransform, useMotionTemplate, useMotionValueEvent, AnimatePresence } from 'framer-motion'

// Theme Colors
const GREEN_COLOR = 'rgba(47, 74, 49, 1)' // #2f4a31
const GREEN_GLOW = 'rgba(47, 74, 49, 0.6)'

type OrbConfig = {
  id: string
  top: string
  left: string
  delay: number
  greenRange?: [number, number]
  hasLocationPin?: boolean
}

type ModuleConfig = {
  id: string
  color: string
  glowColor: string
  orbs: OrbConfig[]
}

// Module groupings explicitly mapped to follow the right-side downward slopes of the 4 submountains
// The coordinates feature a decreasing steepness (delta Y / delta X) to mimic natural curvature
const modules: ModuleConfig[] = [
  {
    id: 'mod1_bottom',
    color: 'rgba(187, 166, 136, 0.95)', // Warm Beige / Brown 300
    glowColor: 'rgba(187, 166, 136, 0.5)',
    orbs: [
      { id: 'u1', top: '72%', left: '59%', delay: 0, greenRange: [0.74, 0.77] },
      { id: 'u2', top: '77%', left: '63%', delay: 0.2, greenRange: [0.72, 0.75] },
      { id: 'u3', top: '85%', left: '70%', delay: 0.4, greenRange: [0.70, 0.73] },
      { id: 'u4', top: '91%', left: '80%', delay: 0.1, greenRange: [0.68, 0.71] },
    ],
  },
  {
    id: 'mod2_mid',
    color: 'rgba(215, 202, 180, 0.95)', // Sand / Grey-Beige
    glowColor: 'rgba(215, 202, 180, 0.5)',
    orbs: [
      { id: 'u5', top: '58%', left: '65%', delay: 0.5, greenRange: [0.82, 0.85], hasLocationPin: true },
      { id: 'u6', top: '68%', left: '69%', delay: 0.7, greenRange: [0.80, 0.83] },
      { id: 'u7', top: '76%', left: '76%', delay: 0.3, greenRange: [0.78, 0.81] },
      { id: 'u7b', top: '82%', left: '86%', delay: 0.8, greenRange: [0.76, 0.79] },
    ],
  },
  {
    id: 'mod3_top',
    color: 'rgba(245, 240, 230, 0.95)', // Soft Warm Off-White / Cream
    glowColor: 'rgba(245, 240, 230, 0.5)',
    orbs: [
      { id: 'u8', top: '52%', left: '70%', delay: 0.6 },
      { id: 'u9', top: '59%', left: '76%', delay: 0.8 },
      { id: 'u10', top: '67%', left: '83%', delay: 0.2 },
      { id: 'u11', top: '73%', left: '93%', delay: 0.9 },
    ],
  },
  {
    id: 'mod4_highest',
    color: 'rgba(255, 255, 255, 0.98)', // Pure Luminescent White
    glowColor: 'rgba(255, 255, 255, 0.6)',
    orbs: [
      { id: 'u12', top: '39%', left: '74%', delay: 0.1 },
      { id: 'u13', top: '46%', left: '78%', delay: 0.4 },
      { id: 'u14', top: '54%', left: '85%', delay: 0.7 },
      { id: 'u15', top: '60%', left: '95%', delay: 0.2 },
    ],
  },
]

type OrbNodeProps = {
  orb: OrbConfig
  baseColor: string
  baseGlowColor: string
  scrollYProgress: MotionValue<number>
}

function OrbNode({ orb, baseColor, baseGlowColor, scrollYProgress }: OrbNodeProps) {
  // If the orb doesn't have a transition, just use a dummy mapped value that stays constant
  const input = orb.greenRange || [0, 1]
  const bgOutput = orb.greenRange ? [baseColor, GREEN_COLOR] : [baseColor, baseColor]
  const shadowOutput = orb.greenRange ? [baseGlowColor, GREEN_GLOW] : [baseGlowColor, baseGlowColor]

  const backgroundColor = useTransform(scrollYProgress, input, bgOutput)
  const shadowTransform = useTransform(scrollYProgress, input, shadowOutput)

  const boxShadow = useMotionTemplate`0 0 16px 6px ${shadowTransform}, 0 0 32px 12px ${shadowTransform}`

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        top: orb.top,
        left: orb.left,
        width: '10px',
        height: '10px',
        backgroundColor,
        boxShadow,
      }}
      animate={{
        y: [0, -10, 0],
        opacity: [0.7, 1, 0.7],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 3 + orb.delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: orb.delay,
      }}
    >
      {/* Inner core glow */}
      <div className="absolute inset-0 rounded-full bg-white opacity-80 blur-[1px]" />
    </motion.div>
  )
}

type GlowingOrbsProps = {
  scrollYProgress: MotionValue<number>
}

export default function GlowingOrbs({ scrollYProgress }: GlowingOrbsProps) {
  // Instead of useTransform which has notorious WebKit GPU culling bugs on hard refresh,
  // we trigger a React state when the user reaches the Vprašalnik section.
  const [showPin, setShowPin] = useState(false)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.82 && !showPin) {
      setShowPin(true)
    } else if (latest < 0.82 && showPin) {
      setShowPin(false)
    }
  })

  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none z-50">
      {/* The Orbs (Hidden on Mobile) */}
      <div className="hidden md:block">
        {modules.map((mod) => (
          <div key={mod.id}>
            {mod.orbs.map((orb) => (
              <OrbNode
                key={orb.id}
                orb={orb}
                baseColor={mod.color}
                baseGlowColor={mod.glowColor}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Standalone Location Pin (Mounted dynamically to completely avoid scroll-linked bugs) */}
      <div className="absolute pointer-events-none top-[58%] left-[90%] md:left-[65%] md:ml-[5px] -mt-[56px] -translate-x-1/2 z-[999]">
        <AnimatePresence>
          {showPin && (
            <motion.div
              initial={{ scale: 0, y: -30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: -20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center"
              >
                {/* Pure CSS background pulse */}
                <div className="absolute inset-0 rounded-full bg-white/40 z-20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 rounded-full bg-white/80 blur-[12px] scale-150" />

                <svg viewBox="0 0 24 24" fill="currentColor" className="relative w-12 h-12 text-[#2f4a31] drop-shadow-[0_0_8px_rgba(255,255,255,1)] z-10">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}