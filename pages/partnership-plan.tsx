import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Mountain, Target, Users, Briefcase, Award, TrendingUp, ArrowLeft } from 'lucide-react';

export default function PartnershipPlan() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Head>
        <title>Partnership Plan - Fré Leys Road to LA 2028</title>
        <meta name="description" content="Complete partnership and sponsorship plan for Fré Leys' journey to the LA 2028 Paralympics" />
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
            <Briefcase className="w-4 h-4" />
            Strategic Plan
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Partnership Plan
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 leading-relaxed">
            LA 2028 Team & Sponsorship Strategy
          </p>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Core Objectives</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">1. Performance Goal</h3>
              <p className="text-zinc-700 leading-relaxed">
                To secure the necessary financial, professional, and performance-based support to successfully train for and qualify for the LA 2028 Paralympics.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">2. Advocacy Goal</h3>
              <p className="text-zinc-700 leading-relaxed">
                To build a dedicated team (of partners, sponsors, and professionals) to actively promote the <strong>Paralympic Games of 2028</strong> throughout <strong>Leuven and Flanders</strong>.
              </p>
            </div>

            <div className="border-l-4 border-black pl-6 py-2">
              <h3 className="font-bold text-xl mb-2">3. Legacy Goal</h3>
              <p className="text-zinc-700 leading-relaxed">
                To become the <strong>first-ever Paralympian from Leuven</strong>, using this personal journey as a platform to inspire the community and create lasting awareness for Paralympic sports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Partners */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">1. The Financial Partners</h2>
          </div>

          <p className="text-lg text-zinc-700 leading-relaxed mb-12">
            This group consists of two tiers of financial sponsors: a local base of support (Leuven Circle) and a national-level group of major partners.
          </p>

          {/* Leuven Circle */}
          <div className="bg-white border border-zinc-200 p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">1A. The Leuven Circle</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Goal</div>
                <p className="text-zinc-700">To create a stable financial base to cover all annual climbing-related costs and fund the communication campaign.</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target</div>
                <p className="text-zinc-700">A core group of <strong>8 partner companies</strong>.</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Profile:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Leuven-based companies</li>
                  <li>Primary focus on <strong>engineering firms</strong> to leverage my own background (PhD in Engineering)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Outreach:</h4>
                <p>A mix of warm outreach (existing network) and cold emailing.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Timeline:</h4>
                <p>Secure all 8 partners within the first 6 months of the campaign.</p>
              </div>

              <div className="bg-zinc-50 p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">The Ask (Financial):</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>A minimum of <strong>€1,000 per year</strong> per partner</li>
                  <li>This ask will scale annually, rising to approximately <strong>€1,500 per year</strong> by the final year</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">The Return (Negotiable):</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Official partner status with promotion on the fre2028.LA website and social media</li>
                  <li>In-company talks (e.g., on performance, resilience, an engineer's approach to athletics)</li>
                  <li>Team-building activities, such as a climbing initiation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Terms:</h4>
                <p>Partnerships will be structured for a yearly renewal. This builds in accountability, allowing me to prove the campaign's success each year. If a partner does not renew, a replacement will be sought.</p>
              </div>
            </div>
          </div>

          {/* Prime Partners */}
          <div className="bg-white border border-zinc-200 p-8">
            <h3 className="text-2xl font-bold mb-6">1B. The Prime Partners (National Level)</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Goal</div>
                <p className="text-zinc-700">To secure major funding that allows me to <strong>focus 100% on performance</strong> in the final, critical year leading up to the Paralympics.</p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target</div>
                <p className="text-zinc-700">Approximately <strong>4 very large partners</strong>.</p>
              </div>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Profile:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Major national (Flemish) companies</li>
                  <li>Strong B2C (Business-to-Consumer) focus with a large customer base</li>
                  <li>Examples: Banks, supermarket chains, restaurant chains</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Outreach:</h4>
                <p>This will be a long-term strategic effort.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Timeline:</h4>
                <p>Secure all 4 partners by the <strong>beginning of 2028</strong>. This gives a ~2-year runway to build these high-level relationships.</p>
              </div>

              <div className="bg-zinc-50 p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">The Ask (Financial):</h4>
                <p>Approximately <strong>€10,000 each</strong>.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">The Return:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>High-level national visibility and association with the Belgian Paralympic story</li>
                  <li>Inspirational talks for their national employee base</li>
                  <li>Major brand alignment opportunities</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-4">
                <h4 className="font-bold mb-2 text-red-900">Challenge:</h4>
                <p className="text-red-800">This is acknowledged as the most challenging part of the financial plan and will require a dedicated, professional approach.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partners */}
      <section className="py-16 md:py-20 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">2. Strategic Partners</h2>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Pro Bono Services</p>
              <h3 className="text-xl font-bold mb-4">Leuven-Based Professional Services</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Goal:</h4>
                <p>To acquire professional services and expertise to run the campaign effectively without direct financial cost, while simultaneously strengthening my Leuven network.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Target:</h4>
                <p>Leuven-based companies and skilled professionals.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Profile:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Market research / analysis firm</li>
                  <li>Advertisement / PR agency</li>
                  <li>Professional content creators (videographer, photographer)</li>
                  <li>Legal or administrative support</li>
                </ul>
              </div>

              <div className="bg-white p-4 border-l-4 border-black">
                <h4 className="font-bold mb-2">The Ask:</h4>
                <p>Pro bono services and expertise (not a financial contribution).</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">The Return:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Official partner status and full visibility on the website and in campaign materials</li>
                  <li>A unique and tangible way to support a local athlete</li>
                  <li>Practical benefits (e.g., using a non-profit structure for services)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-2">Rationale:</h4>
                <p>Keeping these partners local is practically easier and reinforces the "First Paralympian from Leuven" narrative by building a strong local support web.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Team */}
      <section className="py-16 md:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">3. The Performance Team</h2>
          </div>

          <div className="bg-white border border-zinc-200 p-8">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Expert Support</p>
              <h3 className="text-xl font-bold mb-4">Athletic, Physical & Mental Preparation</h3>
            </div>

            <div className="space-y-4 text-zinc-700">
              <div>
                <h4 className="font-bold mb-2">Goal:</h4>
                <p>This is the non-financial, high-performance team responsible for my athletic, physical, and mental preparation.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Profile:</h4>
                <p>This is my core athletic support structure, which is already in development.</p>
              </div>

              <div>
                <h4 className="font-bold mb-2">Team Members:</h4>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Trainers & Coaches</li>
                  <li>Food Expert / Nutritionist</li>
                  <li>Kine (Physiotherapist)</li>
                  <li>Climbing Federation</li>
                  <li>G-Sport Vlaanderen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Table */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">Summary: Financial Partnership Tiers</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-zinc-300 p-4 text-left font-bold">Feature</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">1A. The Leuven Circle</th>
                  <th className="border border-zinc-300 p-4 text-left font-bold">1B. The Prime Partners</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Goal</td>
                  <td className="border border-zinc-300 p-4">Cover running costs, fund campaign</td>
                  <td className="border border-zinc-300 p-4">Enable 100% performance focus in final year</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Geography</td>
                  <td className="border border-zinc-300 p-4">Leuven</td>
                  <td className="border border-zinc-300 p-4">Flanders / National</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold"># of Partners</td>
                  <td className="border border-zinc-300 p-4">8</td>
                  <td className="border border-zinc-300 p-4">~4</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Ask (per partner)</td>
                  <td className="border border-zinc-300 p-4">€1,000 - €1,500 per year</td>
                  <td className="border border-zinc-300 p-4">~€10,000 (one-time or final year)</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 p-4 font-bold">Target Profile</td>
                  <td className="border border-zinc-300 p-4">Engineering firms, local SMEs</td>
                  <td className="border border-zinc-300 p-4">Banks, Supermarkets, large B2C chains</td>
                </tr>
                <tr className="bg-zinc-50">
                  <td className="border border-zinc-300 p-4 font-bold">Timeline</td>
                  <td className="border border-zinc-300 p-4">Secure within 6 months</td>
                  <td className="border border-zinc-300 p-4">Secure by early 2028</td>
                </tr>
              </tbody>
            </table>
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
          <p className="text-sm text-zinc-600">Partnership Plan - Road to LA 2028 Paralympics</p>
        </div>
      </footer>
    </div>
  );
}
