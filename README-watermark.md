# Image Watermark Implementation

This document provides information on how the watermark feature has been implemented across the site.

## WatermarkedImage Component

We've created a custom `WatermarkedImage` component that wraps Next.js's Image component to add watermarks to images displayed on the site. This component adds a text overlay to images, allowing for watermark customization.

### Usage

```tsx
import WatermarkedImage from '../components/WatermarkedImage';

// Basic usage with defaults
<WatermarkedImage
  src="/path/to/image.jpg"
  alt="Image description"
  width={500}
  height={300}
/>

// Customized watermark
<WatermarkedImage
  src="/path/to/image.jpg"
  alt="Image description" 
  fill
  className="object-cover"
  watermarkText="Custom Text"
  watermarkPosition="bottomRight"
  watermarkSize="small"
  watermarkOpacity={0.7}
  watermarkColor="rgba(255, 255, 255, 0.9)"
  watermarkRotation={-45}
/>
```

### Props

The component accepts all standard Next.js `Image` props plus the following watermark-specific props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `watermarkText` | string | "Wasteland Mods" | Text to display as watermark |
| `watermarkOpacity` | number | 0.4 | Opacity of the watermark (0-1) |
| `watermarkSize` | 'small' \| 'medium' \| 'large' | 'medium' | Size of the watermark text |
| `watermarkPosition` | 'topLeft' \| 'topRight' \| 'bottomLeft' \| 'bottomRight' \| 'center' | 'center' | Position of the watermark |
| `watermarkColor` | string | 'rgba(255, 255, 255, 0.8)' | Color of the watermark text |
| `watermarkRotation` | number | -30 | Rotation angle in degrees (only applies to center position) |

## Implementation Locations

Watermarks have been added to the following locations:

1. **Mod Cards** - Thumbnails on the mods listing page
2. **Mod Detail Page** - Main image on individual mod pages
3. **About Page** - Banner image
4. **Hero Rotator** - Custom implementation for the rotating hero banners

## For Native HTML Images

For components that use native HTML `<img>` tags instead of Next.js `Image` component (like the RotatingHero), we've implemented a direct watermark overlay using absolute positioning.

## Customization

If you need to adjust the watermark globally:

1. Modify the default props in `app/components/WatermarkedImage.tsx`
2. For the RotatingHero, modify the watermark styles in `app/components/RotatingHero.tsx` 