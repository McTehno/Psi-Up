import { motion, MotionValue } from 'framer-motion'

// Module groupings explicitly mapped to follow the right-side downward slopes of the 4 submountains
// The coordinates feature a decreasing steepness (delta Y / delta X) to mimic natural curvature
const modules = [
  {
    id: 'mod1_bottom',
    color: 'rgba(187, 166, 136, 0.95)', // Warm Beige / Brown 300
    glowColor: 'rgba(187, 166, 136, 0.5)',
    orbs: [
      { id: 'u1', top: '72%', left: '59%', delay: 0 },
      { id: 'u2', top: '77%', left: '63%', delay: 0.2 },
      { id: 'u3', top: '85%', left: '70%', delay: 0.4 },
      { id: 'u4', top: '91%', left: '80%', delay: 0.1 },
    ],
  },
  {
    id: 'mod2_mid',
    color: 'rgba(215, 202, 180, 0.95)', // Sand / Grey-Beige
    glowColor: 'rgba(215, 202, 180, 0.5)',
    orbs: [
      { id: 'u5', top: '58%', left: '65%', delay: 0.5 },
      { id: 'u6', top: '68%', left: '69%', delay: 0.7 },
      { id: 'u7', top: '76%', left: '76%', delay: 0.3 },
      { id: 'u7b', top: '82%', left: '86%', delay: 0.8 },
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

export default function GlowingOrbs() {
  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none z-50">
      {modules.map((mod) => (
        <div key={mod.id}>
          {mod.orbs.map((orb) => (
            <motion.div
              key={orb.id}
              className="absolute rounded-full"
              style={{
                top: orb.top,
                left: orb.left,
                width: '10px',
                height: '10px',
                backgroundColor: mod.color,
                boxShadow: `0 0 16px 6px ${mod.glowColor}, 0 0 32px 12px ${mod.glowColor}`,
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
          ))}
        </div>
      ))}
    </div>
  )
}
