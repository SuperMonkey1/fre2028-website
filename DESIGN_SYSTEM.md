# Design System & Frontend Style Guide
## Fré2028 Website - Complete Design Documentation

> **Purpose**: This document provides a comprehensive overview of the design system, styling patterns, and frontend architecture used in the Fré2028 website. Use this as a reference to replicate the same visual style and design philosophy in other web applications.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Component Patterns](#component-patterns)
6. [Layout & Spacing](#layout--spacing)
7. [CSS Architecture](#css-architecture)
8. [Responsive Design](#responsive-design)
9. [Animation & Transitions](#animation--transitions)
10. [Best Practices](#best-practices)

---

## Technology Stack

### Core Framework
- **Next.js 14** - React framework with SSR/SSG
- **React 18.2** - UI library
- **TypeScript 5.0** - Type safety

### Styling
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Utilities
- **clsx** - Conditional className composition
- **tailwind-merge** - Merge Tailwind classes without conflicts
- **Lucide React** - Icon library

### Key Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.3.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0",
  "lucide-react": "^0.294.0"
}
```

---

## Design Philosophy

### Core Principles

#### 1. **Minimalist Brutalism**
- Clean, geometric layouts
- High contrast (black on white, white on black)
- Sharp edges, minimal border radius (or none)
- Bold typography with tight tracking
- Sparse use of color (mostly black/white/zinc grays)

#### 2. **Content-First Approach**
- Large, readable text
- Generous whitespace
- Clear visual hierarchy
- Content drives design, not decoration

#### 3. **Editorial Style**
- Magazine-like layouts
- Long-form readable content
- Image-text grid systems
- Story-driven structure

#### 4. **Performance Oriented**
- Minimal custom CSS (< 100 lines)
- Utility-first with Tailwind
- Optimized images (WebP format)
- No heavy animations or effects

#### 5. **Accessibility First**
- High contrast ratios
- Semantic HTML
- Keyboard navigation
- Screen reader friendly

---

## Color System

### Color Palette Philosophy
The color system uses **HSL (Hue, Saturation, Lightness)** values stored as CSS custom properties. This allows for easy theming and maintains consistency across light/dark modes.

### CSS Custom Properties

```css
:root {
  /* Base Colors - Light Mode */
  --background: 0 0% 100%;              /* Pure white */
  --foreground: 240 10% 3.9%;           /* Almost black */
  
  /* UI Elements */
  --card: 0 0% 100%;                    /* White */
  --card-foreground: 240 10% 3.9%;     /* Dark text */
  --border: 240 5.9% 90%;               /* Light gray border */
  --input: 240 5.9% 90%;                /* Light gray input bg */
  
  /* Interactive Elements */
  --primary: 240 5.9% 10%;              /* Black (buttons, links) */
  --primary-foreground: 0 0% 98%;       /* White text on primary */
  --secondary: 240 4.8% 95.9%;          /* Light gray */
  --secondary-foreground: 240 5.9% 10%; /* Dark text on secondary */
  
  /* Accent Colors */
  --accent: 240 4.8% 95.9%;             /* Subtle gray */
  --accent-foreground: 240 5.9% 10%;    /* Dark accent text */
  --muted: 240 4.8% 95.9%;              /* Muted backgrounds */
  --muted-foreground: 240 3.8% 46.1%;   /* Muted text */
  
  /* Special States */
  --destructive: 0 84.2% 60.2%;         /* Red for errors/destructive actions */
  --destructive-foreground: 0 0% 98%;   /* White text on destructive */
  --ring: 240 10% 3.9%;                 /* Focus ring color */
  
  /* Border Radius */
  --radius: 0.5rem;                     /* 8px - used sparingly */
}
```

### Dark Mode (Optional)
```css
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  /* ... inverted values */
}
```

### Tailwind Color Extension
```javascript
// tailwind.config.js
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ... etc
}
```

### Color Usage Guidelines

#### Primary Colors
- **Black (`#000000` / `bg-black`)**: Primary buttons, navigation, headings
- **White (`#FFFFFF` / `bg-white`)**: Main background, button text
- **Zinc Grays**: All intermediate shades

#### Gray Scale (Zinc Palette)
```
zinc-50:  #fafafa  - Subtle section backgrounds
zinc-100: #f4f4f5  - Card backgrounds, borders
zinc-200: #e4e4e7  - Borders, dividers
zinc-300: #d4d4d8  - Hover states
zinc-400: #a1a1aa  - Muted text, icons
zinc-500: #71717a  - Secondary text
zinc-600: #52525b  - Body text alternative
zinc-700: #3f3f46  - Dark text
zinc-800: #27272a  - Almost black
zinc-900: #18181b  - Very dark backgrounds
```

#### Accent Colors (Used Sparingly)
- **Red (`bg-red-600`)**: Call-to-action buttons, urgent actions
  - `red-600: #dc2626` - Primary CTA
  - `red-700: #b91c1c` - CTA hover state

#### Semantic Colors
- **Success**: Green tones (not heavily used)
- **Warning**: Yellow/amber tones (not heavily used)
- **Error**: Red (`destructive` color)
- **Info**: Blue tones (not heavily used)

### Color Combinations

#### High Contrast Sections
```jsx
// Black section with white text
<section className="bg-black text-white">
  {/* Content */}
</section>

// White section with black text
<section className="bg-white text-black">
  {/* Content */}
</section>
```

#### Subtle Backgrounds
```jsx
// Light gray background
<section className="bg-zinc-50 text-black">
  {/* Content */}
</section>

// Gradient backgrounds (rare)
<div className="bg-gradient-to-b from-zinc-50 to-white">
  {/* Content */}
</div>
```

---

## Typography

### Font Stack
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**Philosophy**: Uses system fonts for performance and native feel. No custom web fonts loaded.

### Type Scale

#### Heading Sizes
```jsx
// Hero/Display (96px desktop, 72px tablet, 48px mobile)
<h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
  DROOM GROOTS.
</h1>

// Page Title (48px desktop, 36px mobile)
<h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
  Mijn Partners
</h1>

// Section Heading (36px desktop, 30px mobile)
<h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
  PORTOFOLIO.
</h2>

// Sub-section (24px desktop, 20px mobile)
<h3 className="text-2xl md:text-3xl font-bold tracking-tight">
  Resultaten
</h3>

// Card Title (18px-20px)
<h4 className="text-xl font-bold">
  Partner Name
</h4>
```

#### Body Text Sizes
```jsx
// Large body (20px desktop, 18px mobile)
<p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
  Main introductory text
</p>

// Standard body (18px desktop, 16px mobile)
<p className="text-base md:text-lg text-zinc-700 leading-relaxed">
  Main content text
</p>

// Small text (14px)
<p className="text-sm text-zinc-600">
  Secondary information
</p>

// Extra small (12px)
<span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
  Labels and badges
</span>

// Tiny (10px)
<span className="text-[10px] font-bold uppercase tracking-widest">
  Small labels
</span>
```

### Font Weights
- **Bold (`font-bold`)**: 700 - Headings, labels, important text
- **Semibold (`font-semibold`)**: 600 - Buttons, sub-headings
- **Medium (`font-medium`)**: 500 - Emphasized text (rarely used)
- **Regular (default)**: 400 - Body text (rarely used, usually zinc-600/700 for color instead)

### Letter Spacing (Tracking)
```jsx
// Tighter (for large headings)
<h1 className="tracking-tighter">HEADING</h1>  // -0.05em

// Tight (for smaller headings)
<h2 className="tracking-tight">Heading</h2>     // -0.025em

// Wide (for small uppercase text)
<span className="tracking-wide">Button Text</span>  // 0.025em

// Widest (for labels)
<span className="tracking-widest">LABEL</span>      // 0.1em

// Extra wide (for special labels)
<span className="tracking-[0.2em]">CATEGORY</span>  // 0.2em
```

### Line Height (Leading)
```jsx
// Tight (for headings)
<h1 className="leading-none">       // 1.0
<h1 className="leading-tight">      // 1.25

// Relaxed (for body text)
<p className="leading-relaxed">     // 1.625
```

### Text Styling Patterns

#### Uppercase Labels
```jsx
<span className="inline-block px-4 py-2 border border-zinc-200 
                 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
  Road to Los Angeles 2028
</span>
```

#### Section Titles
```jsx
<h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
  TITLE IN CAPS
</h2>
```

#### Body Paragraphs
```jsx
<p className="text-lg text-zinc-600 leading-relaxed">
  Body text content with good readability
</p>
```

---

## Component Patterns

### Utility Function: `cn()`
The `cn()` function combines `clsx` and `tailwind-merge` for conditional and conflict-free className composition:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage example
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  "more-classes"
)} />
```

### Button Component

#### Implementation
```typescript
const Button = React.forwardRef<
  HTMLButtonElement, 
  React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    variant?: 'primary' | 'outline' | 'white' 
  }
