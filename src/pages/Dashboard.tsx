import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppHeader from '@/components/layout/AppHeader';
import WellnessStreak from '@/components/dashboard/WellnessStreak';
import AnimatedCard from '@/components/dashboard/AnimatedCard';
import { 
  ClipboardList, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  AlertTriangle, 
  Library,
  Heart,
  Brain,
  Moon,
  ArrowRight,
  Calendar
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

      // Fetch last PHQ-9 assessment
      const { data: phq9Data } = await supabase
        .from('assessments')
        .select('total_score, severity')
        .eq('user_id', user.id)
        .eq('assessment_type', 'PHQ-9')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch last GAD-7 assessment
      const { data: gad7Data } = await supabase
        .from('assessments')
        .select('total_score, severity')
        .eq('user_id', user.id)
        .eq('assessment_type', 'GAD-7')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch journal count and last risk level
      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: lastJournal } = await supabase
        .from('journal_entries')
        .select('risk_level')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Calculate streak data
      const { currentStreak, longestStreak, weeklyCheckInDays } = await calculateStreakData(user.id);

      // Calculate average wellness score (inverse of PHQ-9 + GAD-7 scores)
      const phqScore = phq9Data?.total_score ?? 0;
      const gadScore = gad7Data?.total_score ?? 0;
      const maxScore = 27 + 21; // Max PHQ-9 + Max GAD-7
      const avgWellness = Math.max(0, 100 - ((phqScore + gadScore) / maxScore) * 100);

      setStats({
        lastPhq9Score: phq9Data?.total_score ?? null,
        lastPhq9Severity: phq9Data?.severity ?? null,
        lastGad7Score: gad7Data?.total_score ?? null,
        lastGad7Severity: gad7Data?.severity ?? null,
        journalCount: journalCount ?? 0,
        lastRiskLevel: lastJournal?.risk_level ?? null,
        weeklyCheckIns: weeklyCheckInDays.filter(Boolean).length,
        averageWellness: Math.round(avgWellness),
        currentStreak,
        longestStreak,
        weeklyCheckInDays
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const calculateStreakData = async (userId: string) => {
    // Get all check-in dates (assessments and journal entries)
    const { data: assessments } = await supabase
      .from('assessments')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    const { data: journals } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Combine and get unique dates
    const allDates = new Set<string>();
    
    assessments?.forEach(a => {
      const date = new Date(a.completed_at).toDateString();
      allDates.add(date);
    });
    
    journals?.forEach(j => {
      const date = new Date(j.created_at).toDateString();
      allDates.add(date);
    });

    const sortedDates = Array.from(allDates)
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(sortedDates[i]);
      checkDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (checkDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else if (i === 0 && checkDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow for yesterday to start streak
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Calculate weekly check-in days (Mon-Sun)
    const weeklyCheckInDays: boolean[] = [false, false, false, false, false, false, false];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    sortedDates.forEach(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      
      if (d >= monday) {
        const day = d.getDay();
        const index = day === 0 ? 6 : day - 1; // Convert to Mon=0, Sun=6
        weeklyCheckInDays[index] = true;
      }
    });

    return { currentStreak, longestStreak, weeklyCheckInDays };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div 
          className="text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'minimal':
      case 'mild':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'moderate':
      case 'moderately_severe':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'severe':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWellnessColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  const quickActions = [
    {
      icon: ClipboardList,
      title: 'Self-Assessment',
      description: 'Take a PHQ-9 or GAD-7 questionnaire',
      href: '/assessments',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10'
    },
    {
      icon: BookOpen,
      title: 'Journal Entry',
      description: 'Write about your thoughts and feelings',
      href: '/journal',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/10'
    },
    {
      icon: MessageCircle,
      title: 'Chatbot Support',
      description: 'Get guidance from our AI assistant',
      href: '/chat',
      gradient: 'from-teal-500 to-emerald-500',
      iconBg: 'bg-teal-500/10'
    },
    {
      icon: TrendingUp,
      title: 'View Insights',
      description: 'See your wellness progress over time',
      href: '/trends',
      gradient: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-500/10'
    },
    {
      icon: Library,
      title: 'Resources',
      description: 'Mental health resources and support',
      href: '/resources',
      gradient: 'from-indigo-500 to-violet-500',
      iconBg: 'bg-indigo-500/10'
    }
  ];

  const wellnessMetrics = [
    {
      icon: Brain,
      label: 'Mental Health',
      value: stats.lastPhq9Score !== null ? `${27 - stats.lastPhq9Score}/27` : '--',
      description: 'PHQ-9 based score',
      color: 'text-blue-500'
    },
    {
      icon: Heart,
      label: 'Anxiety Level',
      value: stats.lastGad7Score !== null ? `${21 - stats.lastGad7Score}/21` : '--',
      description: 'GAD-7 based score',
      color: 'text-rose-500'
    },
    {
      icon: Moon,
      label: 'Journal Entries',
      value: stats.journalCount.toString(),
      description: 'Total reflections',
      color: 'text-purple-500'
    },
    {
      icon: Calendar,
      label: 'Weekly Check-ins',
      value: stats.weeklyCheckIns.toString(),
      description: 'This week',
      color: 'text-teal-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <AppHeader />

      <motion.main 
        className="container py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section with Wellness Score and Streak */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div 
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h1 className="text-4xl font-bold font-display text-foreground">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Take a moment to check in with yourself today.
              </p>
            </div>

            {/* Crisis Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-rose-500/30 bg-gradient-to-r from-rose-500/5 to-orange-500/5">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Need immediate help?</p>
                    <p className="text-sm text-muted-foreground">
                      If you're in crisis, please call the 988 Suicide & Crisis Lifeline or contact your campus counseling center.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 flex-shrink-0"
                    onClick={() => navigate('/resources')}
                  >
                    Get Help
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Wellness Score Card */}
          <AnimatedCard delay={0.3}>
            <Card className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
              <CardHeader className="relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Wellness</CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-end gap-2">
                  <motion.span 
                    className={`text-5xl font-bold ${getWellnessColor(stats.averageWellness)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                  >
                    {stats.averageWellness}
                  </motion.span>
                  <span className="text-2xl text-muted-foreground mb-1">/100</span>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={stats.averageWellness} 
                    className="h-2"
                    style={{
                      ['--progress-background' as string]: stats.averageWellness >= 70 
                        ? 'rgb(16 185 129)' 
                        : stats.averageWellness >= 40 
                          ? 'rgb(245 158 11)' 
                          : 'rgb(244 63 94)'
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {stats.averageWellness >= 70 
                      ? "You're doing great! Keep up the good work." 
                      : stats.averageWellness >= 40 
                        ? "Some areas need attention. Check your insights." 
                        : "Consider reaching out for support."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* Wellness Streak */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <WellnessStreak 
              currentStreak={stats.currentStreak}
              weeklyCheckIns={stats.weeklyCheckInDays}
              longestStreak={stats.longestStreak}
            />
          </div>
          
          {/* Quick Actions - now 2 columns on the right */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/trends')}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.slice(0, 3).map((action, index) => (
                <AnimatedCard 
                  key={action.title} 
                  delay={0.1 * index + 0.3}
                  onClick={() => navigate(action.href)}
                  hoverScale={1.03}
                >
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg border-transparent bg-card hover:border-primary/20 h-full">
                    <CardContent className="p-5">
                      <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4`}>
                        <action.icon className={`h-6 w-6 bg-gradient-to-r ${action.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {quickActions.slice(3).map((action, index) => (
                <AnimatedCard 
                  key={action.title} 
                  delay={0.1 * index + 0.6}
                  onClick={() => navigate(action.href)}
                  hoverScale={1.03}
                >
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg border-transparent bg-card hover:border-primary/20">
                    <CardContent className="p-5">
                      <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4`}>
                        <action.icon className={`h-6 w-6 bg-gradient-to-r ${action.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </div>

        {/* Wellness Metrics */}
        <section>
          <motion.h2 
            className="text-xl font-semibold text-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Wellness Overview
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wellnessMetrics.map((metric, index) => (
              <AnimatedCard key={metric.label} delay={0.1 * index + 0.6}>
                <Card className="relative overflow-hidden h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <motion.p 
                          className="text-3xl font-bold mt-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index + 0.8 }}
                        >
                          {metric.value}
                        </motion.p>
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      </div>
                      <div className={`h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center ${metric.color}`}>
                        <metric.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* Assessment Summary Cards */}
        <section>
          <motion.h2 
            className="text-xl font-semibold text-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Latest Assessments
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* PHQ-9 Card */}
            <AnimatedCard delay={0.8}>
              <Card className="relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Depression Screening</CardTitle>
                      <CardDescription>PHQ-9 Assessment</CardDescription>
                    </div>
                    <Brain className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  {stats.lastPhq9Score !== null ? (
                    <div className="space-y-3">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{stats.lastPhq9Score}</span>
                        <span className="text-muted-foreground mb-1">/27</span>
                      </div>
                      <Badge className={`${getSeverityColor(stats.lastPhq9Severity)} border`}>
                        {stats.lastPhq9Severity?.replace('_', ' ')}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => navigate('/assessments')}
                      >
                        Take New Assessment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-3xl font-bold text-muted-foreground">--</p>
                      <p className="text-sm text-muted-foreground">No assessment yet</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/assessments')}
                      >
                        Start PHQ-9
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* GAD-7 Card */}
            <AnimatedCard delay={0.9}>
              <Card className="relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Anxiety Screening</CardTitle>
                      <CardDescription>GAD-7 Assessment</CardDescription>
                    </div>
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  {stats.lastGad7Score !== null ? (
                    <div className="space-y-3">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{stats.lastGad7Score}</span>
                        <span className="text-muted-foreground mb-1">/21</span>
                      </div>
                      <Badge className={`${getSeverityColor(stats.lastGad7Severity)} border`}>
                        {stats.lastGad7Severity?.replace('_', ' ')}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => navigate('/assessments')}
                      >
                        Take New Assessment
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-3xl font-bold text-muted-foreground">--</p>
                      <p className="text-sm text-muted-foreground">No assessment yet</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/assessments')}
                      >
                        Start GAD-7
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>
        </section>

        {/* Disclaimer */}
        <motion.p 
          className="text-xs text-muted-foreground text-center pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          MindMate is a wellness monitoring tool and is not a substitute for professional mental health services. 
          If you're experiencing a crisis, please contact emergency services or a mental health professional.
        </motion.p>
      </motion.main>
    </div>
  );
}
