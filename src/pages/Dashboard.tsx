import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ClipboardList, BookOpen, MessageCircle, TrendingUp, LogOut, User, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  const quickActions = [
    {
      icon: ClipboardList,
      title: 'Take Assessment',
      description: 'Complete PHQ-9 or GAD-7 questionnaire',
      href: '/assessments',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: BookOpen,
      title: 'Journal Entry',
      description: 'Write about your thoughts and feelings',
      href: '/journal',
      color: 'bg-accent/10 text-accent',
    },
    {
      icon: MessageCircle,
      title: 'Chat Support',
      description: 'Get guidance from our AI assistant',
      href: '/chat',
      color: 'bg-info/10 text-info',
    },
    {
      icon: TrendingUp,
      title: 'View Trends',
      description: 'See your wellness progress over time',
      href: '/trends',
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold font-display">MindfulU</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{userName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground">
            Welcome back, {userName}
          </h1>
          <p className="mt-2 text-muted-foreground">
            How are you feeling today? Take a moment to check in with yourself.
          </p>
        </div>

        {/* Crisis Banner */}
        <Card className="mb-8 border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Need immediate help?</p>
              <p className="text-xs text-muted-foreground">
                If you're in crisis, please contact your campus counseling center or call the 988 Suicide & Crisis Lifeline.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-warning/50 text-warning hover:bg-warning/10">
              Get Help Now
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card 
              key={action.title} 
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
              onClick={() => navigate(action.href)}
            >
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="mt-1">{action.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last PHQ-9 Score</CardTitle>
              <CardDescription>Depression screening</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">--</p>
              <p className="text-sm text-muted-foreground mt-1">No assessment yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last GAD-7 Score</CardTitle>
              <CardDescription>Anxiety screening</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">--</p>
              <p className="text-sm text-muted-foreground mt-1">No assessment yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journal Entries</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">0</p>
              <p className="text-sm text-muted-foreground mt-1">Start journaling today</p>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> MindfulU is a screening and self-help tool designed for educational purposes. 
            It is not a substitute for professional diagnosis, treatment, or medical advice. 
            Always consult with qualified healthcare providers for mental health concerns.
          </p>
        </div>
      </main>
    </div>
  );
}