>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center",
        "text-sm font-semibold tracking-wide",
        "transition-all duration-200",
        "disabled:opacity-50",
        "h-12 px-8",
        
        // Variant styles
        variant === 'primary' && "bg-black text-white hover:bg-zinc-800",
        variant === 'outline' && "border border-current bg-transparent hover:opacity-60",
        variant === 'white' && "bg-white text-black hover:bg-zinc-200",
        
        className
      )}
      {...props}
    />
  )
})
```

#### Variants
```jsx
// Primary (default) - Black background
<Button variant="primary">
  Call to Action
</Button>

// Outline - Transparent with border
<Button variant="outline">
  Secondary Action
</Button>

// White - White background (for dark sections)
<Button variant="white">
  Light Action
</Button>

// Red CTA (inline override)
<Button className="!bg-red-600 hover:!bg-red-700">
  Word Partner
</Button>
```

### Navigation Bar

#### Sticky Navigation Pattern
```jsx
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

<nav className={cn(
  "fixed top-0 left-0 right-0 z-50",
  "transition-all duration-300 border-b",
  isScrolled 
    ? "bg-white border-zinc-100 py-3" 
    : "bg-transparent border-transparent py-6"
)}>
  {/* Navigation content */}
</nav>
```

#### Navigation Structure
```jsx
<nav>
  <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase">
      <Mountain className="w-6 h-6" />
      <span>Brand Name</span>
    </div>
    
    {/* Desktop Links */}
    <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
      <button className="hover:opacity-60 transition-opacity">Link</button>
      {/* More links */}
      <Button>CTA Button</Button>
    </div>
    
    {/* Mobile Menu Toggle */}
    <button className="lg:hidden">
      <Menu className="w-6 h-6" />
    </button>
  </div>
