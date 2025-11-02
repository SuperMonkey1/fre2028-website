import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Mountain, Calendar, ArrowRight, BookOpen, ArrowLeft, X, Mail } from 'lucide-react';
import { BlogListItem } from '../types/blog';
import { newsletterService } from '../services/newsletterService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BlogPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/blog/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const fetchedPosts = await response.json();
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error loading blog posts:', err);
        setError('Er is een fout opgetreden bij het laden van de blogposts.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-BE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Head>
        <title>Blog - Fré Leys | Updates over mijn reis naar Los Angeles 2028</title>
        <meta name="description" content="Lees de laatste updates, verhalen en inzichten van Frederik 'Fré' Leys over zijn reis naar de Paralympische Spelen 2028 in Los Angeles." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.fre2028.la/blog" />
        <meta property="og:title" content="Blog - Fré Leys | Road to Paralympics 2028" />
        <meta property="og:description" content="Lees de laatste updates, verhalen en inzichten van Frederik 'Fré' Leys over zijn reis naar de Paralympische Spelen 2028." />
        <meta property="og:image" content="https://www.fre2028.la/images/web/me_innsbruck_banner_web.webp" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.fre2028.la/blog" />
        <meta property="twitter:title" content="Blog - Fré Leys | Road to Paralympics 2028" />
        <meta property="twitter:description" content="Lees de laatste updates, verhalen en inzichten van Frederik 'Fré' Leys." />
        <meta property="twitter:image" content="https://www.fre2028.la/images/web/me_innsbruck_banner_web.webp" />
        
        <link rel="canonical" href="https://www.fre2028.la/blog" />
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              <BookOpen className="w-4 h-4" />
              Blog
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
              UPDATES.
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed">
              Volg mijn reis naar Los Angeles 2028. Van trainingen tot competities, van uitdagingen tot overwinningen.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-zinc-300 border-t-black rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-zinc-600 mb-4">Loading posts...</p>
              <p className="text-zinc-500">Even geduld terwijl we de laatste updates ophalen.</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-red-300" />
              <p className="text-xl text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-zinc-500 hover:text-zinc-700 underline"
              >
                Probeer opnieuw
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-zinc-300" />
              <p className="text-xl text-zinc-600 mb-4">Nog geen blogposts beschikbaar.</p>
              <p className="text-zinc-500">Check binnenkort terug voor updates!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <article 
                  key={post.slug}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/blog/${post.slug}`)}
                >
                  {/* Featured Image */}
                  <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden mb-6 border border-zinc-200">
                    {post.imageUrl ? (
                      <Image 
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div>
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-zinc-600 transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-zinc-600 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Read More Link */}
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black group-hover:gap-4 transition-all">
                      Lees meer <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Mis geen enkel update
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            Schrijf je in voor mijn nieuwsbrief en ontvang elke maand een update over mijn reis naar de Paralympics.
          </p>
          <Button 
            onClick={() => setIsNewsletterOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Schrijf je in
          </Button>
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
