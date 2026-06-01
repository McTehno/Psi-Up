# NIDiKo Parallax Landing Page: Architecture & Implementation Guide

This document serves as a comprehensive master-guide for the frontend architecture, parallax animation mechanics, and storytelling structure of the NIDiKo landing page. It is written to bring any developer or AI agent fully up to speed on the technical and creative decisions made during the "Vibe Coding" phase of the project.

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
Instead of stacking `HomeStorySection` cards right on top of each other, we use massive empty `div` spacers (e.g., `<div className="h-[56vh] lg:h-[70vh]" aria-hidden="true" />`).

### The Z-Index Sandwich
To prevent layers from crashing into each other, the page follows strict Z-indexing:
*   **-z-30**: `HomeParallaxEnvironment` (The absolute bottom/back: clouds, mountains).
*   **-z-20**: `HomeScrollJourney` (The SVG bezier curve line that draws itself down the page. Stays *over* the background, but *under* the text).
*   **z-10 / default**: The `HomeStorySection` cards (glassmorphic UI).
*   **z-40 / z-50**: Search states and dropdowns overlaying everything.

---

## 3. The `HomeParallaxEnvironment` Engine

The core of the "Wow Factor" lives in `HomeParallaxEnvironment.tsx`. 
It is a `500vh` tall absolute container with a `100vh` sticky inner viewport. As the user scrubs the `500vh` height, the sticky viewport stays pinned to the screen while Framer Motion mathematically updates the `y`, `scale`, and `maskImage` properties of the layers inside it.

### Phase 1: The Clouds & Hero Section
*   **The Visual:** On load, the user sees a looping cloud/fog video (`fogVideo.mp4`). The `HomeHeroSection` UI (Search bar, Top cards) is fully visible *immediately* taking priority over the clouds.
*   **The Hard-Edge Video Fix:** To prevent the bottom literal edge of the MP4 from rendering, we apply a CSS `mask-image: linear-gradient(to bottom, black 0%, black 70%, transparent 100%)` to the video wrapper. The video smoothly fades into transparency at the bottom.
*   **The Scroll Action:** As the user scrolls, Framer Motion yanks the cloud video UP and scales it gently, fading its opacity to `0`. 

### Phase 2: Učne Poti (The Mountain Reveal)
*   **The Visual:** Nestled *behind* the clouds is `pathMountainImage`. Because the clouds fade and move upward faster than the mountain moves upward, a beautiful parallax reveal occurs.
*   **The Scroll Action:** By the time the user hits the first story card ("Začni z večjo sliko"), the clouds are entirely gone. The mountain image is scaling up slowly (`1.05` to `1.15`), giving the impression that we are diving toward it.

### Phase 3: Moduli (The Glowing Sub-Peaks)
*   **The Problem:** How do we transition to showing specific "Modules" on the mountain without jarringly loading a new image or pixelating a digital zoom?
*   **The Solution:** We place a second, mathematically identical image (`moduleMountainImage`) directly on top of the first. This image has glowing/illuminated ridges painted onto it (representing the modules).
*   **The Scroll Action (The Masterpiece):** We don't just fade the opacity in. We use `useMotionTemplate` to generate a dynamic CSS gradient mask that sweeps *upward*. As the user scrolls into the "Moduli" section, the glowing ridges appear to be physically drawn or illuminated from bottom to top out of the rock.

---

## 4. Phase 4: Učne Enote (The Micro-Level / Latest Concept)

This is the most crucial part of the latest prompts. The user scrolls past "Moduli" into the smallest component ("Učne enote"). We need to visually represent zooming into single nodes of knowledge.

*   **The Flawed Ideas Rejected:** 
    *   Infinite zoom into a WebP (rejected: pixelation and bad framing).
    *   Transition to a dark constellation (rejected: violates the light/cream color theme `#fffdf8`).
    *   Snipping/cutting out a single mountain peak (rejected: harsh Photoshop edges ruin the organic vibe).
    *   Trying to mathematically attach HTML nodes to the `HomeScrollJourney` SVG line (rejected: parallax math and fixed SVG coordinates will detach and break on responsive screens).

*   **The Final Approved Solution: "Fade to Fog" with Baked Nodes**
    1.  **The Asset (`unit-mountain-isolate.webp`):** We take the mountain image and apply heavy cream/white fog to the sides, base, and background peaks using Photoshop. Only the single, central glowing peak (the "Module") is left visible.
    2.  **Baking the Nodes:** In Photoshop, we look at where the `HomeScrollJourney` SVG line crosses this central peak on the screen. We paint/bake 3 to 4 elegant glowing dots (nodes) directly into the mountain asset exactly along that trajectory.
    3.  **The Framer Motion Logic:** As the user scrolls from `0.70` to `0.90` (entering the Učne enote section), the fully realized mountain phases out, and the `unit-mountain-isolate` (The Foggy Peak) fades to `1` opacity.
    4.  **The Result:** The background smoothly minimalizes. The excess nature melts into cream-colored fog, leaving focus on a single peak. The painted nodes on the peak perfectly intersect with the scrolling SVG bezier curve overhead. The purely decorative scrolling line suddenly becomes the literal "learning path" connecting the "learning units".

---

## 5. Required Assets to Generate (To-Do List)

To execute this architecture fully, the following localized assets must be finalized:

1.  **`fog-background.mp4`**: A very light, ambient, slow-moving fog/cloud loop.
2.  **`path-mountain.webp`**: The base organic mountain image (light sky, earthy rocks).
3.  **`module-mountain.webp`**: EXACT same image as #2, but with 2 or 3 distinct ridges highlighted/glowing in a sleek green tone.
4.  **`unit-mountain-isolate.webp`**: EXACT same image as #3, but the outer 80% of the image is shrouded in a heavy cream radial gradient (fog), leaving only one glowing ridge. 3 or 4 distinct glowing dots are painted onto this ridge, mapped to align with where the SVG journey line falls in the browser.

---

## 6. Summary for AI Context Extension

If you are an AI picking up this context:
Do NOT suggest adding `pt-[120vh]` to the `HomeHeroSection`. The Hero UI must be visible immediately on load over the clouds. The spacing is done purely via spacer `div`s between the Story Sections. 
Focus strictly on tweaking the `scrollYProgress` thresholds inside `HomeParallaxEnvironment` to map perfectly to the physical heights of the `min-[150vh]` story sections. Leverage the `-z-30` stack and `mask-image` masking for all background reveals.