</nav>
```

### Hero Section Pattern

```jsx
<section className="relative h-screen flex items-center bg-black text-white 
                    px-4 md:px-8 overflow-hidden">
  {/* Background Image/Video */}
  <div className="absolute inset-0 z-0">
    <Image 
      src="/hero-image.jpg"
      fill
      className="object-cover opacity-40 grayscale mix-blend-screen"
      priority
    />
  </div>
  
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 z-20" />
  
  {/* Content */}
  <div className="relative z-30 max-w-7xl mx-auto w-full pt-20">
    <div className="max-w-4xl">
      {/* Badge */}
      <div className="inline-block px-4 py-2 mb-8 border border-white/30 
                      text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
        Tagline
      </div>
      
      {/* Heading */}
      <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter 
                     leading-none mb-8">
        HERO<br />TITLE.
      </h1>
      
      {/* Description */}
      <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mb-12">
        Hero description text goes here
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-6">
        <Button className="bg-red-600 hover:bg-red-700">
          Primary CTA
        </Button>
        <button className="group flex items-center gap-3 text-sm font-bold uppercase 
                          tracking-widest hover:text-zinc-300 transition-colors">
          Secondary CTA 
          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  </div>
</section>
```

### Card Pattern

#### Simple Card
```jsx
<div className="bg-white border border-zinc-200 rounded-lg p-6 
                hover:border-zinc-300 transition-all duration-200 hover:shadow-lg">
  <h3 className="font-semibold text-lg mb-2">Card Title</h3>
  <p className="text-zinc-600">Card content</p>
</div>
```

#### Image Card with Hover Overlay
```jsx
<div className="relative group aspect-square bg-white border border-zinc-200 
                overflow-hidden hover:border-black transition-colors cursor-pointer">
  {/* Image */}
  <Image 
    src="/image.jpg"
    fill
    className="object-contain p-4"
  />
  
  {/* Hover Overlay */}
  <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 flex flex-col items-center 
                  justify-center p-6 text-center">
    <p className="text-white font-bold uppercase tracking-wider mb-2 text-sm">
      Overlay Title
    </p>
    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest 
                     border border-zinc-700 px-3 py-1">
      Action Label
    </span>
  </div>
