import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PageShell from '@/components/layout/PageShell';
import { 
  ClipboardList, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Brain,
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  lastPhq9Score: number | null;
  lastPhq9Severity: string | null;
  lastGad7Score: number | null;
  lastGad7Severity: string | null;
  journalCount: number;
  lastRiskLevel: string | null;
  weeklyCheckIns: number;
  averageWellness: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCheckInDays: boolean[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    lastPhq9Score: null,
    lastPhq9Severity: null,
    lastGad7Score: null,
    lastGad7Severity: null,
    journalCount: 0,
    lastRiskLevel: null,
    weeklyCheckIns: 0,
    averageWellness: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyCheckInDays: [false, false, false, false, false, false, false]
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const { data: phq9Data } = await supabase
        .from('assessments')
        .select('total_score, severity')
        .eq('user_id', user.id)
        .eq('assessment_type', 'PHQ-9')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: gad7Data } = await supabase
        .from('assessments')
        .select('total_score, severity')
        .eq('user_id', user.id)
        .eq('assessment_type', 'GAD-7')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const phqScore = phq9Data?.total_score ?? 0;
      const gadScore = gad7Data?.total_score ?? 0;
      const maxScore = 27 + 21; 
      const avgWellness = Math.max(0, 100 - ((phqScore + gadScore) / maxScore) * 100);

      // Temporary streak mock for layout consistency
      const mockWeeklyCheckInDays = [true, false, true, true, false, false, false];

      setStats({
        lastPhq9Score: phq9Data?.total_score ?? null,
        lastPhq9Severity: phq9Data?.severity ?? null,
        lastGad7Score: gad7Data?.total_score ?? null,
        lastGad7Severity: gad7Data?.severity ?? null,
        journalCount: journalCount ?? 0,
        lastRiskLevel: null,
        weeklyCheckIns: mockWeeklyCheckInDays.filter(Boolean).length,
        averageWellness: Math.round(avgWellness),
        currentStreak: 3,
        longestStreak: 5,
        weeklyCheckInDays: mockWeeklyCheckInDays
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Elias';

  return (
    <PageShell maxWidth="xl">
      <div className="max-w-[1280px] mx-auto py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Welcome back, {userName}.</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your overall wellness score is {stats.averageWellness}/100 today. Let's maintain this peaceful momentum through your session.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Mood Equilibrium Graph */}
            <div className="clay-card p-10 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
              <div className="relative z-10">
                <span className="px-4 py-1 glass-orb rounded-full text-xs font-bold uppercase tracking-widest text-secondary mb-6 inline-block">DAILY STABILITY</span>
                <h3 className="text-4xl font-display font-bold text-white mb-4">Mood Equilibrium</h3>
                <p className="text-lg text-blue-200 max-w-md opacity-90">
                  You've maintained a calm state for {stats.currentStreak} consecutive check-ins. Your resilience patterns show high stability today.
                </p>
              </div>
              <div className="relative h-48 w-full mt-8">
                <div className="absolute bottom-0 left-0 w-full flex items-end gap-2 justify-between px-4">
                  {stats.weeklyCheckInDays.map((checked, i) => (
                    <div key={i} className={`w-12 clay-inset rounded-t-full relative ${checked ? 'h-[140px]' : 'h-[60px]'}`}>
                      <div className="absolute bottom-0 w-full bg-secondary/80 rounded-t-full luminous-shadow" style={{ height: checked ? '80%' : '30%' }}></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/30 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px]"></div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="glass-card p-6 rounded-2xl group hover:-translate-y-1 transition-transform cursor-pointer"
                onClick={() => navigate('/assessments')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center">
                    <ClipboardList className="text-primary h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2 MIN</span>
                </div>
                <h4 className="text-xl font-display font-semibold mb-2 text-foreground">Self Assessment</h4>
                <p className="text-base text-muted-foreground">A guided clinical check-in to analyze your current state.</p>
                <button className="mt-6 flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                  Start Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              <div 
                className="glass-card p-6 rounded-2xl group hover:-translate-y-1 transition-transform cursor-pointer"
                onClick={() => navigate('/journal')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl clay-inset flex items-center justify-center">
                    <BookOpen className="text-accent h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">NEW LOG</span>
                </div>
                <h4 className="text-xl font-display font-semibold mb-2 text-foreground">Daily Journal</h4>
                <p className="text-base text-muted-foreground">Record your thoughts and let the AI analyze emotional trends.</p>
                <button className="mt-6 flex items-center gap-2 text-accent font-bold group-hover:gap-4 transition-all">
                  Write Entry <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Featured Insight */}
            <div className="glass-card p-8 rounded-2xl min-h-[300px] flex flex-col">
              <h4 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-foreground">
                <Brain className="text-secondary h-5 w-5" />
                Featured Insight
              </h4>
              <div className="rounded-xl overflow-hidden mb-6 h-40">
                <img 
                  alt="Meditation scene" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDdRSZivtdjZlWreEz7YmzExE5a84gj958TRTlY3Wogi1Uiul0Hv9YlI-CMoHYksJzq_XUCDa-EEGgllBlx908Rl0GdUVQsDllPXW-M_-jLSkY3lsTCucTOSE9jXy33v_i1EfXgQDX-x3RzT7Wmj4a_x4VZ2CLzEHY87ZucBvBylKmY4osTN4St4MsSRSbcgk0oWag1u6lqRGUn-l5Q2yZarSXH2BSdmAYzv8ANPVc5EysIDLCAHxElbHhE6rHEopFo85vTO9q2XIe"
                />
              </div>
              <p className="text-base text-foreground mb-6 leading-relaxed">
                "The space between stimulus and response is where our greatest growth resides."
              </p>
              <div className="mt-auto flex items-center gap-4 p-4 clay-inset rounded-2xl">
                <div className="w-10 h-10 rounded-full glass-orb flex items-center justify-center shrink-0">
                  <TrendingUp className="text-secondary h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">TIP OF THE DAY</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Try the '4-7-8' breathing method before your next meeting.</p>
                </div>
              </div>
            </div>

            {/* Chatbot CTA */}
            <div 
              className="clay-card bg-zinc-900 p-6 flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1">AI COMPANION</p>
                <h5 className="text-xl font-display font-semibold text-white">Chat with MindMate</h5>
              </div>
              <MessageCircle className="text-secondary h-8 w-8" />
            </div>

          </div>
        </div>
      </div>
    </PageShell>
  );
}
