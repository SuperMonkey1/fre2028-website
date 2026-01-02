import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Video, ArrowLeft } from 'lucide-react';

export default function Node2() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Node 2: Community Engagement - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Node 2: Community Engagement - 900 Days Out" />
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <button 
            onClick={() => router.push('/communication-plan')}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Communication Plan
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            <Video className="w-4 h-4" />
            Node 2
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Community Engagement
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            900 Days Out
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Overview</h2>
          
          <div className="bg-zinc-50 border-l-4 border-black p-6 mb-8">
            <p className="text-lg text-zinc-800 leading-relaxed">
              Node 2 focuses on deep engagement with the Belgian climbing community through an innovative YouTube series 
              that combines entertainment, competition, and awareness-building for paraclimbing and the Paralympics.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zinc-700 leading-relaxed mb-4">
              This node represents a strategic shift from broad awareness to targeted community engagement. By collaborating 
              with Belgium's most famous climbers, we tap directly into the heart of the climbing community—the people most 
              likely to become advocates for paraclimbing.
            </p>
            
            <p className="text-zinc-700 leading-relaxed">
              The beauty of this approach is that it leverages existing audiences. Each famous climber brings their own 
              following, dramatically expanding the reach of the campaign without requiring a large media budget.
            </p>
          </div>
        </div>
      </section>

      {/* The YouTube Series */}
      <section className="py-16 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">The YouTube Series</h2>

          <div className="bg-white/10 border border-white/20 p-8 mb-8">
            <h3 className="text-3xl font-bold mb-4">
              "The Strongest Grip of Belgium"
            </h3>
            <p className="text-xl text-zinc-300 mb-2">A 20-episode competition series</p>
            <p className="text-sm text-zinc-400">Showcasing Belgium's climbing elite while promoting paraclimbing</p>
          </div>

          {/* Concept */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">The Concept</h3>
            
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Format</h4>
                <p className="text-zinc-300 mb-4">
                  Each episode features one of Belgium's top climbers testing their finger strength on a standardized setup. 
                  The setup is designed to be fair, measurable, and repeatable—allowing direct comparison between all participants.
                </p>
                <ul className="space-y-2 text-zinc-400 text-sm list-disc list-inside pl-2">
                  <li>Episode length: 10-15 minutes</li>
                  <li>Consistent testing protocol across all episodes</li>
                  <li>Mix of interview, test footage, and personality showcase</li>
                  <li>Running leaderboard updated each episode</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">The Test Setup</h4>
                <p className="text-zinc-300 mb-4">
                  A carefully designed finger strength test that measures maximum force in a standardized way. The setup 
                  will be professionally built and calibrated to ensure fair and accurate results.
                </p>
                <div className="bg-white/5 p-4 border-l-4 border-white/30 mt-4">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-white">Important:</strong> The same setup will later be used for the gym tour 
                    (see "Future Potential" below), making it a long-term investment in engagement.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">The Prize</h4>
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-600/50 p-6">
                  <p className="text-xl font-bold text-yellow-300 mb-2">The Golden Finger Trophy</p>
                  <p className="text-zinc-300 text-sm">
                    A custom trophy awarded to the climber with the strongest finger strength. This trophy becomes a 
                    symbol of excellence in the Belgian climbing community and creates a memorable brand for the series.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Target Participants</h3>
            
            <div className="bg-white/5 border border-white/10 p-6">
              <p className="text-zinc-300 mb-6">
                The series aims to feature Belgium's most accomplished and well-known climbers across different 
                disciplines and generations:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 border border-white/10">
                  <h4 className="font-bold text-white mb-2">Competition Climbers</h4>
                  <ul className="space-y-1 text-zinc-400 text-sm list-disc list-inside pl-2">
                    <li>National team members</li>
                    <li>World Cup competitors</li>
                    <li>Belgian champions</li>
                  </ul>
                </div>

                <div className="bg-white/5 p-4 border border-white/10">
                  <h4 className="font-bold text-white mb-2">Professional Climbers</h4>
                  <ul className="space-y-1 text-zinc-400 text-sm list-disc list-inside pl-2">
                    <li>Sponsored athletes</li>
                    <li>Content creators</li>
                    <li>Climbing influencers</li>
                  </ul>
                </div>

                <div className="bg-white/5 p-4 border border-white/10">
                  <h4 className="font-bold text-white mb-2">Outdoor Specialists</h4>
                  <ul className="space-y-1 text-zinc-400 text-sm list-disc list-inside pl-2">
                    <li>Famous route developers</li>
                    <li>Big wall climbers</li>
                    <li>Bouldering specialists</li>
                  </ul>
                </div>

                <div className="bg-white/5 p-4 border border-white/10">
                  <h4 className="font-bold text-white mb-2">Climbing Legends</h4>
                  <ul className="space-y-1 text-zinc-400 text-sm list-disc list-inside pl-2">
                    <li>Retired champions</li>
                    <li>Industry pioneers</li>
                    <li>Community icons</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Episode Structure */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Episode Structure</h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">1. Introduction (2 minutes)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Brief recap of the series and current leaderboard</li>
                  <li>Introduction of this episode's climber</li>
                  <li>Their background and achievements</li>
                </ul>
              </div>

              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">2. Interview Segment (3-4 minutes)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Conversation about their climbing journey</li>
                  <li>Discussion about finger strength training</li>
                  <li>Their predictions for the test</li>
                  <li>Views on paraclimbing and Paralympics</li>
                </ul>
              </div>

              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">3. The Test (4-5 minutes)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Warm-up footage</li>
                  <li>Multiple test attempts</li>
                  <li>Real-time reactions</li>
                  <li>Final result reveal</li>
                </ul>
              </div>

              <div className="bg-white/5 border-l-4 border-white/30 p-6">
                <h4 className="font-bold text-white mb-2">4. Wrap-up (2-3 minutes)</h4>
                <ul className="space-y-1 text-zinc-300 text-sm list-disc list-inside pl-2">
                  <li>Leaderboard update</li>
                  <li>Climber's reaction to their placement</li>
                  <li>Teaser for next episode</li>
                  <li>Call to action (subscribe, follow, support)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goals & Strategy */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Strategic Goals</h2>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">1. Direct Paraclimbing Promotion</h3>
              <p className="text-zinc-700 mb-4">
                By featuring paraclimbing prominently in each episode, we introduce the sport to climbers who may have 
                never heard of it. The series becomes an educational tool disguised as entertainment.
              </p>
              <div className="bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  Each episode includes a brief segment about paraclimbing, the Paralympics, and my journey to LA 2028.
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">2. Leverage Existing Audiences</h3>
              <p className="text-zinc-700 mb-4">
                Every participant will share their episode with their followers, dramatically expanding reach without 
                requiring paid advertising.
              </p>
              <div className="bg-green-50 p-4 border border-green-200">
                <p className="text-sm text-green-900">
                  <strong>The multiplier effect:</strong> If each of 20 climbers has 2,000-10,000 followers, the series 
                  potentially reaches 40,000-200,000 people through organic sharing alone.
                </p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">3. Build Campaign Credibility</h3>
              <p className="text-zinc-700 mb-4">
                Association with famous climbers lends credibility and legitimacy to the campaign. It positions me 
                as part of the broader Belgian climbing community, not an outsider asking for support.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">4. Create Shareable Content</h3>
              <p className="text-zinc-700 mb-4">
                The competitive element and leaderboard create natural suspense and shareability. People will want 
                to see how their favorite climber performs and debate the results.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">5. Generate Long-term Assets</h3>
              <p className="text-zinc-700 mb-4">
                20 episodes of quality content become permanent assets for the campaign. They can be re-shared, 
                referenced, and used to attract sponsors who want association with these athletes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Potential */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Future Potential</h2>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">The Climbing Gym Tour</h3>
            <p className="text-lg text-zinc-800 mb-4">
              After the series concludes, the test setup becomes a touring activation that visits climbing gyms 
              across Belgium.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h4 className="font-bold text-lg mb-3">How It Works</h4>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside pl-2">
                <li>The same standardized test setup travels to different gyms</li>
                <li>All climbers can test their finger strength</li>
                <li>Results are compared against the 20 famous climbers from the series</li>
                <li>Local leaderboards created for each gym</li>
                <li>National leaderboard shows everyone's ranking</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h4 className="font-bold text-lg mb-3">Benefits</h4>
              <div className="space-y-3 text-zinc-700">
                <p>
                  <strong>For climbers:</strong> Fun challenge and chance to compare themselves to the pros
                </p>
                <p>
                  <strong>For gyms:</strong> Free activation/event that brings members together
                </p>
                <p>
                  <strong>For the campaign:</strong> Direct interaction with thousands of climbers, building awareness 
                  and community at the grassroots level
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-6">
              <h4 className="font-bold text-lg mb-3 text-blue-900">Global Expansion Possibility</h4>
              <p className="text-blue-800 text-sm">
                If successful in Belgium, the concept could expand internationally. Replicate the series in other 
                countries, creating a global "Strongest Grip" championship that promotes paraclimbing worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Plan */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Production Plan</h2>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 font-bold text-sm text-zinc-600">Months 1-2</div>
                  <div className="text-zinc-700">
                    <p className="font-bold mb-1">Pre-production</p>
                    <p className="text-sm">Setup design & building, participant outreach, filming schedule</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 font-bold text-sm text-zinc-600">Months 3-7</div>
                  <div className="text-zinc-700">
                    <p className="font-bold mb-1">Production</p>
                    <p className="text-sm">Film all 20 episodes (4 episodes per month)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-24 font-bold text-sm text-zinc-600">Months 3-12</div>
                  <div className="text-zinc-700">
                    <p className="font-bold mb-1">Release</p>
                    <p className="text-sm">Weekly releases (one episode every 1-2 weeks)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Resources Needed</h3>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside pl-2">
                <li><strong>Equipment:</strong> Professional test setup (force gauge, standardized hold, mounting system)</li>
                <li><strong>Video:</strong> Camera, lighting, audio equipment (can be relatively simple setup)</li>
                <li><strong>Editing:</strong> Video editing software and skills (potentially outsourced)</li>
                <li><strong>Location:</strong> Consistent filming location (climbing gym or training space)</li>
                <li><strong>Graphics:</strong> Intro/outro graphics, leaderboard graphics, lower thirds</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Budget Considerations</h3>
              <div className="space-y-3 text-zinc-700">
                <p>
                  <strong>Test Setup:</strong> €500-1,500 (one-time investment, reusable for gym tour)
                </p>
                <p>
                  <strong>Trophy:</strong> €200-500 (custom golden finger trophy)
                </p>
                <p>
                  <strong>Video Production:</strong> €0-2,000 (depending on equipment already owned vs. needed)
                </p>
                <p>
                  <strong>Editing:</strong> €0-1,500 (DIY vs. outsourced editing)
                </p>
                <p className="pt-3 border-t border-zinc-200 font-bold">
                  Total Estimated: €700-5,500
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 md:py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Success Metrics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">YouTube Performance</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• 2,000+ views per episode</li>
                <li>• 1,000+ channel subscribers</li>
                <li>• 5%+ engagement rate (likes, comments)</li>
                <li>• High watch time (60% completion rate)</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Participant Engagement</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• 20 episodes completed</li>
                <li>• 80%+ participant sharing rate</li>
                <li>• Cross-promotion on participant channels</li>
                <li>• Positive participant feedback</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Campaign Impact</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Increased website traffic from series</li>
                <li>• Newsletter signups from viewers</li>
                <li>• Social media follower growth</li>
                <li>• Media coverage of the series</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Community Awareness</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Measurable increase in paraclimbing awareness</li>
                <li>• Comments/discussions about Paralympics</li>
                <li>• Interest from new potential partners</li>
                <li>• Setup requests for gym tour</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.push('/communication-plan/node-1')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Node 1
            </button>
            <button 
              onClick={() => router.push('/communication-plan/node-3')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              Next: Node 3
              <span className="rotate-180"><ArrowLeft className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
