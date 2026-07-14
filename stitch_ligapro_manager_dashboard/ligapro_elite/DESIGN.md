---
name: LigaPro Elite
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#476083'
  primary: '#000613'
  on-primary: '#ffffff'
  primary-container: '#001f3f'
  on-primary-container: '#6f88ad'
  inverse-primary: '#afc8f0'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#160000'
  on-tertiary: '#ffffff'
  tertiary-container: '#470001'
  on-tertiary-container: '#fa3d33'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#afc8f0'
  on-primary-fixed: '#001c3a'
  on-primary-fixed-variant: '#2f486a'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#930007'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Barlow Condensed
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Barlow Condensed
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is engineered for the high-stakes environment of professional football management. It captures the energy of a live sports broadcast while maintaining the precision required for administrative data. The aesthetic is **Corporate / Modern** with a distinct **High-Performance Athletic** edge.

The target audience includes league officials, club directors, and dedicated fans who require immediate clarity and authoritative data visualization. The UI evokes a sense of prestige, reliability, and national pride, reflecting the elite status of Ecuadorian football. 

Design principles focus on:
- **Broadcast Fidelity:** High-contrast elements and crisp transitions reminiscent of premium sports television.
- **Precision Engineering:** Tight alignments and structured data density for complex league management.
- **Kinetic Energy:** Subtle use of depth and highlights to keep the interface feeling dynamic and active.

## Colors

The palette is anchored in the deep authority of Navy Blue, accented by the prestige of Gold.

- **Primary (Deep Navy):** Used for navigation, headers, and primary actions to establish a professional foundation.
- **Secondary (Gold):** Reserved for highlights, achievements, trophies, and premium status indicators.
- **Success (Green):** Specifically mapped to qualification zones (Copa Libertadores/Sudamericana) and positive match outcomes.
- **Danger (Red):** Used for relegation zones, red cards, and critical alerts.
- **Backgrounds:** A crisp White is the primary surface color to ensure maximum legibility of data, supported by a light neutral grey for subtle UI layering.

## Typography

The typography system utilizes a dual-font approach to balance impact with data density.

- **Montserrat (Headlines/Display):** Chosen for its geometric strength and modern athletic feel. Used for page titles, section headers, and prominent score displays.
- **Barlow Condensed (Body/Data):** An industrial-leaning sans-serif that excels in data-heavy environments. The condensed nature allows more information to be visible in league tables and rosters without sacrificing legibility.
- **Hierarchy:** Strict uppercase styling is applied to labels and buttons to mimic sports apparel and scoreboard aesthetics.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model for desktop to ensure a controlled, broadcast-quality composition, transitioning to a fluid layout for mobile devices.

- **Desktop:** 12-column grid with a 1440px max-width. Use 24px gutters to allow data-heavy components enough breathing room to remain readable.
- **Sidebar (Admin):** A fixed 280px sidebar provides persistent access to management tools, using a high-contrast dark theme (Primary Color).
- **Mobile:** 4-column fluid grid with 16px margins. Navigation shifts to a bottom bar for easy reach during live match tracking.
- **Spacing Rhythm:** Based on an 8px scale. Use `md` (24px) for most component grouping and `lg` (48px) for section separation.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows** that create a sense of physical importance for active match data.

- **Levels:** Use three distinct elevation levels. 
    - *Level 0:* The base background (#F8F9FA).
    - *Level 1:* White cards with a subtle 1px border (#E9ECEF) and no shadow for static information.
    - *Level 2:* Active "Matchcards" with a soft, multi-layered shadow (0px 4px 20px rgba(0, 31, 63, 0.08)) to signify live or interactive content.
- **Gradients:** Use subtle vertical gradients on primary buttons and score headers (Primary to a slightly lighter Navy) to add a metallic, trophy-like sheen.

## Shapes

The shape language is **Soft (0.25rem)**, prioritizing a crisp, professional look over overly playful curves.

- **Standard Elements:** Buttons, input fields, and small tags use a 4px (0.25rem) radius.
- **Container Elements:** Large cards and league table containers use an 8px (0.5rem) radius.
- **Interactive States:** On hover, interactive cards may increase their elevation rather than changing their shape, maintaining the rigid structure of a professional dashboard.

## Components

### Matchcards
The core component of the system. Matchcards feature a white background, central score alignment using **Montserrat Bold**, and team crests on either side. A top-border accent color (Gold for featured, Green for live) indicates status.

### League Tables
Utilize zebra-striping for rows. The leftmost column features a 4px "Zone Indicator" vertical bar (Green for Libertadores, Blue for Sudamericana, Red for Relegation). Text is set in **Barlow Condensed** for maximum data fit.

### Buttons
- **Primary:** Navy background, white text, uppercase Montserrat.
- **Secondary:** Transparent with a 2px Gold border and Gold text.
- **Tertiary/Ghost:** No border, Navy text, used for less critical actions.

### Inputs & Selects
Clean, 1px bordered boxes with **Barlow Condensed** labels. On focus, the border shifts to Gold.

### Chips & Badges
Small, high-contrast pills used for match status (e.g., "LIVE", "FT", "PPD"). Use Primary Navy for neutral status and Success Green for live matches.

### Dashboard Widgets
Miniature data visualizations (form guides using W/D/L circles) and player of the match highlights using Gold gradients and semi-transparent photo overlays.