</div>
```

### Modal/Dialog Pattern

```jsx
{isOpen && (
  <div 
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 
               bg-black/60 backdrop-blur-sm" 
    onClick={onClose}
  >
    <div 
      className="bg-white max-w-md w-full p-8 shadow-2xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      {/* Modal Content */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold tracking-tighter mb-3">
          Modal Title
        </h3>
        <p className="text-zinc-600">
          Modal description
        </p>
      </div>
      
      {/* Modal Body */}
      <form className="space-y-6">
        {/* Form fields */}
      </form>
    </div>
  </div>
)}
```

### Form Input Pattern

```jsx
<div className="group">
  <label className="block text-xs font-bold uppercase tracking-widest 
                    text-zinc-500 mb-2 group-focus-within:text-black transition-colors">
    Label
  </label>
  <input 
    type="text" 
    className="w-full py-3 px-4 bg-zinc-50 border border-zinc-200 
               focus:border-black focus:outline-none transition-colors text-lg"
    placeholder="Placeholder text"
  />
</div>
```

### Badge/Label Pattern

```jsx
// Category Badge
<span className="inline-block px-3 py-1 mb-6 border border-zinc-200 
                 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
  Category
</span>

// Status Badge
<span className="inline-block px-3 py-1 bg-green-100 text-green-800 
                 text-xs font-semibold uppercase tracking-wider rounded-full">
  Active
</span>

// Icon Badge
<div className="inline-flex items-center gap-2 text-white font-bold 
                uppercase tracking-widest text-xs border border-zinc-800 px-4 py-2">
  <Heart className="w-4 h-4 fill-white" /> Label Text
</div>
```

---

## Layout & Spacing

### Container Pattern
```jsx
// Standard content container (1280px max-width)
<div className="max-w-7xl mx-auto px-4 md:px-8">
  {/* Content */}
</div>

// Narrow content container (768px max-width)
<div className="max-w-3xl mx-auto px-4 md:px-8">
  {/* Content */}
</div>

// Medium container (896px max-width)
<div className="max-w-4xl mx-auto px-4 md:px-8">
  {/* Content */}
</div>

// Wide container (1152px max-width)
<div className="max-w-6xl mx-auto px-4 md:px-8">
  {/* Content */}
</div>
```

### Section Spacing
```jsx
// Standard section padding
<section className="py-32">

// Smaller section padding
<section className="py-20">

// Responsive section padding
<section className="py-20 md:py-32">

// Hero section (full viewport height)
<section className="h-screen">
```

### Grid Layouts

#### Two Column Grid
```jsx
<div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

#### Three/Four Column Grid
```jsx
// Partners/Logo grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {items.map(item => (
    <div key={item.id}>{/* Grid item */}</div>
  ))}
</div>
```

#### Asymmetric Grid (5+7 columns)
```jsx
<div className="grid lg:grid-cols-12 gap-16 items-start">
  <div className="lg:col-span-5">
    {/* Sidebar content */}
  </div>
  <div className="lg:col-span-7">
    {/* Main content */}
  </div>
</div>
```

#### Auto-rows Grid (Pinterest-style)
```jsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 
                auto-rows-[200px] md:auto-rows-[250px]">
  <div className="col-span-2 row-span-2">{/* Large item */}</div>
  <div>{/* Regular item */}</div>
  {/* More items */}
</div>
```

### Spacing Scale
```
0.5rem = 8px   (gap-2, p-2)
1rem   = 16px  (gap-4, p-4)
1.5rem = 24px  (gap-6, p-6, mb-6)
2rem   = 32px  (gap-8, p-8, mb-8)
3rem   = 48px  (gap-12, mb-12)
4rem   = 64px  (gap-16, mb-16)
6rem   = 96px  (gap-24, mb-24)
8rem   = 128px (py-32)
```

---

## CSS Architecture

### Minimal Custom CSS
The site uses **extremely minimal custom CSS** (< 100 lines total). Almost everything is Tailwind utility classes.

#### globals.css (Complete File)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* CSS Custom Properties for theming */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
}

/* Dark mode (optional) */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... etc */
}

/* Global border color */
* {
  border-color: hsl(var(--border));
}

/* Body defaults */
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... more semantic colors
      },
      borderRadius: {
        lg: "var(--radius)",           // 8px
        md: "calc(var(--radius) - 2px)", // 6px
        sm: "calc(var(--radius) - 4px)", // 4px
      },
    },
  },
  plugins: [],
}
```

### PostCSS Configuration
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Responsive Design

### Breakpoints (Tailwind Defaults)
```
sm:  640px  - Small tablets
md:  768px  - Tablets
lg:  1024px - Small laptops
xl:  1280px - Desktops
2xl: 1536px - Large desktops
```

### Mobile-First Approach
All base styles are mobile, then enhanced with breakpoint prefixes:

```jsx
<h1 className="text-4xl md:text-6xl lg:text-8xl">
  {/* 
    Mobile:  text-4xl (36px)
    Tablet:  text-6xl (60px)
    Desktop: text-8xl (96px)
  */}
