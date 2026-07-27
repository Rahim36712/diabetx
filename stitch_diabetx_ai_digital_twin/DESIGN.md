---
name: Organic Minimalist
colors:
  surface: '#fdf8f7'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e6e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4541'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#7f7570'
  outline-variant: '#d0c4be'
  surface-tint: '#5f5e5e'
  primary: '#5f5e5e'
  on-primary: '#ffffff'
  primary-container: '#e5e3e2'
  on-primary-container: '#656564'
  inverse-primary: '#c8c6c5'
  secondary: '#406907'
  on-secondary: '#ffffff'
  secondary-container: '#bdef82'
  on-secondary-container: '#446e0d'
  tertiary: '#605e5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#e6e2e0'
  on-tertiary-container: '#666463'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#bff285'
  secondary-fixed-dim: '#a4d56c'
  on-secondary-fixed: '#0f2000'
  on-secondary-fixed-variant: '#2e4f00'
  tertiary-fixed: '#e6e2e0'
  tertiary-fixed-dim: '#c9c6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f7'
  on-background: '#1c1b1b'
  surface-variant: '#e6e2e1'
typography:
  headline-lg:
    fontFamily: Comfortaa
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Comfortaa
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Comfortaa
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Comfortaa
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Comfortaa
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

# Design System: Organic Minimalist

## Brand & Style
This design system embodies an "Organic Minimalist" aesthetic. It moves away from the aggressive, high-contrast energy of the previous iteration toward a calm, centered, and professional atmosphere. The style is influenced by modern Corporate Minimalism with a touch of soft, approachable geometry.

The target audience seeks clarity and reliability without clinical coldness. By utilizing soft curves and a grounded, nature-inspired palette, the UI evokes feelings of stability, focus, and approachability.

## Colors
The color palette is anchored in a sophisticated, low-chroma "Content" variant. 

- **Primary:** #2b2b2b (Charcoal) - Used for primary actions, text, and core branding.
- **Secondary:** #3d6603 (Forest Green) - Used for accents, success states, and organic highlights.
- **Background:** #e8e2e0 (Warm Neutral) - A soft, paper-like foundation for the light mode interface.

## Typography
The system utilizes **Comfortaa** across all levels. Comfortaa’s rounded, geometric letterforms harmonize with the organic brand direction, offering a friendly yet structured appearance.

- **Headlines:** Bold weights, large scales (up to 32px), designed to be impactful and friendly.
- **Body:** Regular weights with generous line heights for maximum readability.
- **Labels:** Medium weights for clear functional guidance.

## Layout & Spacing
The layout follows a fluid grid philosophy with a base 8px spacing rhythm. 
- **Desktop:** 12-column grid, 24px margins.
- **Mobile:** 4-column grid, 16px margins.
Spacing is used to create "breathing room," leaning into the minimalist aesthetic.

## Elevation & Depth
Depth is conveyed through tonal layers and soft, ambient shadows. Surfaces use subtle shifts in background saturation to denote hierarchy. Shadows are extra-diffused with low opacity, creating a soft, lifted effect that feels integrated into the warm neutral environment.

## Shapes
Shapes are defined by a "Rounded" logic (Level 2). 
- **Standard Components:** 8px (0.5rem) radius.
- **Large Containers:** 16px (1rem) radius.
- **Modals/Overlays:** 24px (1.5rem) radius.
This roundedness directly mirrors the circular nature of the Comfortaa typeface.

## Components
- **Buttons:** 8px rounded corners. Primary buttons are Charcoal; secondary accents use Forest Green.
- **Input Fields:** Soft 8px corners with subtle tonal backgrounds and clear focus states.
- **Cards:** 16px radius with soft ambient shadows to denote elevation.
- **Chips:** Pill-shaped (fully rounded) to provide visual variety from standard buttons.