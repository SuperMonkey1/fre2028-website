# Image Optimization Guide

## Overview
This document explains how images are optimized on the website and how to add new images effectively.

## Current Optimizations

### 1. Next.js Image Component
All images now use the Next.js `<Image>` component which provides:
- **Automatic format conversion**: Images are served as WebP/AVIF when supported
- **Responsive images**: Different sizes served based on device
- **Lazy loading**: Images below the fold load only when needed
- **Quality optimization**: Images are compressed to 75% quality (good balance)

### 2. Image Configuration (next.config.js)
```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  quality: 75,
  minimumCacheTTL: 60,
}
```

### 3. Loading Strategies
- **Priority loading**: Hero/above-fold images load immediately
- **Lazy loading**: All other images load as user scrolls

## Best Practices

### Adding New Images

#### 1. Image Size Guidelines
- **Portfolio images**: Max 1920px width, 1080px height
- **Hero images**: Max 2560px width, 1440px height  
- **Thumbnails**: Max 800px width
- **Partner logos**: Max 500px x 500px

#### 2. File Format
- Use **WebP format** for best compression (already in use ✓)
- Keep file sizes under 500KB when possible
- For very large images, compress before uploading

#### 3. Using the Image Component

**Example - Hero Image (Priority):**
```tsx
<Image 
  src="/images/hero.webp"
  alt="Description"
  fill
  sizes="100vw"
  priority
  quality={60}
/>
```

**Example - Grid Image (Lazy Load):**
```tsx
<Image 
  src="/images/portfolio/photo.webp"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

**Example - Partner Logo:**
```tsx
<Image 
  src={partner.imageUrl}
  alt={partner.name}
  fill
  sizes="(max-width: 768px) 50vw, 25vw"
  loading="lazy"
/>
```

## Compressing Existing Images

### Large Images Found
The following images are quite large and should be compressed:
- `group_xsloba.webp` - 8.3MB
- `20240625_innsbruck_Nicholas.webp` - 6MB
- Several others over 2MB

### How to Compress

#### Option 1: Online Tool (Easiest)
1. Go to https://squoosh.app/
2. Upload your image
3. Choose WebP format
4. Set quality to 75-80%
5. Download and replace

#### Option 2: PowerShell Script (Batch)
See `compress-images.ps1` for automated compression

#### Option 3: Using Sharp (Node.js)
Install sharp: `npm install -g sharp-cli`
```bash
npx sharp-cli -i input.webp -o output.webp --webp-quality 75
```

## Monitoring Performance

### Check Image Loading
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Reload page and check:
   - File sizes
   - Load times
   - Format (should be WebP/AVIF)

### Lighthouse Audit
Run Lighthouse to check image optimization:
1. Chrome DevTools > Lighthouse tab
2. Run audit
3. Check "Properly size images" and "Next-gen formats"

## Results
After optimization, you should see:
- ✅ Faster initial page load
- ✅ Images load progressively as user scrolls
- ✅ Smaller file sizes (30-50% reduction)
- ✅ Better mobile experience
- ✅ Improved SEO scores

## Additional Notes
- Images in `/public/images/` are automatically optimized by Next.js
- External images (from Firestore URLs) are also optimized
- Browser caching is enabled (60 seconds minimum)
