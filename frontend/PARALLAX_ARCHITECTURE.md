# NIDiKo Parallax Landing Page: Architecture & Implementation Guide

This document serves as a comprehensive master-guide for the frontend architecture, parallax animation mechanics, and storytelling structure of the NIDiKo landing page. It is written to bring any developer or AI agent fully up to speed on the technical and creative decisions made during the "Vibe Coding" phase of the project, detailing exactly how the current state operates.

---

## 1. Core Vision & Tech Stack
**The Goal:** Create a highly premium, immersive scrolling experience (an "Awwwards-winning" vibe) without using WebGL or Three.js. It must rely on buttery smooth scrolling and CSS/transform tricks to create a cinematic 3D depth effect.
**The Vibe:** Earthy, light cream/forest green palette (`#fffdf8`, `#2f4a31`). Organic, natural, and highly sleek.
**The Pedagogy:** The page walks the user through the learning structure: *Učne poti* (Macro) ➜ *Moduli* (Meso) ➜ *Učne enote* (Micro) ➜ *Vprašalnik* (Assessment).

**Tech Stack:**
- **React** & **Tailwind CSS**
- **Framer Motion**: used for `useScroll`, `useTransform`, and `useMotionTemplate` to map CSS properties directly to scroll progress.
- **@studio-freight/react-lenis**: Hijacks the native scroll for a buttery smooth wheel/touch experience.

---

## 2. Page Structure & Scaffolding (`HomePage.tsx`)

To make scroll-based animations work, the background environments and the foreground UI must be decoupled. 

### The Runway (Spacers)
A premium scrolling experience requires "runway"—time for the user to scroll where the background animates *before* the next piece of text arrives. 
Instead of stacking `HomeStorySection` cards right on top of each other, we use massive empty spacer height. `HomeStorySection` explicitly enforces this with a `min-h-[150vh]` wrapper with massive top/bottom padding (`py-52 lg:py-80`).

### The Z-Index Sandwich (Crucial!)
To prevent layers from crashing into each other, the page follows strict Z-indexing. **Failure to respect this will break the illusion (e.g. elements hiding behind the background).**
*   **-z-30**: `HomeParallaxEnvironment` (The absolute bottom/back: clouds, mountains).
*   **-z-20**: `HomeScrollJourney` (The SVG bezier curve line that draws itself down the page. Stays *over* the background, but *under* the text).
*   **z-10 / default**: The `HomeStorySection` cards (glassmorphic UI).
*   **z-40 / z-50**: Search states and dropdowns overlaying everything.

---

## 3. The `HomeParallaxEnvironment` Engine

The core of the "Wow Factor" lives in `HomeParallaxEnvironment.tsx`. 
It is an `800vh` tall absolute container with a `100vh` sticky inner viewport. As the user scrubs the `800vh` height, the sticky viewport stays pinned to the screen while Framer Motion mathematically updates the `y`, `scale`, and `maskImage` properties of the layers inside it based on the `scrollYProgress` (0 to 1).

### Phase 1: The Clouds & Hero Section (0.00 to 0.20)
*   **The Visual:** On load, the user sees a looping cloud/fog video (`fogVideo.mp4`). The `HomeHeroSection` UI (Search bar, Top cards) is fully visible *immediately* taking priority over the clouds.
*   **The Hard-Edge Video Fix:** To prevent the bottom literal edge of the MP4 from rendering, we apply a CSS mask to the video wrapper: `linear-gradient(to bottom, black 0%, black 70%, transparent 100%)`.
*   **The Scroll Action:** As the user scrolls, Framer Motion yanks the cloud video UP and scales it gently, fading its opacity to `0` completely by `0.18`. 

### Phase 2: Učne Poti - The Mountain Reveal (Base Image)
*   **The Visual:** Nestled *behind* the clouds is `pathMountainImage` (`z-0`). Because the clouds fade and move upward faster than the mountain moves, a beautiful parallax reveal occurs.
*   **The Scroll Action:** By the time the user hits the first story card ("Začni z večjo sliko"), the clouds are entirely gone. The mountain image is scaling up slowly (`1.05` to `1.15`), giving the impression that we are diving toward it.

