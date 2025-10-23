import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  ArrowLeft, 
  Calendar, 
  Award, 
  Heart,
  Zap,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---
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
})
Button.displayName = "Button"

// --- Story Data ---
const STORY_CHAPTERS = [
  {
    id: 'beginning',
    year: '1995-2018',
    title: 'Before the Fall',
    subtitle: 'Life in Full Motion',
    content: [
      'Born and raised in Ghent, I lived what many would call a complete life. I was active, ambitious, and always seeking the next adventure. My world was one of endless possibilities, where physical limitations were foreign concepts.',
      'I worked in construction, loved motorcycles, and spent weekends exploring the outdoors. Life was straightforward: work hard, play harder, and never look back. The idea that this could all change in an instant never crossed my mind.',
      'Looking back now, I realize I was living unconsciously - taking my abilities for granted, never truly appreciating the simple act of walking or the full use of my hands. It\'s a luxury most people never consider until it\'s gone.'
    ]
  },
  {
    id: 'accident',
    year: '2018',
    title: 'The Moment Everything Changed',
    subtitle: 'A Split Second That Rewrote My Story',
    content: [
      'May 15th, 2018. A date that will forever be etched in my memory. What started as a routine motorcycle ride through the Belgian countryside ended with me lying on the asphalt, my life forever altered.',
      'The accident happened so fast that I barely remember the impact. One moment I was riding, feeling the wind and freedom that only a motorcycle can provide, and the next I was waking up in a hospital bed, surrounded by machines and concerned faces.',
      'The diagnosis was devastating: complete spinal cord injury at the T12 level, along with significant damage to my left arm. The doctors spoke in medical terms that felt foreign, but the reality was simple - I would never walk again, and my left arm would have limited function.',
      'The physical pain was intense, but it paled in comparison to the emotional devastation. I went through all the stages of grief - denial, anger, bargaining, depression. I questioned everything: Why me? What was the point of continuing? How could I rebuild a life that felt completely shattered?'
    ]
  },
  {
    id: 'darkest',
    year: '2018-2019',
    title: 'The Darkest Valley',
    subtitle: 'When Hope Feels Impossible',
    content: [
      'The months following my accident were the darkest of my life. Confined to a hospital bed, then a wheelchair, I watched the world continue around me while I felt completely stuck. Simple tasks that I had never thought about - getting dressed, cooking, even using the bathroom - became monumental challenges.',
      'Depression hit hard. There were days when I couldn\'t see any reason to get out of bed, when the future looked like nothing but limitations and barriers. My identity had been so tied to my physical capabilities that without them, I felt like I had lost myself entirely.',
      'Friends meant well, but many didn\'t know how to act around me anymore. Some disappeared altogether. Family tried to help, but they were dealing with their own grief about my condition. I felt isolated, angry, and utterly lost.',
      'Physical therapy was grueling and often felt pointless. Every small gain was overshadowed by the enormous mountain of limitations I now faced. The therapists spoke about "adaptation" and "new normals," but all I could think about was everything I had lost.'
    ]
  },
  {
    id: 'discovery',
    year: '2019',
    title: 'Finding the Wall',
    subtitle: 'When Everything Started to Make Sense Again',
    content: [
      'The turning point came in late 2019, almost a year and a half after my accident. A friend from the climbing community - someone I had barely known before - invited me to try adaptive climbing at a local gym in Brussels. My initial reaction was skepticism mixed with fear. How could someone like me possibly climb?',
      'But something inside me was curious. Maybe it was desperation, or maybe it was the first spark of hope I had felt in months. I agreed to try, though I was convinced it would only highlight my new limitations.',
      'The moment I touched the wall, something shifted. Yes, I had to approach it completely differently than I would have before. Yes, I had to rely more heavily on my right arm and core strength. But I was moving vertically again. I was problem-solving, pushing my body, feeling that familiar burn of physical challenge.',
      'For the first time since my accident, I wasn\'t focusing on what I couldn\'t do - I was discovering what I could do. The wall didn\'t judge my disability; it only responded to my effort, technique, and determination. In that moment, I found a piece of myself I thought was lost forever.'
    ]
  },
  {
    id: 'growth',
    year: '2020-2022',
    title: 'Building Strength',
    subtitle: 'From Survivor to Athlete',
    content: [
      'What started as therapy quickly became obsession - in the best possible way. I threw myself into climbing with the same intensity I had once brought to my pre-accident life, but now with a deeper appreciation for every small improvement.',
      'I learned about paraclimbing as a competitive sport and discovered there was an entire community of adaptive athletes pushing boundaries I didn\'t know existed. I wasn\'t alone in this journey, and there were people achieving things that seemed impossible.',
      'Training became my new routine. Every day in the gym was a battle against my limitations, but also a celebration of my capabilities. I worked with coaches who specialized in adaptive techniques, learning to maximize my remaining strength and develop new movement patterns.',
      'My first competition was terrifying. I had no idea how I would measure against other paraclimbers. But crossing that finish line - even though I didn\'t place well - felt like winning an Olympic gold medal. I was an athlete again, not just a survivor.',
      'Word began to spread in the Belgian climbing community about this new paraclimber who was pushing grades and competing seriously. I started to realize that my story might inspire others, that my journey could have meaning beyond just my own recovery.'
    ]
  },
  {
    id: 'breakthrough',
    year: '2023',
    title: 'World Championship Silver',
    subtitle: 'Proving It to Myself and the World',
    content: [
      'The 2023 IFSC World Championships in Bern, Switzerland, was my breakthrough moment. I had been training intensively for this competition, knowing it would be my first real test on the world stage.',
      'The AL-2 category (Athletes with limb deficiency affecting two limbs) is incredibly competitive. These aren\'t people who see climbing as therapy - these are elite athletes who happen to have disabilities. The level of climbing was phenomenal.',
      'Throughout the competition, I felt more focused and determined than ever before. Each route was a puzzle that required not just physical strength, but mental strategy and technical precision. I was climbing some of the hardest routes of my life.',
      'When they announced that I had won the silver medal, I couldn\'t believe it. Five years earlier, I was learning how to transfer from a bed to a wheelchair. Now I was standing on a world championship podium, representing Belgium and proving that limitations are often just starting points.',
      'That medal wasn\'t just about climbing - it was validation of every dark day I had pushed through, every training session when I wanted to quit, every person who had supported me along the way. It was proof that rock bottom can be a foundation.'
    ]
  },
  {
    id: 'mission',
    year: '2024-Present',
    title: 'Beyond Personal Goals',
    subtitle: 'Creating Opportunities for Others',
    content: [
      'Success brought responsibility. I realized that my platform as a world-level paraclimber gave me the opportunity to create change beyond just my own achievements. That\'s when paraclimbing.be was born.',
      'I had experienced firsthand how transformative adaptive climbing could be, but I also knew how difficult it was to get started. Most climbing gyms weren\'t equipped for adaptive climbers, many people with disabilities didn\'t even know paraclimbing existed, and there was no central resource for getting involved.',
      'Paraclimbing.be became my mission to ensure that every person with a physical disability in Belgium has the opportunity to experience what I experienced - that moment of rediscovering strength and capability on the wall.',
      'We organize initiation days, work with gyms to provide adaptive equipment, and build a community of paraclimbers who support each other. Seeing someone climb for the first time after an injury brings me more joy than any medal could.',
      'The 2024 World Cup gold medal in Innsbruck was incredible, but what makes me most proud is the growing community of adaptive climbers we\'re building. Sport saved my life - now I want to use sport to transform other lives.'
    ]
  },
  {
    id: 'la2028',
    year: '2025-2028',
    title: 'Los Angeles Dreams',
    subtitle: 'The Ultimate Goal',
    content: [
      'The 2028 Paralympics in Los Angeles represents everything I\'ve been working toward since I first touched that climbing wall in 2019. It\'s not just about winning a medal - though I absolutely intend to - it\'s about representing resilience on the world\'s biggest stage.',
      'The next three years will be the most challenging of my climbing career. The competition is getting stronger every year, and I\'m not getting younger. But I\'ve learned that challenges are just opportunities in disguise.',
      'My training plan is methodical and intense: strength conditioning in Brussels, technical work in Fontainebleau, competition preparation across Europe, and mental conditioning with sports psychologists. Every aspect of my performance is being optimized.',
      'But beyond the personal goal, LA 2028 is a platform to show the world what adaptive athletes can achieve. It\'s a chance to inspire not just people with disabilities, but anyone who has faced seemingly insurmountable obstacles.',
      'When I roll up to that wall in Los Angeles, I won\'t just be carrying my own dreams - I\'ll be carrying the dreams of every person who was told they couldn\'t, every athlete who refused to accept limitations, and every individual who chose to rebuild rather than surrender.',
      'The wall doesn\'t care about your story. It only cares about what you bring to it in that moment. And I plan to bring everything I have.'
    ]
  }
];

