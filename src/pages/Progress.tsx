import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageShell from "@/components/layout/PageShell";

export default function Progress() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading Progress...</div>
      </div>
    );
  }

  return (
    <PageShell maxWidth="full" hideHeader>
      <div className="atmospheric-bg"></div>

      <main className="min-h-screen p-6 lg:p-12 pb-32">
        <header className="max-w-6xl mx-auto flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold text-white mb-2">Your Journey</h2>
            <p className="text-secondary/80 font-medium">Weekly wellness summary and analytics</p>
          </div>
          <button className="glass-card px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">download</span>
            Export Report
          </button>
        </header>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* Main Stats Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Stats */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Wellness Score Card */}
              <div className="clay-card rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between min-h-[250px]">
                <div className="orb-glow w-48 h-48 bg-secondary/20 top-0 right-0 mix-blend-screen opacity-50"></div>
                <div className="flex justify-between items-start relative z-10">
                  <h3 className="text-xl font-display font-semibold text-white">Wellness Score</h3>
                  <span className="material-symbols-outlined text-secondary">trending_up</span>
                </div>
                <div className="relative z-10 mt-8 flex items-end gap-4">
                  <span className="text-7xl font-display font-bold text-white">85</span>
                  <div className="mb-2">
                    <span className="text-secondary font-bold flex items-center text-sm">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      +5pts
                    </span>
                    <span className="text-zinc-400 text-sm">vs last week</span>
                  </div>
                </div>
                {/* Progress Ring Background */}
                <svg className="absolute -bottom-10 -right-10 w-64 h-64 opacity-20 progress-ring-clay" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset="60" />
                </svg>
              </div>

              {/* Activity Intensity Card */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-display font-semibold text-white">Activity Intensity</h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white tracking-wider">MODERATE</span>
                </div>
                
                {/* Simple Bar Chart Mockup */}
                <div className="flex items-end justify-between h-32 mt-4 gap-2">
                  <div className="w-full bg-white/5 rounded-t-lg h-[40%] hover:bg-white/20 transition-colors relative group">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Mon</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-t-lg h-[60%] hover:bg-white/20 transition-colors relative group">
                     <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Tue</span>
                  </div>
                  <div className="w-full bg-secondary rounded-t-lg h-[80%] shadow-[0_0_15px_rgba(0,238,252,0.3)] relative group">
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Wed</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-t-lg h-[30%] hover:bg-white/20 transition-colors relative group">
                     <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Thu</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-t-lg h-[70%] hover:bg-white/20 transition-colors relative group">
                     <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Fri</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-t-lg h-[50%] hover:bg-white/20 transition-colors relative group">
                     <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Sat</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-t-lg h-[40%] hover:bg-white/20 transition-colors relative group">
                     <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-zinc-800 text-white px-2 py-1 rounded">Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones / Goals */}
            <section className="glass-card rounded-[2rem] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-semibold text-white">Current Milestone</h3>
                <span className="text-zinc-400 font-medium">Phase 2 of 4</span>
              </div>
              
              <div className="space-y-6">
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">Consistent Sleep</h4>
                      <p className="text-zinc-400 text-sm">7+ hours for 5 consecutive days</p>
                    </div>
                  </div>
                  <span className="text-secondary font-bold text-lg">100%</span>
                </div>

                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 border-l-4 border-l-secondary relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-secondary/10 to-transparent"></div>
                  <div className="flex justify-between items-center mb-4 relative z-10">
                     <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">edit_note</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">Daily Journaling</h4>
                        <p className="text-zinc-400 text-sm">Log your mood for 7 days</p>
                      </div>
                    </div>
                    <span className="text-white font-bold text-lg">4/7</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 relative z-10">
                    <div className="bg-secondary h-2 rounded-full w-[60%] shadow-[0_0_10px_rgba(0,238,252,0.5)]"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Insights & Action Plan */}
          <div className="space-y-8">
            <section className="clay-card rounded-[2rem] p-8 bg-primary/20 border-primary/30 relative overflow-hidden">
               <div className="orb-glow w-40 h-40 bg-primary/40 top-[-20px] left-[-20px]"></div>
              <h3 className="text-xl font-display font-semibold text-white mb-6 relative z-10">AI Insights</h3>
              <div className="relative z-10 space-y-4">
                <p className="text-zinc-300 leading-relaxed">
                  Your recent journaling indicates a positive shift in your morning routines. 
                  Maintaining this habit strongly correlates with your improved wellness score.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-background/50 border border-white/5 flex gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">lightbulb</span>
                  <p className="text-sm text-zinc-400">Try adding a 5-minute meditation after your morning entry.</p>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[2rem] p-8">
              <h3 className="text-xl font-display font-semibold text-white mb-6">Action Plan</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded bg-zinc-800 border-zinc-600 text-secondary focus:ring-secondary/50" />
                  <div>
                    <h5 className="text-white font-medium">Evening Review</h5>
                    <p className="text-sm text-zinc-500">Take 3 mins to log today's highlights</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded bg-zinc-800 border-zinc-600 text-secondary focus:ring-secondary/50" />
                  <div>
                    <h5 className="text-white font-medium">Hydration Goal</h5>
                    <p className="text-sm text-zinc-500">Drink 2L of water</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>

        </div>
      </main>
    </PageShell>
  );
}
