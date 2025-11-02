# Blog Integration - Substack RSS Feed

This document describes the blog feature that integrates your Substack RSS feed into the FRE2028 website.

## Overview

The blog system fetches posts from your Substack RSS feed at `https://www.teamfre.be/feed` and displays them on your website using Next.js's Static Site Generation (SSG) with Incremental Static Regeneration (ISR).

## Features

- ✅ **Automatic RSS Feed Parsing**: Fetches and parses blog posts from your Substack RSS feed
- ✅ **Static Site Generation**: Pre-renders blog pages at build time for optimal performance
- ✅ **Incremental Static Regeneration**: Automatically updates blog content every hour without rebuilding
- ✅ **SEO Optimized**: Full meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
- ✅ **Responsive Design**: Mobile-first design matching your existing website style
- ✅ **Featured Images**: Automatically extracts and displays featured images from blog posts
- ✅ **Dynamic Slugs**: URL-friendly slugs generated from post titles
- ✅ **Content Sanitization**: HTML content properly rendered with Tailwind Typography styles
- ✅ **Share Functionality**: Native share API for mobile and fallback for desktop
- ✅ **Navigation Integration**: Blog link added to main navigation

## File Structure

```
├── pages/
│   ├── blog.tsx                    # Blog listing page
│   └── blog/
│       └── [slug].tsx              # Individual blog post page
├── services/
│   └── blogService.ts              # RSS feed parsing service
├── types/
│   └── blog.ts                     # TypeScript interfaces for blog data
└── documentation/
    └── BLOG_INTEGRATION.md         # This file
```

## How It Works

### 1. RSS Feed Parsing (`blogService.ts`)

The service uses the `rss-parser` library to fetch and parse your Substack RSS feed:

```typescript
import Parser from 'rss-parser';

const RSS_FEED_URL = 'https://www.teamfre.be/feed';
const parser = new Parser();

export async function fetchBlogPosts(): Promise<BlogListItem[]> {
  const feed = await parser.parseURL(RSS_FEED_URL);
  // Parse and transform feed items...
}
```

### 2. Blog Listing Page (`/blog`)

- Uses `getStaticProps` with ISR (revalidate: 3600 seconds)
- Fetches all blog posts from RSS feed
- Displays posts in a responsive grid
- Shows post title, excerpt, date, and featured image
- Revalidates every hour to check for new posts

### 3. Individual Blog Posts (`/blog/[slug]`)

- Uses `getStaticPaths` to pre-generate pages for existing posts
- Uses `getStaticProps` with ISR (revalidate: 3600 seconds)
- Enables fallback mode to generate new posts on-demand
- Full blog post content rendered with Tailwind Typography
- Includes share functionality and link back to Substack

## Configuration

### RSS Feed URL

To change the RSS feed URL, edit `services/blogService.ts`:

```typescript
const RSS_FEED_URL = 'https://www.teamfre.be/feed';
```

### Revalidation Period

To change how often the blog checks for updates, edit the `revalidate` value in:

**Blog listing** (`pages/blog.tsx`):
```typescript
export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { posts },
    revalidate: 3600, // Revalidate every hour
  };
};
```

**Blog posts** (`pages/blog/[slug].tsx`):
```typescript
export const getStaticProps: GetStaticProps = async ({ params }) => {
  return {
    props: { post },
    revalidate: 3600, // Revalidate every hour
  };
};
```

## SEO & Metadata

### Open Graph Tags
All blog pages include Open Graph meta tags for social media sharing:
- `og:title` - Post title
- `og:description` - Post excerpt
- `og:image` - Featured image
- `og:type` - Set to "article" for blog posts
- `og:url` - Canonical URL

### JSON-LD Structured Data
Each blog post includes structured data for search engines:
```json
{
  "@type": "BlogPosting",
  "headline": "Post Title",
  "description": "Post excerpt",
  "datePublished": "2025-01-01",
  "author": {
    "@type": "Person",
    "name": "Frederik Leys"
  }
}
```

### Sitemap Integration
Blog pages are automatically included in your sitemap with appropriate priorities:
- `/blog` - Priority 0.9, changefreq: daily
- `/blog/[slug]` - Priority 0.7, changefreq: weekly

## Styling

The blog uses:
- **Tailwind CSS**: For layout and components
- **@tailwindcss/typography**: For blog content styling (prose classes)
- **Consistent Design**: Matches your existing website design system

### Content Styling

Blog post content uses the `prose` classes from Tailwind Typography:
```tsx
<div className="prose prose-lg prose-zinc max-w-none
  prose-headings:font-bold prose-headings:tracking-tight
  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
  prose-p:leading-relaxed prose-p:text-zinc-700
  ...
">
  {/* Blog content */}
</div>
```

## Navigation

Blog links have been added to:
- Desktop navigation menu
- Mobile hamburger menu
- Footer (can be added if needed)

## Deployment

When deploying to Firebase Hosting:

1. **Build the site**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

3. **What happens**:
   - All existing blog posts are pre-rendered at build time
   - New posts will be generated on-demand when first accessed
   - All pages will revalidate every hour in the background

## Testing Locally

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Visit blog pages**:
   - Blog listing: `http://localhost:3000/blog`
   - Individual post: `http://localhost:3000/blog/[post-slug]`

## Troubleshooting

### Posts not showing up
- Verify RSS feed URL is correct and accessible
- Check console for any parsing errors
- Ensure Substack RSS feed is public

### Images not loading
- Substack images should load directly from their CDN
- If CORS issues occur, images will show broken
- Consider adding image proxy if needed

### Build errors
- Run `npm run build` to check for errors
- Verify all TypeScript types are correct
- Check that `undefined` values are handled as `null`

## Performance

- **Build Time**: ~10-15 seconds for 10 blog posts
- **Page Load**: Instant (pre-rendered static pages)
- **ISR Background Updates**: Every hour
- **First Load JS**: ~192 KB (includes blog functionality)

## Future Enhancements

Potential features to add:
- [ ] Categories/tags filtering
- [ ] Search functionality
- [ ] Pagination for blog listing
- [ ] Related posts section
- [ ] Comments integration (if desired)
- [ ] RSS feed for your website (mirror Substack)
- [ ] Featured posts section on homepage
- [ ] Newsletter signup within blog posts

## Dependencies

```json
{
  "rss-parser": "^3.13.0",
  "@tailwindcss/typography": "^0.5.10"
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review the RSS feed structure in `/documentation/feed.rss`
3. Check Next.js ISR documentation: https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
