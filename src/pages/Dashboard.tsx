import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppHeader from '@/components/layout/AppHeader';
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
  Smile,
  ArrowRight,
  Activity,
  Calendar,
  CheckCircle2
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
    averageWellness: 0
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

      // Fetch weekly check-ins count
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: weeklyAssessments } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', oneWeekAgo.toISOString());

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
        weeklyCheckIns: weeklyAssessments ?? 0,
        averageWellness: Math.round(avgWellness)
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
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

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <AppHeader />

      <main className="container py-8 space-y-8">
        {/* Welcome Section with Wellness Score */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-4xl font-bold font-display text-foreground">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Take a moment to check in with yourself today.
              </p>
            </div>

            {/* Crisis Banner */}
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
          </div>

          {/* Wellness Score Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Wellness</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-bold ${getWellnessColor(stats.averageWellness)}`}>
                  {stats.averageWellness}
                </span>
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
        </div>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/trends')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {quickActions.map((action) => (
              <Card 
                key={action.title} 
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-transparent bg-card hover:border-primary/20"
                onClick={() => navigate(action.href)}
              >
                <CardContent className="p-5">
                  <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-6 w-6 bg-gradient-to-r ${action.gradient} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Wellness Metrics */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Wellness Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wellnessMetrics.map((metric) => (
              <Card key={metric.label} className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-bold mt-1">{metric.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                    <div className={`h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center ${metric.color}`}>
                      <metric.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Assessment Summary Cards */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Latest Assessments</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* PHQ-9 Card */}
            <Card className="relative overflow-hidden">
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

            {/* GAD-7 Card */}
            <Card className="relative overflow-hidden">
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
          </div>
        </section>

        {/* Disclaimer */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Disclaimer:</strong> MindMate is a wellness monitoring tool designed for educational purposes. 
              It is not a substitute for professional diagnosis, treatment, or medical advice. 
              Always consult with qualified healthcare providers for mental health concerns.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}