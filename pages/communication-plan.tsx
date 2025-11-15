import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Calendar, Radio, Video, Newspaper, Globe, TrendingUp, ArrowLeft, Target } from 'lucide-react';

export default function CommunicationPlan() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Communication Campaign - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Complete communication and marketing campaign plan for Fré Leys' journey to the LA 2028 Paralympics" />
      </Head>

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar Home
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-zinc-300 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
            <Radio className="w-4 h-4" />
            Campaign Strategy
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Communication<br />Campaign
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            Road to LA 2028 - Building Awareness from Leuven to Flanders
          </p>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Vision</h2>
          </div>
          
          <div className="space-y-6 text-lg text-zinc-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-black mb-2">Who I Am:</h3>
              <p>My name is Fré Leys. I am a paraclimber, member of the Belgian climbing team since 2016 and born with a non-functional right leg, and I also hold a PhD in Engineering.</p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">The Dream:</h3>
              <p>My primary goal is win paralympic gold at the <strong>LA 2028 Paralympics</strong>. This is a historic event, as it will be the first time paraclimbing is included in the games.</p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">The Local Connection:</h3>
              <p>If successful, I would become the <strong>first-ever Paralympian</strong> from my hometown of Leuven, Belgium.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Core Objectives</h2>
          
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Primary (Performance) Goal</h3>
                  <p className="text-zinc-700">To qualify for and compete in the LA 2028 Paralympic Games and to win a gold medal for Belgium.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Secondary (Personal) Goal</h3>
                  <p className="text-zinc-700">To use my personal story and struggle as a platform to <strong>promote paraclimbing and the wider Paralympic movement in Belgium</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Hub */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Central Campaign Hub: fre2028.LA</h2>
          </div>

          <div className="bg-black text-white p-8 mb-6">
            <p className="text-xl mb-4">
              The centerpiece of this campaign is my website, <strong className="text-2xl">fre2028.LA</strong>
            </p>
            <p className="text-zinc-400 text-sm">
              The <code className="bg-white/10 px-2 py-1">.LA</code> domain was chosen specifically to represent the host city of the 2028 Paralympics.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xl">The website will contain:</h3>
            <ul className="space-y-3 text-zinc-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>My personal story</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>This communication plan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>A showcase of my sponsors and "Team Fré"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>A portfolio (pictures, videos, podcasts, and other media)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>My competition results</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>My monthly blog detailing the "obstacles, findings, and discoveries on my road towards LA 2028"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                <span>A link to my non-profit: <strong>Paraclimbing.be</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Campaign Strategy */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Campaign Strategy & Phasing</h2>
          </div>

          <div className="bg-white border-l-4 border-black p-6 mb-8">
            <p className="text-lg text-zinc-700 leading-relaxed">
              The entire campaign flow is structured around <strong>"Nodes"</strong>—major milestones or activations scheduled every 100 days.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 p-6">
              <div className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Phase 1</div>
              <h3 className="text-2xl font-bold mb-2">Days 1000 - 501</h3>
              <p className="text-zinc-700">Primary focus on my hometown of <strong>Leuven</strong>.</p>
            </div>

            <div className="bg-white border border-zinc-200 p-6">
              <div className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Phase 2</div>
              <h3 className="text-2xl font-bold mb-2">Days 500 - 0</h3>
              <p className="text-zinc-700">Expand the focus to <strong>Flanders</strong> and national-level awareness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 1 - Nodes */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-black text-white text-xs font-bold uppercase tracking-wider">
              Phase 1
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Leuven & Community Focus</h2>
          </div>

          {/* Node 1 */}
          <div className="mb-12 bg-gradient-to-r from-red-50 to-white border-l-4 border-red-600 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-red-600">Node 1: Campaign Launch</div>
                <h3 className="text-2xl font-bold">1000 Days Out - November 20, 2025</h3>
              </div>
            </div>

            <p className="text-zinc-700 mb-6 text-lg">
              This node marks the official start, exactly 1000 days before the Paralympics.
            </p>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Website Launch
                </h4>
                <p className="text-zinc-700 text-sm">fre2028.LA goes live.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Media Launch
                </h4>
                <p className="text-zinc-700 text-sm">Hold a press conference targeted specifically at Leuven news media.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team Building
                </h4>
                <p className="text-zinc-700 text-sm">Officially begin building my team of partners.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Local Marketing
                </h4>
                <p className="text-zinc-700 text-sm">Launch a "tiny" marketing campaign in Leuven as a practice run for the larger campaign later on.</p>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Radio className="w-5 h-5" />
                  Content Start
                </h4>
                <ul className="text-zinc-700 text-sm space-y-1 list-disc list-inside pl-4">
                  <li>Launch the monthly blog/newsletter (existing platform with ~100 subscribers)</li>
                  <li>Begin regular, structured posting on social media (Instagram ~5,000 followers, Facebook)</li>
                </ul>
              </div>

              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">Merchandise</h4>
                <p className="text-zinc-700 text-sm">Begin the process of creating a logo to produce merchandise (t-shirts, hats).</p>
              </div>
            </div>
          </div>

          {/* Node 2 */}
          <div className="mb-12 bg-zinc-50 border-l-4 border-black p-8">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Node 2: Community Engagement</div>
                <h3 className="text-2xl font-bold">900 Days Out</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">YouTube Series Launch</h4>
                <p className="text-zinc-700 mb-3">"<strong>The Golden Fingers of Belgium</strong>" - 20-episode series</p>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Concept:</strong> I will invite 20 of the most famous Belgian climbers to test their finger strength on a standardized setup.</p>
                  <p><strong>Features:</strong> A running leaderboard will be maintained, and the winner will receive the "Golden Finger Trophy."</p>
                  <p><strong>Goal:</strong> Promote paraclimbing and the Paralympics directly to the Belgian climbing community.</p>
                  <p><strong>Future Potential:</strong> The test setup can later be used to tour Belgian climbing gyms, allowing all climbers to compare their strength against the participants. If successful, the series could be extended globally.</p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-900">
                    <strong>Internal Note:</strong> By collaborating with famous climbers, I can reach a large segment of the climbing community for free by leveraging their existing platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Node 3 */}
          <div className="mb-12 bg-zinc-50 border-l-4 border-black p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mountain className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Node 3: Event Hosting</div>
                <h3 className="text-2xl font-bold">800 Days Out</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">Belgian Paraclimbing Championship</h4>
                <p className="text-zinc-700 mb-3">An open competition organized in collaboration with my climbing club (BVKB from climbing gym "Klimax") and my non-profit "paraclimbing.be"</p>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Date:</strong> Planned for June 20-21</p>
                  <p><strong>Strategy:</strong> We expect mainly international paraclimbers due to the small number of Belgian competitors. The event is strategically scheduled for the weekend after a large international paraclimbing competition in Austria, hoping climbers will "hop by" Belgium on their way home.</p>
                  
                  <div className="mt-3">
                    <p className="font-bold text-black mb-2">Two-Day Event Structure:</p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li><strong>Day 1:</strong> Climbing initiation for new Belgian paraclimbers</li>
                      <li><strong>Day 2:</strong> A para-routesetting course for Belgian routesetters, where the new paraclimbers can test the routes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Node 4 */}
          <div className="mb-12 bg-gradient-to-r from-zinc-50 to-white border-l-4 border-black p-8">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Node 4: City Saturation</div>
                <h3 className="text-2xl font-bold">700 Days Out</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 border border-zinc-200">
                <h4 className="font-bold mb-2">Leuven City Saturation Campaign</h4>
                <p className="text-zinc-700 mb-3">Launch a large-scale, focused promotional campaign in Leuven.</p>
                
                <div className="space-y-2 text-sm text-zinc-600">
                  <p><strong>Tactics:</strong></p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li>Target local newspapers and magazines</li>
                    <li>Hang posters in local shops</li>
                    <li>Distribute brochures in mailboxes</li>
                  </ul>
                  
                  <p className="mt-3"><strong>Goal:</strong> To bring the people of Leuven into direct contact with the Paralympic movement, using my story as the "first Paralympian from Leuven" as the central narrative.</p>
                  
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200">
                    <p className="font-bold text-yellow-900">Specific Goal:</p>
                    <p className="text-yellow-800">To make sure as many Leuven residents as possible can <strong>recognize the Paralympic logo</strong>, which is currently very unknown.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase 2 */}
      <section className="py-16 md:py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12">
            <div className="inline-block px-4 py-2 mb-4 bg-white text-black text-xs font-bold uppercase tracking-wider">
              Phase 2
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Flanders & National Focus</h2>
          </div>

          <div className="bg-white/10 border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-8 h-8" />
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-zinc-400">Node 5 & Beyond</div>
                <h3 className="text-2xl font-bold">600 Days Out - National Media Expansion</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-zinc-300 mb-4">
                <strong className="text-white">Status:</strong> These plans are not yet finalized but represent the direction for Phase 2.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Ideas in Development:</h4>
              
              <div className="space-y-3 text-zinc-300">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Podcast:</p>
                    <p className="text-sm">Launch a podcast about performance and what makes a winner a winner.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Interview Series:</p>
                    <p className="text-sm">Host a series (video or podcast) interviewing other Paralympians.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">National Television:</p>
                    <p className="text-sm">Actively work to get my story featured on national TV.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">•</span>
                  <div>
                    <p className="font-bold text-white">Docu-series:</p>
                    <p className="text-sm">Develop a concept for a series that follows my journey and that of other Belgian athletes on the road to LA 2028.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest mb-4">
            <Mountain className="w-6 h-6" />
            <span>Fré2028.LA</span>
          </div>
          <p className="text-sm text-zinc-600">Communication Campaign - Road to LA 2028 Paralympics</p>
        </div>
      </footer>
    </div>
  );
}
