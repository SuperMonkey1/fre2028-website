import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, ArrowLeft } from 'lucide-react';

export default function Node3() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Node 3: Event Hosting - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Node 3: Event Hosting - Belgian Paraclimbing Championship, 800 Days Out" />
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
            <Mountain className="w-4 h-4" />
            Node 3
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Event Hosting
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            800 Days Out - Belgian Paraclimbing Championship
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Overview</h2>
          
          <div className="bg-zinc-50 border-l-4 border-black p-6 mb-8">
            <p className="text-lg text-zinc-800 leading-relaxed">
              Node 3 centers on organizing the <strong>Belgian Paraclimbing Championship</strong>, an open competition 
              that serves multiple strategic purposes: growing the Belgian paraclimbing community, providing international 
              exposure, and training Belgian routesetters in paraclimbing-specific techniques.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zinc-700 leading-relaxed mb-4">
              This event is more than just a competition—it's an investment in the future of Belgian paraclimbing. By 
              creating infrastructure (trained routesetters) and community (new paraclimbers), we're building a 
              sustainable ecosystem that will outlast my personal journey to LA 2028.
            </p>
            
            <p className="text-zinc-700 leading-relaxed">
              The strategic timing—scheduled the weekend after a major international paraclimbing competition in Austria—
              maximizes international participation while minimizing travel burden for athletes.
            </p>
          </div>
        </div>
      </section>

      {/* The Event */}
      <section className="py-16 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">The Event</h2>

          <div className="bg-white/10 border border-white/20 p-8 mb-8">
            <h3 className="text-3xl font-bold mb-4">Belgian Paraclimbing Championship</h3>
            <p className="text-xl text-zinc-300 mb-2">An open international competition</p>
            <p className="text-sm text-zinc-400">Organized by BVKB Klimax and paraclimbing.be</p>
          </div>

          {/* Event Details */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Event Details</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">When</h4>
                <p className="text-zinc-300 mb-2">June 20-21 (tentative)</p>
                <p className="text-sm text-zinc-400">
                  Weekend immediately following the Austrian international competition
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Where</h4>
                <p className="text-zinc-300 mb-2">Klimax Climbing Gym, Leuven</p>
                <p className="text-sm text-zinc-400">
                  Home gym of BVKB climbing club
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Organizers</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• BVKB (climbing club)</li>
                  <li>• Klimax (climbing gym)</li>
                  <li>• paraclimbing.be (non-profit)</li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <h4 className="font-bold text-lg mb-3 text-white">Expected Participants</h4>
                <ul className="space-y-1 text-zinc-300 text-sm">
                  <li>• International paraclimbers (primary)</li>
                  <li>• Belgian paraclimbers (growing community)</li>
                  <li>• New participants from initiation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Timing */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Strategic Timing</h3>
            
            <div className="bg-white/5 border border-white/10 p-6">
              <h4 className="font-bold text-lg mb-3 text-white">The "Hop By" Strategy</h4>
              <p className="text-zinc-300 mb-4">
                By scheduling immediately after a major Austrian competition, we make it convenient for international 
                athletes to participate in both events without requiring separate travel.
              </p>

              <div className="bg-blue-900/30 border border-blue-500/30 p-4">
                <p className="text-sm text-blue-200">
                  <strong className="text-blue-100">Example Journey:</strong> Athlete travels from home country → 
                  Austrian competition (Friday-Sunday) → Belgian competition (Friday-Saturday, following week) → 
                  Return home. This requires only one trip to Europe instead of two separate journeys.
                </p>
              </div>

              <div className="mt-4 space-y-2 text-zinc-400 text-sm">
                <p><strong className="text-white">Benefits:</strong></p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>Reduced travel costs for athletes</li>
                  <li>Less time away from work/training</li>
                  <li>Environmental benefits (fewer flights)</li>
                  <li>Higher likelihood of strong international field</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Day Structure */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Two-Day Event Structure</h2>

          <div className="space-y-8">
            {/* Day 1 */}
            <div className="bg-gradient-to-r from-green-50 to-white border-l-4 border-green-600 p-8">
              <div className="mb-6">
                <div className="inline-block px-4 py-2 mb-2 bg-green-600 text-white text-xs font-bold uppercase tracking-wider">
                  Day 1 - Friday, June 20
                </div>
                <h3 className="text-2xl font-bold">Climbing Initiation for New Belgian Paraclimbers</h3>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-700 leading-relaxed">
                  The first day focuses on welcoming new Belgian paraclimbers to the sport through structured 
                  introduction and hands-on experience.
                </p>

                <div className="bg-white border border-zinc-200 p-6">
                  <h4 className="font-bold mb-3">Program Overview</h4>
                  <div className="space-y-3 text-sm text-zinc-700">
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">9:00-10:00</span>
                      <div>
                        <p className="font-bold">Welcome & Introduction</p>
                        <p className="text-zinc-600">Registration, equipment fitting, safety briefing</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">10:00-12:00</span>
                      <div>
                        <p className="font-bold">Paraclimbing 101</p>
                        <p className="text-zinc-600">Introduction to different categories, rules, and techniques</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">12:00-13:00</span>
                      <div>
                        <p className="font-bold">Lunch</p>
                        <p className="text-zinc-600">Community building and networking</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">13:00-16:00</span>
                      <div>
                        <p className="font-bold">Practice Sessions</p>
                        <p className="text-zinc-600">Guided climbing on various routes, personalized coaching</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">16:00-17:00</span>
                      <div>
                        <p className="font-bold">Q&A and Wrap-up</p>
                        <p className="text-zinc-600">Open discussion, resources, next steps</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4">
                  <h4 className="font-bold mb-2 text-green-900">Goals for Day 1</h4>
                  <ul className="space-y-1 text-sm text-green-800 list-disc list-inside pl-2">
                    <li>Introduce at least 10-15 new Belgian climbers to paraclimbing</li>
                    <li>Provide safe, supportive first climbing experience</li>
                    <li>Build community among Belgian paraclimbers</li>
                    <li>Identify potential future competitors</li>
                    <li>Create content (photos, videos) showcasing Belgian paraclimbing growth</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Day 2 */}
            <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-600 p-8">
              <div className="mb-6">
                <div className="inline-block px-4 py-2 mb-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                  Day 2 - Saturday, June 21
                </div>
                <h3 className="text-2xl font-bold">Paraclimbing Routesetting Course</h3>
              </div>

              <div className="space-y-4">
                <p className="text-zinc-700 leading-relaxed">
                  The second day trains Belgian routesetters in the specific skills needed to set quality routes 
                  for paraclimbing competitions, while the new paraclimbers from Day 1 test the routes.
                </p>

                <div className="bg-white border border-zinc-200 p-6">
                  <h4 className="font-bold mb-3">Program Overview</h4>
                  <div className="space-y-3 text-sm text-zinc-700">
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">9:00-10:00</span>
                      <div>
                        <p className="font-bold">Course Introduction</p>
                        <p className="text-zinc-600">Paraclimbing categories, classification system, IFSC rules</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">10:00-12:30</span>
                      <div>
                        <p className="font-bold">Routesetting Theory</p>
                        <p className="text-zinc-600">Category-specific setting techniques, accessibility considerations</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">12:30-13:30</span>
                      <div>
                        <p className="font-bold">Lunch</p>
                        <p className="text-zinc-600">Discussion and knowledge sharing</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">13:30-16:00</span>
                      <div>
                        <p className="font-bold">Practical Setting</p>
                        <p className="text-zinc-600">Routesetters create routes for different categories</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">16:00-18:00</span>
                      <div>
                        <p className="font-bold">Testing & Feedback</p>
                        <p className="text-zinc-600">New paraclimbers test routes, setters observe and learn</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-bold w-24 flex-shrink-0">18:00-19:00</span>
                      <div>
                        <p className="font-bold">Debrief & Certification</p>
                        <p className="text-zinc-600">Course wrap-up, certificate distribution</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4">
                  <h4 className="font-bold mb-2 text-blue-900">Goals for Day 2</h4>
                  <ul className="space-y-1 text-sm text-blue-800 list-disc list-inside pl-2">
                    <li>Train 8-12 Belgian routesetters in paraclimbing-specific techniques</li>
                    <li>Create a pool of qualified setters for future Belgian events</li>
                    <li>Provide real testing opportunity for Day 1 participants</li>
                    <li>Build relationships between setters and climbers</li>
                    <li>Establish Belgium as a competent host for international paraclimbing events</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* The Synergy */}
          <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-8">
            <h3 className="text-2xl font-bold mb-4">The Perfect Synergy</h3>
            <p className="text-zinc-700 mb-4">
              The two-day structure creates a mutually beneficial ecosystem:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/80 p-4 border border-purple-200">
                <h4 className="font-bold mb-2">Day 1 Provides Day 2 with:</h4>
                <ul className="space-y-1 text-sm text-zinc-700 list-disc list-inside pl-2">
                  <li>Test climbers for new routes</li>
                  <li>Real feedback on route quality</li>
                  <li>Diverse ability levels to challenge setters</li>
                </ul>
              </div>
              <div className="bg-white/80 p-4 border border-purple-200">
                <h4 className="font-bold mb-2">Day 2 Provides Day 1 with:</h4>
                <ul className="space-y-1 text-sm text-zinc-700 list-disc list-inside pl-2">
                  <li>Fresh routes to climb and practice on</li>
                  <li>Continued engagement and learning</li>
                  <li>Sense of contributing to something larger</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Competition Weekend */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">The Championship Competition</h2>

          <div className="bg-white border border-zinc-200 p-8 mb-8">
            <p className="text-zinc-700 mb-4">
              In addition to (or integrated with) the two-day program, the actual <strong>Belgian Paraclimbing Championship</strong> 
              competition takes place. This is an official ranking event open to all paraclimbers.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> The exact integration of the competition with the initiation and training days 
                is flexible and will be determined based on participant numbers and logistical considerations.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Competition Format</h3>
              <ul className="space-y-2 text-zinc-700 list-disc list-inside pl-2">
                <li>IFSC-sanctioned paraclimbing competition</li>
                <li>Multiple categories based on disability classification</li>
                <li>Boulder and/or lead format (to be determined)</li>
                <li>Open to international participants</li>
                <li>Belgian Championship titles awarded to top Belgian climbers in each category</li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Expected Participation</h3>
              <div className="space-y-3 text-zinc-700">
                <p>
                  <strong>International climbers:</strong> 20-40 athletes (depending on Austrian competition participation)
                </p>
                <p>
                  <strong>Belgian climbers:</strong> 5-10 existing + 10-15 new from initiation = 15-25 total
                </p>
                <p className="pt-3 border-t border-zinc-200">
                  <strong>Total expected:</strong> 35-65 competitors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Goals */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Strategic Goals</h2>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">1. Grow the Belgian Paraclimbing Community</h3>
              <p className="text-zinc-700">
                By actively recruiting and training new paraclimbers, we're building the community from the ground up. 
                A larger community means more support, more competition, and more visibility for the sport.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">2. Build Competition Infrastructure</h3>
              <p className="text-zinc-700">
                Training routesetters creates the expertise needed to host future competitions. This makes Belgium a 
                viable host nation and raises the standard of domestic events.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">3. Generate International Exposure</h3>
              <p className="text-zinc-700">
                Hosting international athletes brings media attention, social media coverage, and credibility to both 
                the event and my personal campaign. International athletes' social posts reach global audiences.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">4. Create Media Content</h3>
              <p className="text-zinc-700">
                The event provides rich content opportunities: competition highlights, new climber stories, setter training 
                footage, international athlete interviews—all valuable for ongoing campaign content.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">5. Demonstrate Leadership</h3>
              <p className="text-zinc-700">
                Organizing a successful international event positions me as a leader in Belgian paraclimbing, not just 
                a competitor. This strengthens partnership opportunities and media narratives.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-3">6. Long-term Sport Development</h3>
              <p className="text-zinc-700">
                This event creates sustainable impact beyond my personal journey. Trained setters and new climbers will 
                continue to grow Belgian paraclimbing for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Budget & Resources */}
      <section className="py-16 md:py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Budget & Resources</h2>

          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Venue & Equipment</h3>
              <ul className="space-y-2 text-zinc-700">
                <li className="flex justify-between">
                  <span>Gym rental (2 days)</span>
                  <span className="font-mono">€500-1,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Safety equipment</span>
                  <span className="font-mono">€200-500</span>
                </li>
                <li className="flex justify-between">
                  <span>Holds and setting materials</span>
                  <span className="font-mono">€300-600</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Staff & Instruction</h3>
              <ul className="space-y-2 text-zinc-700">
                <li className="flex justify-between">
                  <span>Expert routesetting instructor</span>
                  <span className="font-mono">€500-1,000</span>
                </li>
                <li className="flex justify-between">
                  <span>Paraclimbing coaches (Day 1)</span>
                  <span className="font-mono">€300-600</span>
                </li>
                <li className="flex justify-between">
                  <span>Competition staff</span>
                  <span className="font-mono">€400-800</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Participant Support</h3>
              <ul className="space-y-2 text-zinc-700">
                <li className="flex justify-between">
                  <span>Catering (2 days)</span>
                  <span className="font-mono">€400-800</span>
                </li>
                <li className="flex justify-between">
                  <span>Course materials & certificates</span>
                  <span className="font-mono">€100-200</span>
                </li>
                <li className="flex justify-between">
                  <span>Prizes & awards</span>
                  <span className="font-mono">€200-500</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <h3 className="font-bold text-xl mb-4">Marketing & Media</h3>
              <ul className="space-y-2 text-zinc-700">
                <li className="flex justify-between">
                  <span>Photographer/videographer</span>
                  <span className="font-mono">€300-800</span>
                </li>
                <li className="flex justify-between">
                  <span>Marketing materials</span>
                  <span className="font-mono">€200-400</span>
                </li>
                <li className="flex justify-between">
                  <span>Press kit & media outreach</span>
                  <span className="font-mono">€100-300</span>
                </li>
              </ul>
            </div>

            <div className="bg-black text-white p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Estimated Budget:</span>
                <span className="text-2xl font-mono">€3,500-7,500</span>
              </div>
              <p className="text-sm text-zinc-400 mt-3">
                Actual costs may be reduced through volunteer support, sponsor contributions, and in-kind donations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 md:py-20 border-t border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Success Metrics</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Participation</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• 10+ new Belgian paraclimbers initiated</li>
                <li>• 8+ routesetters trained and certified</li>
                <li>• 20+ international competitors</li>
                <li>• Successful completion of all event components</li>
              </ul>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Media & Visibility</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Media coverage in local and climbing press</li>
                <li>• Social media posts from international athletes</li>
                <li>• Event highlight video produced</li>
                <li>• Photos and content for ongoing campaign</li>
              </ul>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Community Impact</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Established routesetter network</li>
                <li>• New paraclimbers continuing to train</li>
                <li>• Strengthened paraclimbing.be community</li>
                <li>• Foundation for future Belgian events</li>
              </ul>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Campaign Benefits</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Demonstrated organizational capability</li>
                <li>• New partnership opportunities</li>
                <li>• Enhanced personal profile in community</li>
                <li>• Content assets for months of promotion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.push('/communication-plan/node-2')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Node 2
            </button>
            <button 
              onClick={() => router.push('/communication-plan/node-4')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              Next: Node 4
              <span className="rotate-180"><ArrowLeft className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