### Phase 3: Moduli - The Glowing Sub-Peaks (0.40 to 0.50)
*   **The Visual:** We place a second, mathematically identical image (`moduleMountainImage` at `z-10`) directly on top of the first. This image has glowing/illuminated ridges painted onto it (representing the modules).
*   **The Reveal Mechanics:** We do *not* just fade opacity. We use `useMotionTemplate` to generate a dynamic CSS gradient mask (`moduleGlowMask`) that sweeps *upward* as scroll progress goes from `0.40` to `0.50`.
*   **Result:** The glowing ridges appear to be physically drawn or illuminated from bottom to top out of the rock.

---

## 4. Phase 4: Učne Enote & Glowing Orbs (0.62 to 0.72)

This is the most technically delicate part of the implementation. The user scrolls past "Moduli" into the smallest component ("Učne enote"). We visually represent zooming into single nodes of knowledge.

### The Assets
Instead of baking nodes directly into Photoshop (which ruins responsiveness), we use a dynamic React component (`GlowingOrbs.tsx`) placed *over* a third mountain layer (`unitMountainImage` at `z-20`).

### The Reveal Mechanics (WARNING: Common Pitfalls)
As the user scrolls from `0.47` to `0.55`, a new `unitGlowMask` sweeps upward.
*   **The Consolidation Solution:** To guarantee flawless mathematical synchronization and Z-index layering, `GlowingOrbs` is rendered directly inside `HomeParallaxEnvironment.tsx`, perfectly sharing the EXACT same wrapper and `unitGlowMask` as `unitMountainImage`.
*   **The Z-Index Trap:** The `GlowingOrbs` wrapper MUST have a higher Z-index (`z-[100]`) than the `unitMountainImage` (`z-20`), but they now live securely inside the main `-z-30` parallax theater.
*   **The Masking Trap:** Because they are inside the same `<motion.div>` wrapper, the mountain layer and the floating React orbs wipe into existence perfectly simultaneously, from bottom to top, creating a flawless illusion that they are part of the landscape.

### GlowingOrbs.tsx Architecture
*   **Positioning:** The orbs are mapped via percentages (`top: '72%', left: '59%'`) grouped into four modules. The coordinates feature decreasing steepness to perfectly hug the right-side downward slopes of the underlying mountain image. 
*   **Styling:** They use heavy `box-shadow` to create an organic, ambient glow (mimicking light bleeding onto the mountain rock) rather than flat dots.
*   **Animation:** They use a subtle framer-motion float (`y: [0, -10, 0]`) and pulse (`scale`, `opacity`) on infinite repeat, utilizing staggered delays so they feel organic and asynchronous rather than robotic.
*   **Location Pin:** A dynamic, scroll-triggered location pin appears directly over the central node during the "Vprašalnik" section (progress ~`0.77 - 0.80`) to signify reaching the destination.

---

## 5. Required Assets Summary

To execute this architecture fully, the following localized assets are utilized in the stack:

1.  **`fog-background.mp4`**: A very light, ambient, slow-moving fog/cloud loop.
2.  **`path-mountain.webp`**: The base organic mountain image (light sky, earthy rocks).
3.  **`module-mountain.webp`**: EXACT same image as #2, but with distinct ridges highlighted/glowing in a sleek green tone.
4.  **`unit-mountain.webp`**: EXACT same image as #3, but with additional detailing or fog isolation to focus purely on the Učne enote layout.

---

## 6. Summary for AI Context Extension

If you are an AI picking up this context:
1. Do NOT suggest adding `pt-[120vh]` to the `HomeHeroSection`. The Hero UI must be visible immediately on load over the clouds. The spacing is done purely via spacer `div`s and the `min-h-[150vh]` wrappers on the Story Sections. 
2. When tweaking animations, focus strictly on the `scrollYProgress` thresholds inside `HomeParallaxEnvironment`. The `[0.40, 0.50]` and `[0.62, 0.72]` arrays must map perfectly to the physical heights of the story sections.
3. If adjusting the `GlowingOrbs`, remember they are absolutely positioned using percentages. If the underlying `unitMountainImage` aspect ratio changes, the orb percentages will need to be meticulously recalibrated.
4. Leverage the strict Z-index hierarchy and `mask-image` masking for all background reveals. Always apply the shared `useMotionTemplate` mask to BOTH the background layer and its decorative foreground elements to prevent sequence breaking.