# Homepage Architecture & Parallax Handover

**To the next AI Assistant:** 
This document contains extremely detailed technical insights, math breakdowns, and architectural decisions made during the heavy refactoring of the Homepage's scroll-driven parallax environment. Please read this carefully to understand *why* the code is structured the way it is before making any modifications to `HomePage.tsx` or `HomeParallaxEnvironment.tsx`.

---

## 1. Structural Overhaul & The "Z-Index Sandwich"

### The Consolidation
Previously, the homepage relied on a separate `HomeBackground` component which generated static blurred orbs and gradients, and a separate parallax component. This caused code smells, performance issues, and layering conflicts. 
- **Action:** We deleted `HomeBackground.tsx` entirely. 
- **Solution:** We migrated its specific CSS (`radial-gradient` sky colors and `blur-3xl` orbs) directly into the absolute base layer (Layer 1) of `HomeParallaxEnvironment.tsx`.

### The Strict Z-Index Stack
Because the page features scroll-triggered text cards, a scrolling SVG journey line, a global search overlay, and the parallax background, a strict z-index architecture is mandatory. If you add new components, they **must** adhere to this stack:
- **`-z-30`**: `HomeParallaxEnvironment` (The absolute bottom). Must have `pointer-events-none`.
- **`-z-20`**: `HomeScrollJourney` (The SVG path. Sits *above* the background, but *below* the cards).
- **`z-10`** (default): `HomeStorySection` (Content cards and text block).
- **`z-40`**: Search Blur Overlay (Triggered by global search).
- **`z-50`**: Search Dropdown & Results.

---

## 2. The `500vh` Scroll Architecture & Un-pinning Logic

### Why 500vh?
We added massive spacer divs (`h-[56vh]` mobile / `h-[70vh]` desktop) between all the `HomeStorySection` blocks to give the scroll-triggered animations time to breathe. As a result, the `main` page is now incredibly long (over 800vh).

Initially, the parallax container was hardcoded to `height: 300vh`. This caused a severe bug: the background would physically end and scroll out of view right before the user reached the "Moduli" cards. 

**The Fix:** We increased the container height to `500vh`. 
- `scrollYProgress` (from `useScroll`) now maps from `0` to `1` across exactly `500vh` of scroll depth.
- The `sticky` container inside the parallax wrapper stays pinned to the screen for exactly 500vh.
- **The Genius Part:** 500vh perfectly covers the Hero, the first spacer, "Učne poti", the second spacer, and "Moduli". Immediately after the user scrolls past the Moduli spacer (entering "Učne enote"), the parallax container hits its 500vh limit and **naturally un-pins and scrolls upward out of view**. 
- Because the `body` tag in `index.css` has a fixed background gradient that perfectly matches Layer 1 of the parallax environment, the transition is invisible. The mountains scroll away into the sky, leaving a clean gradient background for the bottom half of the page (Učne enote, Vprašalnik, CTA) where future content can be safely added.

---

## 3. The Cloud Video (`fog-background.mp4`)

### The "Invisible Barrier" Bug
Initially, the `useTransform` for the clouds stopped mapping at `0.50` scroll progress. If a user scrolled past 0.50, the clouds stopped moving completely, making it feel like they hit an invisible wall.
- **Fix:** Mapped the transforms all the way to `1` (`[0, 0.20, 0.60, 1] -> ['0%', '-15%', '-110%', '-150%']`). The clouds now drift smoothly and continuously as long as you scroll.

### Initial Masking
On page load, the clouds are scaled to `h-[130%]` and completely cover the mountains. We used a CSS `WebkitMaskImage` (`linear-gradient(to bottom, black 0%, black 70%, transparent 100%)`) so the bottom edge of the video fades softly into the mountain rather than creating a harsh horizontal line.

---

## 4. Mountain Alignment & The Navbar Cropping Fix

### The Problem
The original mountain image was anchored with `bottom-0` and `object-bottom` in a `120%` height container. This explicitly pushed the top 20% of the image *above* the viewport, completely chopping off the mountain peaks (especially behind the transparent navbar).

### The "Filler Space" Solution
- Changed container to `top-0` and image to `object-center`.
- Added **`pt-[12vh]`** to the mountain `motion.div`. 
- **How it works:** This pushes the actual `<img>` down by 12vh, safely below the navbar. Because the `motion.div` itself is transparent, this 12vh gap reveals Layer 1 (the warm gradient base) behind the navbar. 
- We use an `absolute top-0 h-[30%]` vignette gradient overlay that sits *on top* of this gap. It blends the empty 12vh space flawlessly into the top edge of the mountain image. It looks like a single continuous sky.

---

## 5. The Cinematic "Učne Poti" → "Moduli" Transition

The most complex logic in the file governs the transition between `path-mountain.webp` (base) and `module-mountain.webp` (glowing peaks) as the user scrolls from the first section to the second.

### Layout Adjustment
- We changed the "Moduli" `HomeStorySection` alignment from `right` to `left` in `HomePage.tsx`. If it stayed on the right, the blurred text cards would have completely covered the glowing peaks.

### The Stack
Both mountain images are absolutely positioned on top of each other inside a `relative w-full h-full` wrapper inside the padded mountain container.

### The Math (Slowed Down for UX)
The scroll gap between "Učne poti" and "Moduli" occurs roughly between `0.40` and `0.70` scroll progress in our 500vh environment.

1. **The Zoom (`mountainScale`):** 
   - Maps `[0, 0.40, 0.70, 1]` to `[1.05, 1.05, 1.15, 1.15]`.
   - The entire mountain container subtly zooms in during this gap, creating a psychological effect of "diving deeper" into the specific modules.

2. **The Bottom-to-Top Wipe (`moduleGlowMask`):**
   - Instead of a basic opacity fade, we implemented a highly modern gradient wipe to reveal the glowing `module-mountain.webp`.
   - Mapped `glowReveal` from `-20` to `120` across the `[0.40, 0.70]` scroll window.
   - Used Framer Motion's `useMotionTemplate` to dynamically update a CSS mask: 
     ``linear-gradient(to top, rgba(0,0,0,1) ${glowReveal}%, rgba(0,0,0,0) calc(${glowReveal}% + 20%))``
   - **Result:** At `0.40` scroll, the mask is completely transparent. As the user scrolls, the opaque mask slides up from the bottom, causing the glowing highlights to visually "light up" from the base of the mountain upward. 

---

### End of Document
**Before touching the Parallax:** If you need to change timings, remember that `0.10` progress equals `50vh` of physical scrolling. Do not break the `0.40` to `0.70` interval, as it is perfectly aligned with the DOM spacing in `HomePage.tsx`.