const PERSONAL_STATS = [
  { icon: Calendar, label: 'Years Climbing', value: '5+' },
  { icon: Award, label: 'International Medals', value: '12+' },
  { icon: TrendingUp, label: 'Hardest Grade', value: '8a+' },
  { icon: Users, label: 'People Inspired', value: '500+' }
];

export default function StoryPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-white/95 backdrop-blur-sm border-zinc-200",
        isScrolled ? "py-3 shadow-sm" : "py-4 md:py-6"
      )}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 font-bold text-lg tracking-widest uppercase text-black hover:opacity-60 transition-opacity"
          >
             <Mountain className="w-6 h-6" />
             <span>Fré.Climbs</span>
          </button>

          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="h-10 px-6 text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-block px-4 py-2 mb-6 md:mb-8 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            My Complete Journey
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter leading-none mb-6 md:mb-8">
            FROM ROCK BOTTOM<br />TO THE <span className="text-zinc-600">TOP</span>.
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            This is the unfiltered story of how a motorcycle accident became the beginning 
            of the most meaningful chapter of my life.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {PERSONAL_STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-4 opacity-60" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Chapters */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="space-y-24 md:space-y-32">
            {STORY_CHAPTERS.map((chapter, index) => (
              <div key={chapter.id} className="relative">
                {/* Chapter Header */}
                <div className="mb-8 md:mb-12">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-zinc-400">
                      {chapter.year}
                    </span>
                    <div className="flex-1 h-px bg-zinc-200" />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
                    {chapter.title}
                  </h2>
                  <p className="text-base md:text-lg text-zinc-600 italic">
                    {chapter.subtitle}
                  </p>
                </div>

                {/* Chapter Content */}
                <div className="space-y-4 md:space-y-6 text-base md:text-lg leading-relaxed text-zinc-700">
                  {chapter.content.map((paragraph, pIndex) => (
                    <p key={pIndex}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Chapter Visual Separator */}
                {index < STORY_CHAPTERS.length - 1 && (
                  <div className="mt-12 md:mt-16 flex justify-center">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-6 md:mb-8">
            This Is Just The Beginning.
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 mb-10 md:mb-12 max-w-2xl mx-auto">
            The road to LA 2028 continues, and every supporter makes this journey possible. 
            Join me as we redefine what's possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <Button 
              onClick={() => router.push('/#journey')}
              className="min-w-[200px]"
            >
              View Roadmap
            </Button>
            <Button 
              onClick={() => router.push('/#contact')}
              variant="outline"
              className="min-w-[200px]"
            >
              Partner With Me
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <Mountain className="w-6 h-6" />
            <span>Fré.Climbs</span>
          </button>
          
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            © 2025 Fré Leys
          </div>
        </div>
      </footer>
    </div>
  )
}