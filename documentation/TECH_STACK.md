# FRE2028 Website - Tech Stack Documentation

## Overview
The FRE2028 website is a modern, production-ready web application built with a JAMstack architecture, leveraging cutting-edge frameworks and cloud services for optimal performance, scalability, and developer experience.

## Frontend Framework

### Next.js 14
- **React 18.2** - Core UI library with server and client components
- **TypeScript 5** - Type-safe development with strict mode enabled
- **Static Site Generation (SSG)** - Pre-rendered pages for optimal performance
- **Image Optimization** - Next.js Image component with WebP/AVIF support
- **Internationalization** - Dutch (nl) locale configuration
- **SEO Optimization** - Automatic sitemap generation with `next-sitemap`

## Styling & Design System

### Tailwind CSS 3.3
- **Utility-First Framework** - Rapid UI development with atomic CSS classes
- **Custom Design Tokens** - HSL-based color system with semantic naming
- **Component Variants** - Extended theme for primary, secondary, muted, accent, and destructive colors
- **Responsive Design** - Mobile-first approach with custom breakpoints
- **PostCSS** - Automatic vendor prefixing with Autoprefixer

### UI Components
- **Lucide React** - Modern icon library with 290+ SVG icons
- **Tailwind Merge & clsx** - Dynamic class composition utilities

## Backend & Database

### Firebase Platform
- **Firestore** - NoSQL document database for real-time data management
- **Firebase Storage** - Cloud storage for images and assets
- **Firebase Functions (Node.js 20)** - Serverless backend logic
- **Firebase Hosting** - CDN-based static hosting with EU region deployment
- **Firebase Analytics** - User behavior tracking and insights
- **Firebase Admin SDK** - Server-side Firebase operations

### Cloud Functions
- **Express.js 4.18** - RESTful API routing
- **Nodemailer** - Email delivery for contact and newsletter features
- **CORS** - Cross-origin resource sharing middleware

## API Routes & Services

### Next.js API Routes
- `/api/contact/send` - Contact form submission handler
- `/api/newsletter/subscribe` - Newsletter subscription management

### Service Layer Architecture
- `adminService.ts` - Administrative operations
- `contactService.ts` - Contact form processing
- `newsletterService.ts` - Newsletter subscription logic
- `partnerService.ts` - Partner data management

## Development Tools

### Build & Development
- **npm** - Package management
- **ES5 Target** - Broad browser compatibility
- **Incremental Compilation** - Faster TypeScript rebuilds
- **ESLint** - Code quality and standards enforcement

### Configuration
- **Path Aliases** - `@/*` mapping for clean imports
- **Strict TypeScript** - Comprehensive type checking enabled
- **Module Resolution** - Node.js-style module imports

## Deployment & Hosting

### Firebase Hosting
- **Region**: Europe West 1
- **Frameworks Backend** - Integrated Next.js deployment
- **CDN Distribution** - Global content delivery
- **SSL/TLS** - Automatic HTTPS encryption
- **Custom Domain Support** - Professional domain configuration

## Security & Performance

### Security Headers
- `X-Frame-Options: SAMEORIGIN` - Clickjacking protection
- `X-Content-Type-Options: nosniff` - MIME-type sniffing prevention
- `Referrer-Policy: origin-when-cross-origin` - Controlled referrer information
- `X-DNS-Prefetch-Control: on` - Enhanced DNS resolution

### Performance Optimizations
- **Compression** - Gzip/Brotli compression enabled
- **ETag Generation** - Efficient cache validation
- **Image Formats** - WebP and AVIF with fallbacks
- **Responsive Images** - 8 device sizes and 8 image sizes configured
- **Minimum Cache TTL** - 60-second image caching
- **CDN Integration** - Multiple remote image sources supported

## Data Management

### Content Storage
- CSV data files for structured content (Milestones)
- JSON files for configuration and results
- Firebase Storage for media assets
- Public directory for static assets (robots.txt, sitemap.xml)

### Type Safety
- TypeScript interfaces (`partner.ts`)
- Type definitions for all components and services
- Strict null checks and consistent casing enforcement

## SEO & Discoverability

- **Sitemap.xml** - Automated generation post-build
- **RSS Feed** - Content syndication support
- **Robots.txt** - Search engine crawling directives
- **Meta Tags** - Comprehensive OpenGraph and Twitter Card support
- **Structured Data** - SEO-friendly markup

---

**Last Updated**: November 2025  
**Node Version**: 20  
**Next.js Version**: 14.0.0  
**React Version**: 18.2.0
