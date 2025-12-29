# Dark Mode Setup Guide

## Overview

A comprehensive global dark mode system has been implemented for the entire application. This guide explains how to integrate it into all pages.

## Files Created

1. **`theme-global.css`** - Comprehensive dark mode CSS variables and styles
2. **`theme.js`** (updated) - Enhanced theme management system

## Quick Setup

### Step 1: Add Theme Files to HTML Pages

Add these two lines to the `<head>` section of **every HTML page**:

```html
<link rel="stylesheet" href="theme-global.css">
<script src="theme.js"></script>
```

**Example:**
```html
<head>
  <meta charset="UTF-8">
  <title>Your Page</title>
  <!-- Other head content -->
  
  <!-- Add these two lines -->
  <link rel="stylesheet" href="theme-global.css">
  <script src="theme.js"></script>
  
  <!-- Other CSS files -->
  <link rel="stylesheet" href="styles.css">
</head>
```

### Step 2: Ensure CSS Variables Are Used

Replace hardcoded colors with CSS variables:

**Before:**
```css
background-color: #ffffff;
color: #333;
```

**After:**
```css
background-color: var(--bg-card);
color: var(--text-primary);
```

## Available CSS Variables

### Background Colors
- `--bg-primary` - Main background
- `--bg-secondary` - Secondary background
- `--bg-tertiary` - Tertiary background
- `--bg-card` - Card/container background
- `--bg-modal` - Modal background
- `--bg-input` - Input field background
- `--bg-hover` - Hover state background
- `--bg-active` - Active state background

### Text Colors
- `--text-primary` - Primary text
- `--text-secondary` - Secondary text
- `--text-muted` - Muted text
- `--text-inverse` - Inverse text (for dark backgrounds)

### Border Colors
- `--border-color` - Standard border
- `--border-light` - Light border
- `--border-dark` - Dark border

### Accent Colors
- `--accent-blue` - Blue accent
- `--accent-green` - Green accent
- `--accent-red` - Red accent
- `--accent-orange` - Orange accent
- `--accent-purple` - Purple accent

### Shadows
- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow

## Theme Management API

The `ThemeManager` object is available globally:

```javascript
// Get current theme
const theme = ThemeManager.getTheme(); // 'light', 'dark', or 'default'

// Set theme
ThemeManager.setTheme('dark');
ThemeManager.setTheme('light');
ThemeManager.setTheme('default'); // Auto (time-based)

// Toggle between light and dark
ThemeManager.toggle();

// Check if dark mode is active
if (ThemeManager.isDark()) {
  console.log('Dark mode is active');
}

// Get applied theme (resolves 'default' to actual theme)
const applied = ThemeManager.getAppliedTheme(); // 'light' or 'dark'
```

## Theme Persistence

The theme is automatically saved to `localStorage` and persists across:
- Page refreshes
- Browser sessions
- User re-login

## Theme Options

1. **Light Mode** - Always light
2. **Dark Mode** - Always dark
3. **Default (Auto)** - Switches based on time:
   - Dark: 7 PM - 7 AM
   - Light: 7 AM - 7 PM

## Integration Checklist

For each HTML page:

- [ ] Add `theme-global.css` link in `<head>`
- [ ] Add `theme.js` script in `<head>`
- [ ] Replace hardcoded colors with CSS variables
- [ ] Test dark mode toggle
- [ ] Verify all components switch correctly
- [ ] Check contrast and readability

## Common Patterns

### Cards
```css
.card {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}
```

### Buttons
```css
.button {
  background-color: var(--accent-blue);
  color: var(--text-inverse);
}
```

### Inputs
```css
input {
  background-color: var(--bg-input);
  color: var(--text-primary);
  border-color: var(--border-color);
}
```

### Modals
```css
.modal-overlay {
  background-color: var(--overlay);
}

.modal-content {
  background-color: var(--bg-modal);
  color: var(--text-primary);
}
```

## Testing

1. **Toggle Theme**: Use settings page or `ThemeManager.toggle()`
2. **Check All Pages**: Navigate through all pages
3. **Verify Components**: Check modals, forms, cards, buttons
4. **Test Persistence**: Refresh page, theme should persist
5. **Check Contrast**: Ensure text is readable in dark mode

## Troubleshooting

### Theme Not Applying
- Check that `theme-global.css` is loaded
- Check that `theme.js` is loaded
- Verify `data-theme` attribute is set on `<html>` or `<body>`
- Check browser console for errors

### Some Components Not Switching
- Replace hardcoded colors with CSS variables
- Check if component has inline styles overriding CSS
- Verify component uses theme variables

### Theme Not Persisting
- Check browser localStorage
- Verify `theme.js` is loaded on all pages
- Check for JavaScript errors

## Files Already Updated

✅ `styles.css` - Main styles with dark mode
✅ `cash-in-wallet.css` - Transaction page with dark mode
✅ `theme.js` - Enhanced theme management
✅ `theme-global.css` - Comprehensive dark mode CSS

## Next Steps

1. Add theme files to all remaining HTML pages
2. Update any remaining hardcoded colors
3. Test across all pages
4. Verify accessibility and contrast

---

**The dark mode system is ready to use!** Just add the two files to each HTML page's `<head>` section.

