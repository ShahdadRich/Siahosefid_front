# Siah o Sefid (سیاه و سفید)

## 1. Project Overview & Philosophy

Welcome to **Siah o Sefid** (سیاه و سفید), an avant-garde digital art archive and curatorial marketplace.

Inspired by the Swiss Editorial Minimalist aesthetic (akin to `dirtverse.co`), this platform serves as a refined intersection between high art curation and a modern digital marketplace. It features dual thematic experiences tailored for depth and clarity:
- **Dark Mode (`#0a0a0a`)** – Evoking a profound gallery atmosphere.
- **Warm Paper Light (`#f5f4f0`)** – Offering a tactile, editorial canvas.

## 2. Key Visual & Technical Features

Our visual identity is built on a foundation of cutting-edge web technologies designed to offer a poetic, immersive experience:

- **Immersive Backgrounds:** Custom **WebGL2 GLSL ES 3.00 Shaders** generating fluid, divergence-free curl smoke (`Flue`) and undulating silk light/ink waves.
- **Dynamic Typography:** Real-time optical typography contrast using `mix-blend-mode: difference`, brought to life with 3D GSAP + ScrollTrigger in our bespoke `<FoldText />` animations.
- **Micro-Interactions:** Progressive top-right `1px` SVG perimeter border draws and elastic, mouse-reactive SVG string dividers that respond organically to user navigation.
- **Bespoke Type System:** A custom local **IRANYekanWeb** typography system supporting 8 distinct weights (from `100` to `950`), meticulously crafted for Persian script legibility and elegance.

## 3. Platform Modules & User Roles

Siah o Sefid encompasses several interconnected modules tailored for different actors within the art ecosystem:

- **Narrative Landing Page (`/`)**
  A compelling 4-act scrollytelling experience that introduces the ethos of the platform. It features a role gateway allowing users to enter as an Artist (`هنرمندم`) or a Collector (`هنردوستم`), accompanied by live odometer archive metrics showcasing the platform's current scale.

- **Exhibition Gallery (`/gallery`)**
  A dual-view showcase optimized for exploration:
  - **Side-by-Side Split Slider:** With full mobile touch-swipe support for intimate artwork viewing.
  - **3-Column Museum Grid:** For comprehensive catalog browsing.
  Features include advanced filtering and instant wallet-backed artwork acquisition capabilities.

- **Artist Studio (`/studio`)**
  A dedicated hub for creators to track personal studio metrics, register new artworks via a custom image uploader, and manage live pricing and the narrative stories behind their pieces.

- **Collector Profile & Treasury (`/collector`)**
  A personalized dashboard for art patrons. It includes profile management, instant wallet top-up packages, a gallery of their purchased art collection, and a detailed transaction ledger.

- **Master Curatorial Admin Console (`/admin`)**
  An endpoint-only administration panel designed for platform curators to handle user and artist moderation, curate featured artworks for the main gallery, and monitor platform liquidity and overall analytics.

## 4. Tech Stack & Architecture

The platform is engineered using modern, robust web technologies:

- **Frontend Framework:** React, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animations:** GSAP (ScrollTrigger)
- **Graphics & Rendering:** WebGL2 (GLSL ES 3.00)
- **Iconography:** Lucide Icons

## 5. Getting Started

Follow these steps to set up the project locally for development:

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 6. Backend Integration Reference

For full REST API specifications and details on how the frontend communicates with our backend services, please refer to the integration guide:

[View Backend API Endpoints](./API_ENDPOINTS.md)
