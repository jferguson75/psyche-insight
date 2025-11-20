# Assets Folder

This folder should contain your app's visual assets:

## Required Files

### App Icons
- `icon.png` - 1024x1024px - Main app icon
- `adaptive-icon.png` - 1024x1024px - Android adaptive icon
- `favicon.png` - 32x32px or 48x48px - Web favicon

### Splash Screen
- `splash.png` - 2048x2048px (or larger) - Loading screen image

## Creating Assets

### Using Figma/Sketch/Adobe XD
1. Design your icon at 1024x1024px
2. Export as PNG with transparent background (if applicable)
3. Use consistent branding (purple/indigo theme)

### Online Tools
- **Icon Generator**: https://www.appicon.co
- **Splash Screen**: https://www.appsplashscreens.com
- **Favicon Generator**: https://favicon.io

### Free Design Resources
- **Icons**: https://www.flaticon.com
- **Brain/Psychology Icons**: Search for "brain", "mind", "psychology"
- **Color Palette**: #8b5cf6 (purple), #6366f1 (indigo), #0f172a (dark blue)

## Quick Setup with Placeholder

If you want to get started quickly, you can use emoji-based icons temporarily:

1. Create a simple colored square with the brain emoji 🧠
2. Use any image editor or online tool
3. Export at required sizes

## Note

The current `app.json` references these files. Make sure to create them before building for iOS/Android, otherwise the build will fail.

For web-only testing, you can temporarily comment out the icon references in `app.json`.
