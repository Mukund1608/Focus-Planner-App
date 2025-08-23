# UpNXT Design System - Migration Notes

## Overview
This document outlines the new UpNXT design system implementation and how to use it in your components.

## Design Tokens Location
All design tokens are defined in:
- `src/styles/theme.css` - CSS custom properties and theme variables
- `tailwind.config.js` - Tailwind CSS theme extensions

## Color Palette
The new design system uses a consistent color palette:

### Primary Colors
- `--color-blue-ink`: #1E2244 (Primary dark blue)
- `--color-blue-accent`: #6D7BFF (Interactive blue)
- `--color-ivory`: #F8F6F0 (Light background)
- `--color-surface-dark`: #24294F (Card on dark)
- `--color-surface-light`: #FFFFFF (Card on light)

### Text Colors
- `--color-text-primary-dark`: #FFFFFF
- `--color-text-secondary-dark`: #BFC6FF
- `--color-text-primary-light`: #111318
- `--color-text-secondary-light`: #3A3F55

### Semantic Colors
- `--color-success`: #22C55E
- `--color-warning`: #F59E0B
- `--color-danger`: #EF4444

### Borders
- `--color-border-dark`: #3B3F66
- `--color-border-light`: #E5E7EB

## Typography

### Font Families
- **Display Font**: Moonhouse (for headings, hero text, brand elements)
- **Body Font**: System UI stack (for body text, buttons, forms)

### Typography Scale
- `--text-display-xl`: 56px (Hero headings)
- `--text-display-lg`: 48px (Large display)
- `--text-display`: 40px (Display headings)
- `--text-h1`: 32px (H1 headings)
- `--text-h2`: 24px (H2 headings)
- `--text-h3`: 20px (H3 headings)
- `--text-body-lg`: 18px (Large body)
- `--text-body`: 16px (Body text)
- `--text-body-sm`: 14px (Small body)
- `--text-caption`: 13px (Captions)
- `--text-button`: 15px (Button text)

## Spacing System
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px
- `--spacing-3xl`: 64px

## Border Radius
- `--radius-lg`: 16px (Cards, buttons)
- `--radius-xl`: 24px (Large cards)

## Shadows
- `--shadow-soft`: 0 8px 24px rgba(0,0,0,0.12)
- `--shadow-strong`: 0 16px 40px rgba(0,0,0,0.18)

## Theme Switching
The app uses a `data-theme` attribute system:

```css
[data-theme="dark"] {
  /* Dark theme variables */
}

[data-theme="light"] {
  /* Light theme variables */
}
```

## How to Add a New Component

### 1. Use Design Tokens
Always use CSS custom properties instead of hard-coded values:

```css
.my-component {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-soft);
}
```

### 2. Typography Classes
Use the predefined typography classes:

```jsx
<h1 className="text-display">Hero Heading</h1>
<h2 className="text-h2">Section Heading</h2>
<p className="text-body">Body text</p>
<span className="text-caption">Caption text</span>
```

### 3. Button Components
Use the predefined button classes:

```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-tertiary">Tertiary Action</button>
```

### 4. Card Components
Use the card class for consistent styling:

```jsx
<div className="card">
  <h3 className="text-h3">Card Title</h3>
  <p className="text-body">Card content</p>
</div>
```

### 5. Badge Components
Use badge classes for status indicators:

```jsx
<span className="badge">Default Badge</span>
<span className="badge badge-success">Success Badge</span>
<span className="badge badge-warning">Warning Badge</span>
<span className="badge badge-danger">Danger Badge</span>
```

## Using Moonhouse Font
The Moonhouse font is automatically loaded and available for display elements:

```css
.display, .hero, h1.display, .section-title {
  font-family: var(--font-display);
  letter-spacing: 0.5px;
}
```

Or use Tailwind classes:
```jsx
<h1 className="font-display text-display">UpNXT</h1>
```

## Theme Switching Implementation
The theme context automatically handles theme switching:

```jsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'dark' ? 'light' : 'dark'} mode
    </button>
  );
}
```

## Responsive Design
The design system includes responsive breakpoints:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

Use CSS custom properties for responsive spacing:
```css
@media (max-width: 768px) {
  .my-component {
    padding: var(--spacing-md);
  }
}
```

## Accessibility
- All interactive elements have proper focus states
- Color contrast ratios meet WCAG AA standards
- Reduced motion support is included
- High contrast mode support is available

## Best Practices
1. **Never use hard-coded colors** - Always use design tokens
2. **Use semantic class names** - Follow the established naming conventions
3. **Test in both themes** - Ensure components work in light and dark modes
4. **Maintain consistency** - Use the established spacing and typography scales
5. **Consider accessibility** - Ensure proper contrast and focus states

## Migration Checklist
When updating existing components:
- [ ] Replace hard-coded colors with design tokens
- [ ] Update typography to use the new scale
- [ ] Apply consistent spacing using the spacing system
- [ ] Test in both light and dark themes
- [ ] Verify accessibility features
- [ ] Update any custom CSS to use the new variables

## File Structure
```
src/
├── styles/
│   └── theme.css          # Design tokens and theme variables
├── components/
│   ├── LoadingScreen.tsx  # New gamified loading screen
│   ├── AppLayout.tsx      # Updated with new design
│   └── TaskCard.tsx       # Gamified quest cards
├── contexts/
│   └── ThemeContext.tsx   # Theme management
└── index.css              # Global styles and component classes
```

## Breaking Changes
- Removed old color variables and replaced with new design tokens
- Updated component class names to follow new conventions
- Changed from CSS classes to data-theme attribute system
- Replaced LoadingPage with new LoadingScreen component
- Updated TaskCard to use gamified quest design
