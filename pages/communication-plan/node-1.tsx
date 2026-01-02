import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Calendar, Globe, Newspaper, TrendingUp, Target, Radio, ArrowLeft } from 'lucide-react';

export default function Node1() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Node 1: Campaign Launch - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Node 1: Campaign Launch - 1000 Days Out, November 20, 2025" />
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
      <section className="py-16 md:py-24 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-red-600 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            <Calendar className="w-4 h-4" />
            Node 1
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Campaign Launch
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            1000 Days Out - November 20, 2025
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Overview</h2>
          
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
            <p className="text-lg text-zinc-800 leading-relaxed">
              This node marks the official start of the campaign, exactly <strong>1000 days before the Paralympics</strong>. 
              It's the moment we announce to the world—and specifically to Leuven—that the journey to LA 2028 has begun.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-zinc-700 leading-relaxed mb-4">
              The campaign launch is designed to create immediate visibility and momentum. By choosing the 1000-day milestone, 
              we create a memorable marker that people can rally around. This is not just about announcing my goal—it's about 
              inviting my community to be part of the journey from the very beginning.
            </p>
            
            <p className="text-zinc-700 leading-relaxed">
              All elements of this launch work together: the website provides a central hub, the press conference generates 
              media coverage, the team building creates partnerships, and the content strategy ensures ongoing engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Activities */}
      <section className="py-16 md:py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Detailed Activities</h2>

          <div className="space-y-8">
            {/* Website Launch */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Website Launch</h3>
                  <p className="text-zinc-600">fre2028.LA goes live</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  The website serves as the campaign's digital home base. The domain name <strong>fre2028.LA</strong> was 
                  specifically chosen to represent Los Angeles, the host city of the 2028 Paralympics.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Initial Website Content:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>My personal story and background</li>
                    <li>The full communication plan (this document)</li>
                    <li>Partner showcase section</li>
                    <li>Portfolio (images, videos, podcasts)</li>
                    <li>Competition results tracker</li>
                    <li>Monthly blog/newsletter signup</li>
                    <li>Link to paraclimbing.be</li>
                  </ul>
                </div>

                <p>
                  The website is built to grow with the campaign. As we progress through the nodes, new content, media, 
                  and features will be added continuously.
                </p>
              </div>
            </div>

            {/* Media Launch */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Media Launch</h3>
                  <p className="text-zinc-600">Press conference for Leuven media</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  A targeted press conference will be organized specifically for local Leuven news outlets. This is a strategic 
                  decision to start local before going national.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Key Messages:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>First-ever Paralympian from Leuven (if I succeed)</li>
                    <li>Historic moment: paraclimbing debuts at Paralympics</li>
                    <li>1000 days until the dream becomes reality</li>
                    <li>Journey starts in Leuven, leads to Los Angeles</li>
                    <li>Promoting Paralympic awareness in Belgium</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Target Media:</strong> Leuven local newspapers (Groot-Leuven, Nieuwsblad Leuven), 
                    local radio stations, city magazine, and online news platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Building */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Team Building</h3>
                  <p className="text-zinc-600">Building "Team Fré"</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  The launch marks the official start of partner recruitment. This includes sponsors, supporters, 
                  media partners, and collaborators who will help make the LA 2028 journey possible.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Partnership Categories:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li><strong>Financial sponsors:</strong> Companies providing monetary support</li>
                    <li><strong>Product sponsors:</strong> Equipment, nutrition, training gear</li>
                    <li><strong>Media partners:</strong> News outlets, podcasters, content creators</li>
                    <li><strong>Service partners:</strong> Training facilities, medical support, coaching</li>
                    <li><strong>Community partners:</strong> Local organizations, climbing gyms, schools</li>
                  </ul>
                </div>

                <p>
                  All partners will be featured prominently on the website and in campaign materials. The partnership 
                  plan details specific benefits and collaboration opportunities.
                </p>
              </div>
            </div>

            {/* Local Marketing */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Local Marketing Campaign</h3>
                  <p className="text-zinc-600">Practice run in Leuven</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  This is a "tiny" but focused marketing campaign designed as a test run for the much larger 
                  city saturation campaign planned for Node 4.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Tactics:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>Small poster campaign at key locations (climbing gym, sports centers, university)</li>
                    <li>Social media ads targeted at Leuven residents</li>
                    <li>Collaboration with local sports clubs for cross-promotion</li>
                    <li>Email campaign to existing contacts and networks</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-900">
                    <strong>Learning Objective:</strong> This campaign is designed to teach us what works and what doesn't 
                    in reaching the local community, so we can optimize the larger campaign at Node 4.
                  </p>
                </div>
              </div>
            </div>

            {/* Content Start */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Content Strategy Launch</h3>
                  <p className="text-zinc-600">Regular blog and social media</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  The content strategy begins with two main pillars: the monthly blog/newsletter and structured 
                  social media posting.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black mb-4">
                  <h4 className="font-bold mb-3">Monthly Blog/Newsletter:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>Starting point: ~100 existing subscribers</li>
                    <li>Theme: "Obstacles, findings, and discoveries on the road to LA 2028"</li>
                    <li>Format: Personal reflections, training insights, behind-the-scenes stories</li>
                    <li>Goal: Grow subscriber base organically through quality content</li>
                  </ul>
                </div>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Social Media Strategy:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li><strong>Instagram:</strong> Primary platform (~5,000 followers to start)</li>
                    <li><strong>Facebook:</strong> Secondary platform for broader reach</li>
                    <li><strong>Content mix:</strong> Training videos, competition updates, personal stories, partner features</li>
                    <li><strong>Posting frequency:</strong> 3-4 times per week on Instagram, 2-3 on Facebook</li>
                  </ul>
                </div>

                <p className="mt-4">
                  All content will drive traffic back to fre2028.LA and encourage newsletter signups.
                </p>
              </div>
            </div>

            {/* Merchandise */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                  <span className="text-xl">👕</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Merchandise Development</h3>
                  <p className="text-zinc-600">Logo and product creation</p>
                </div>
              </div>

              <div className="space-y-4 text-zinc-700">
                <p>
                  The merchandise development begins with creating a campaign logo that will become the visual 
                  identity of the Road to LA 2028 journey.
                </p>

                <div className="bg-zinc-50 p-4 border-l-4 border-black">
                  <h4 className="font-bold mb-3">Initial Product Line:</h4>
                  <ul className="space-y-2 list-disc list-inside pl-2">
                    <li>T-shirts with campaign logo</li>
                    <li>Hats/caps</li>
                    <li>Potential: climbing chalk bags with branding</li>
                    <li>Potential: stickers and small promotional items</li>
                  </ul>
                </div>

                <p>
                  Merchandise serves multiple purposes: creating visual campaign presence, generating some revenue 
                  to support the campaign, and giving supporters a tangible way to show their support.
                </p>

                <div className="bg-blue-50 p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Timeline:</strong> Logo design to be completed by mid-November, first merchandise available 
                    for the campaign launch on November 20.
                  </p>
                </div>
              </div>
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
              <h3 className="font-bold text-lg mb-3">Media Coverage</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• At least 3 articles in local Leuven media</li>
                <li>• Radio interview on local station</li>
                <li>• Online news coverage</li>
              </ul>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Digital Engagement</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• 1,000 website visitors in first week</li>
                <li>• 200 newsletter signups in first month</li>
                <li>• 500 new Instagram followers</li>
              </ul>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Partnership</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Initial conversations with 10+ potential partners</li>
                <li>• At least 2 partnership agreements signed</li>
                <li>• First sponsors featured on website</li>
              </ul>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <h3 className="font-bold text-lg mb-3">Community Awareness</h3>
              <ul className="space-y-2 text-zinc-700 text-sm">
                <li>• Measurable increase in local awareness</li>
                <li>• Engagement from local sports community</li>
                <li>• First merchandise sales</li>
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
              onClick={() => router.push('/communication-plan')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Communication Plan
            </button>
            <button 
              onClick={() => router.push('/communication-plan/node-2')}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              Next: Node 2
              <span className="rotate-180"><ArrowLeft className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
