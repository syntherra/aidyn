# Aidyn Theme System

## Color Tokens

- --bg: App background
- --surface: Card and panel background
- --surface-2: Inputs and secondary surfaces
- --divider: Lines and separators
- --text-primary: Primary text
- --text-secondary: Secondary text
- --muted: Muted text
- --accent: Brand accent
- --accent-contrast: Text on accent buttons
- --error: Error states
- --warning: Warning states
- --success: Success states
- --disabled-text: Disabled text
- --disabled-bg: Disabled backgrounds
- --shadow-color: Shadows

## Themes

- Default `dark` defined on `:root`
- Optional `light` via `[data-theme="light"]`

## Usage

- SCSS tokens map to CSS variables in `src/styles/tokens.scss`
- Components import tokens and inherit theme at runtime

## Switching

- `document.documentElement.setAttribute('data-theme', 'dark' | 'light')`

## Accessibility

- Colors tuned to meet AA contrast against `--surface`

