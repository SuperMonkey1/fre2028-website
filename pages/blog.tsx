import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Mountain, Calendar, ArrowRight, BookOpen, X, Menu } from 'lucide-react';
import { GetStaticProps } from 'next';
import { blogService } from '../services/blogService';
import { BlogListItem } from '../types/blog';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BlogPageProps {
  posts: BlogListItem[];
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

export default function BlogPage({ posts }: BlogPageProps) {
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
          {posts.length === 0 ? (
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
            onClick={() => router.push('/#newsletter')}
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
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await blogService.fetchBlogPostsListing(); // Use lightweight version
  
  return {
    props: {
      posts,
    },
    // Revalidate every hour (3600 seconds)
    revalidate: 3600,
  };
};
