import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Mountain, Calendar, ArrowLeft, Share2, ExternalLink, X, Menu } from 'lucide-react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { blogService } from '../../services/blogService';
import { BlogListItem } from '../../types/blog';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BlogPostPageProps {
  post: BlogListItem;
}

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'white' }>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50",
        "h-12 px-8",
        variant === 'primary' && "bg-black text-white hover:bg-zinc-800",
        variant === 'outline' && "border border-current bg-transparent hover:opacity-60",
        variant === 'white' && "bg-white text-black hover:bg-zinc-200",
        className
      )}
      {...props}
    />
  )
});
Button.displayName = "Button";

export default function BlogPostPage({ post }: BlogPostPageProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    router.push(`/#${id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link gekopieerd naar klembord!');
    }
  };

  // If the page is still being generated, show a loading state
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Head>
        <title>{String(post.title) + ' - Fré Leys Blog'}</title>
        <meta name="description" content={post.excerpt} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.fre2028.la/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.imageUrl && <meta property="og:image" content={post.imageUrl} />}
        <meta property="article:published_time" content={post.date} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://www.fre2028.la/blog/${post.slug}`} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={post.excerpt} />
        {post.imageUrl && <meta property="twitter:image" content={post.imageUrl} />}
        
        <link rel="canonical" href={`https://www.fre2028.la/blog/${post.slug}`} />

        {/* JSON-LD Structured Data for Blog Post */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "image": post.imageUrl || "https://www.fre2028.la/images/web/me_innsbruck_banner_web.webp",
              "datePublished": post.date,
              "author": {
                "@type": "Person",
                "name": "Frederik Leys",
                "url": "https://www.fre2028.la"
              },
              "publisher": {
                "@type": "Person",
                "name": "Frederik Leys",
                "url": "https://www.fre2028.la"
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://www.fre2028.la/blog/${post.slug}`
              }
            })
          }}
        />
      </Head>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white border-zinc-100 py-3" : "bg-white border-zinc-100 py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase text-black cursor-pointer" onClick={() => router.push('/')}>
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-black">
            <button onClick={() => router.push('/')} className="hover:opacity-60 transition-opacity">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:opacity-60 transition-opacity">Mijn verhaal</button>
            <button onClick={() => scrollToSection('journey')} className="hover:opacity-60 transition-opacity">Roadmap</button>
            <button onClick={() => router.push('/partners')} className="hover:opacity-60 transition-opacity">Partners</button>
            <button onClick={() => router.push('/blog')} className="hover:opacity-60 transition-opacity border-b-2 border-black">Blog</button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="inline-flex items-center justify-center text-sm font-semibold tracking-wide transition-all duration-200 h-10 px-6 text-xs ml-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Contact
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <button 
            className="lg:hidden p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-100 transition-all duration-300 overflow-hidden shadow-xl",
          isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-col p-6 gap-6 text-sm font-bold uppercase tracking-widest">
            <button onClick={() => router.push('/')} className="text-left hover:opacity-60">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-left hover:opacity-60">Mijn verhaal</button>
            <button onClick={() => scrollToSection('journey')} className="text-left hover:opacity-60">Roadmap</button>
            <button onClick={() => router.push('/partners')} className="text-left hover:opacity-60">Partners</button>
            <button onClick={() => router.push('/blog')} className="text-left border-b-2 border-black pb-1">Blog</button>
            <Button onClick={() => scrollToSection('contact')} className="w-full">Contact</Button>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="pt-24 pb-8 bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <button 
            onClick={() => router.push('/blog')}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar blog
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Delen
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-8">
            {post.title}
          </h1>

          {/* Post Content */}
          <div 
            className="prose prose-lg prose-zinc max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:leading-relaxed prose-p:text-zinc-700 prose-p:mb-6
              prose-a:text-black prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-black prose-strong:font-bold
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-zinc-700 prose-li:my-2
              prose-img:rounded-lg prose-img:border prose-img:border-zinc-200
              prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-zinc-600
              prose-code:text-sm prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Read on Substack Link */}
          {post.link && (
            <div className="mt-12 pt-8 border-t border-zinc-200">
              <a 
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
              >
                Lees op Substack <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Blijf op de hoogte
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            Ontvang elke maand een update over mijn reis naar de Paralympics.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => router.push('/#newsletter')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Schrijf je in voor de nieuwsbrief
            </Button>
            <Button 
              onClick={() => router.push('/blog')}
              variant="outline"
            >
              Bekijk alle posts
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest cursor-pointer" onClick={() => router.push('/')}>
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </div>
          
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await blogService.getAllBlogSlugs();
  
  const paths = slugs.map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    // Enable fallback to generate pages on-demand for new posts
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await blogService.getBlogPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    // Revalidate every hour (3600 seconds)
    revalidate: 3600,
  };
};