</h1>

<div className="px-4 md:px-8">
  {/* 
    Mobile:  16px horizontal padding
    Tablet+: 32px horizontal padding
  */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 
    Mobile:  1 column
    Tablet:  2 columns
    Desktop: 4 columns
  */}
</div>
```

### Common Responsive Patterns

#### Responsive Typography
```jsx
// Heading
className="text-3xl md:text-5xl lg:text-7xl"

// Body
className="text-base md:text-lg"

// Small text
className="text-sm md:text-base"
```

#### Responsive Spacing
```jsx
// Section padding
className="py-20 md:py-32"

// Gap between elements
className="gap-6 md:gap-12 lg:gap-16"

// Margin
className="mb-8 md:mb-16"
```

#### Responsive Layout
```jsx
// Stack on mobile, side-by-side on desktop
className="flex flex-col md:flex-row gap-6"

// Grid with responsive columns
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"

// Hide on mobile
className="hidden md:block"

// Show only on mobile
className="md:hidden"
```

#### Responsive Images
```jsx
<Image 
  src="/image.jpg"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="w-full h-auto"
/>
```

---

## Animation & Transitions

### Transition Durations
```jsx
// Standard transitions (200ms)
className="transition-all duration-200"
className="transition-colors duration-200"

// Smooth transitions (300ms)
className="transition-all duration-300"
className="transition-opacity duration-300"

// Slow transitions (500ms)
className="transition-all duration-500"

// Very slow (1000ms+)
className="transition-opacity duration-[2000ms] ease-in-out"
```

### Common Transition Patterns

#### Hover Opacity
```jsx
className="hover:opacity-60 transition-opacity"
className="hover:opacity-80 transition-opacity"
```

#### Hover Transform
```jsx
// Scale up slightly
className="hover:scale-105 transition-transform"

// Translate arrow on hover
className="group-hover:translate-x-2 transition-transform"
```

#### Border Color Change
```jsx
className="border border-zinc-200 hover:border-black transition-colors"
```

#### Background Color Change
```jsx
className="bg-black hover:bg-zinc-800 transition-all duration-200"
```

### Fade In/Out
```jsx
// Controlled fade
<div className={cn(
  "transition-opacity duration-300",
  isVisible ? "opacity-100" : "opacity-0"
)}>
```

### Smooth Scroll
```javascript
// Smooth scroll to element
element.scrollIntoView({ behavior: 'smooth' });

// Smooth scroll with offset
element.scrollIntoView({ 
  behavior: 'smooth',
  block: 'center'
});
```

### Loading Spinner
```jsx
<div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black 
                rounded-full animate-spin" />
```

### Minimal Animation Philosophy
- **No complex animations** - Keep it simple
- **Fast, subtle transitions** - 200-300ms is standard
- **Purpose-driven** - Only animate when it improves UX
- **Performance first** - Use transform and opacity for best performance

---

## Best Practices

### 1. **Utility-First CSS**
- Use Tailwind utilities for 99% of styling
- Only write custom CSS for truly unique cases
- Use the `cn()` utility for conditional classes

```jsx
// Good
<div className="flex items-center gap-4 p-6 border border-zinc-200">

// Avoid (unless reused many times)
<div className="custom-card-style">
```

### 2. **Component Composition**
- Create small, reusable components
- Use TypeScript for type safety
- Forward refs when needed

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return <button ref={ref} className={cn(baseStyles, className)} {...props} />
  }
)
```

### 3. **Semantic HTML**
- Use proper HTML5 elements
- Maintain accessibility (ARIA labels, alt text, keyboard nav)
- Structure content logically

```jsx
<article>
  <header>
    <h1>Title</h1>
  </header>
  <main>
    <p>Content</p>
  </main>
  <footer>
    <p>Footer</p>
  </footer>
</article>
```

### 4. **Performance Optimization**

