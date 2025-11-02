import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Mountain, Calendar, ArrowLeft, Share2, ExternalLink, X, Mail } from 'lucide-react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { blogService } from '../../services/blogService';
import { BlogListItem } from '../../types/blog';
import { newsletterService } from '../../services/newsletterService';
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
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await newsletterService.subscribe(email);
      setSubmitMessage('Bedankt voor je inschrijving!');
      setEmail('');
      setTimeout(() => {
        setIsNewsletterOpen(false);
        setSubmitMessage('');
      }, 2000);
    } catch (error: any) {
      setSubmitMessage(error.message || 'Er is iets misgegaan. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white border-zinc-100",
        isScrolled ? "py-3" : "py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </button>

          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar home
          </Button>
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
              onClick={() => setIsNewsletterOpen(true)}
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

      {/* Newsletter Modal */}
      {isNewsletterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsNewsletterOpen(false)}>
          <div className="bg-white max-w-md w-full p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsNewsletterOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <Mail className="w-12 h-12 mb-4" />
              <h3 className="text-3xl font-bold tracking-tighter mb-3">
                Schrijf je in voor mijn gratis nieuwsbrief
              </h3>
              <p className="text-zinc-600">
                Ontvang elke maand een update
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 bg-zinc-50 border border-zinc-200 focus:border-black focus:outline-none transition-colors text-lg"
                  placeholder="jouw@email.com"
                  disabled={isSubmitting}
                />
              </div>

              {submitMessage && (
                <div className={cn(
                  "text-sm font-medium p-3 border",
                  submitMessage.includes('Bedankt') 
                    ? "bg-green-50 text-green-800 border-green-200" 
                    : "bg-red-50 text-red-800 border-red-200"
                )}>
                  {submitMessage}
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full !bg-red-600 hover:!bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Bezig...' : 'Inschrijven'}
              </Button>
            </form>
          </div>
        </div>
      )}
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