#### Image Optimization
```jsx
import Image from 'next/image';

<Image 
  src="/image.webp"           // Use WebP format
  width={800}
  height={600}
  alt="Descriptive alt text"
  loading="lazy"              // Lazy load non-critical images
  priority={false}            // Priority for above-fold images
  quality={75}                // Balance quality/size
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### Next.js Image Config
```javascript
// next.config.js
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

### 5. **Consistent Spacing**
Use Tailwind's spacing scale consistently:

```jsx
// Gap between sections
className="mb-16"  // or mb-24, mb-32

// Gap between elements
className="gap-6"  // or gap-8, gap-12

// Padding
className="p-6"    // or p-8
```

### 6. **Color Consistency**
Stick to the defined color palette:

```jsx
// Text colors
text-black       // Primary headings
text-zinc-600    // Body text
text-zinc-400    // Muted text
text-zinc-500    // Labels

// Background colors
bg-white         // Main background
bg-zinc-50       // Subtle sections
bg-black         // Dark sections
```

### 7. **Typography Hierarchy**
Maintain clear visual hierarchy:

```jsx
// Page title
text-4xl md:text-6xl font-bold tracking-tighter

// Section heading
text-3xl md:text-5xl font-bold tracking-tighter

// Sub-heading
text-2xl md:text-3xl font-bold

// Body large
text-lg md:text-xl

// Body regular
text-base md:text-lg

// Small text
text-sm

// Labels
text-xs font-bold uppercase tracking-widest
```

### 8. **Accessibility Guidelines**
- Maintain 4.5:1 contrast ratio for body text
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

```jsx
// Good accessibility
<button 
  onClick={handleClick}
  aria-label="Close modal"
  className="..."
>
  <X className="w-6 h-6" />
</button>

// Image with alt text
<Image src="/photo.jpg" alt="Descriptive text about the image" />
```

### 9. **SEO Best Practices**
```jsx
import Head from 'next/head';

<Head>
  <title>Page Title - Site Name</title>
  <meta name="description" content="Page description" />
  <meta property="og:title" content="Social media title" />
  <meta property="og:description" content="Social description" />
  <meta property="og:image" content="https://domain.com/image.jpg" />
  <link rel="canonical" href="https://domain.com/page" />
</Head>
```

### 10. **Code Organization**
```
components/
  Button.tsx          - Reusable button component
  Modal.tsx           - Reusable modal
  
pages/
  index.tsx           - Home page
  about.tsx           - About page
  [dynamic].tsx       - Dynamic routes
  
styles/
  globals.css         - Minimal global styles
  
lib/
  utils.ts            - Utility functions (cn, etc.)
```

---

## Implementation Checklist

When creating a new project with this style:

### Setup
- [ ] Install Next.js, React, TypeScript
- [ ] Install Tailwind CSS, PostCSS, Autoprefixer
- [ ] Install clsx, tailwind-merge
- [ ] Install lucide-react for icons
- [ ] Copy `globals.css` with CSS variables
- [ ] Copy `tailwind.config.js` with extended colors
- [ ] Create `cn()` utility function

### Components
- [ ] Create `Button` component with variants
- [ ] Create navigation component pattern
- [ ] Create modal/dialog component pattern
- [ ] Create card component patterns
- [ ] Create form input patterns

### Styling
- [ ] Use black/white/zinc color palette
- [ ] Apply system font stack
- [ ] Use bold typography with tight tracking
- [ ] Implement responsive breakpoints
- [ ] Add subtle transitions (200-300ms)

### Best Practices
- [ ] Use semantic HTML
- [ ] Optimize images (WebP, lazy loading)
- [ ] Ensure accessibility (contrast, ARIA, keyboard nav)
- [ ] Add proper meta tags and SEO
- [ ] Test responsive design on all breakpoints

---

## Summary

This design system is characterized by:

1. **Minimalism** - Clean, uncluttered layouts with ample whitespace
2. **High Contrast** - Primarily black text on white (or inverse)
3. **Bold Typography** - Large, tight-tracked headings in system fonts
4. **Utility-First** - 99% Tailwind classes, < 100 lines of custom CSS
5. **Performance** - Optimized images, minimal JavaScript, fast loading
6. **Responsive** - Mobile-first with clear breakpoint strategy
7. **Accessible** - High contrast, semantic HTML, keyboard navigation
8. **Consistent** - Defined spacing, color, and typography scales

Use this document as a reference to replicate the same visual style and design philosophy in other web applications. The key is to embrace simplicity, use Tailwind utilities extensively, and maintain strict consistency in spacing, color, and typography.
