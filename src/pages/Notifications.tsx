import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/layout/AppHeader';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'assessment' | 'insight' | 'recommendation' | 'alert' | 'resource';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export default function Notifications() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const generateNotifications = async () => {
      if (!user) return;

      const notifs: Notification[] = [];
      const now = new Date();

      // Get latest assessment
      const { data: latestAssessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestAssessment) {
        notifs.push({
          id: 'assessment-result',
          type: 'assessment',
          title: 'Assessment Results Ready',
          message: `Your ${latestAssessment.assessment_type} assessment scored ${latestAssessment.total_score}. View your detailed insights.`,
          timestamp: new Date(latestAssessment.completed_at),
          read: false,
          actionUrl: '/trends',
          actionLabel: 'View Results'
        });

        // Add recommendation based on severity
        if (['moderate', 'moderately_severe', 'severe'].includes(latestAssessment.severity)) {
          notifs.push({
            id: 'stress-alert',
            type: 'alert',
            title: 'Elevated Stress Detected',
            message: 'Your recent assessment shows elevated stress levels. Consider exploring our coping strategies and resources.',
            timestamp: new Date(latestAssessment.completed_at),
            read: false,
            actionUrl: '/resources',
            actionLabel: 'View Resources'
          });
        }
      }

      // Check journal entries for mood patterns
      const { data: recentJournals } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentJournals && recentJournals.length > 0) {
        const latestJournal = recentJournals[0];
        notifs.push({
          id: 'journal-insight',
          type: 'insight',
          title: 'Journal Insight Available',
          message: `Your recent journal entry has been analyzed. ${latestJournal.risk_level === 'low' ? 'You\'re doing great!' : 'We noticed some patterns worth exploring.'}`,
          timestamp: new Date(latestJournal.created_at),
          read: false,
          actionUrl: '/journal',
          actionLabel: 'View Journal'
        });
      }

      // Weekly check-in reminder
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { count: weeklyAssessments } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', lastWeek.toISOString());

      if ((weeklyAssessments ?? 0) === 0) {
        notifs.push({
          id: 'weekly-reminder',
          type: 'recommendation',
          title: 'Weekly Check-in Reminder',
          message: 'It\'s been a week since your last assessment. Regular check-ins help track your progress.',
          timestamp: now,
          read: false,
          actionUrl: '/assessments',
          actionLabel: 'Take Assessment'
        });
      }

      // Add a general wellness tip
      notifs.push({
        id: 'wellness-tip',
        type: 'resource',
        title: 'New Resource Added',
        message: 'Explore our new guided meditation resources for stress relief and better sleep.',
        timestamp: new Date(now.getTime() - 86400000), // 1 day ago
        read: true,
        actionUrl: '/resources',
        actionLabel: 'Explore'
      });

      // Sort by timestamp (newest first)
      notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(notifs);
      setLoadingNotifications(false);
    };

    if (user) {
      generateNotifications();
    }
  }, [user]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assessment':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'insight':
        return <TrendingUp className="h-5 w-5 text-info" />;
      case 'recommendation':
        return <Sparkles className="h-5 w-5 text-secondary" />;
      case 'resource':
        return <BookOpen className="h-5 w-5 text-success" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: Notification['type']) => {
    const styles: Record<string, string> = {
      assessment: 'bg-primary/10 text-primary',
      alert: 'bg-amber-500/10 text-amber-600',
      insight: 'bg-info/10 text-info',
      recommendation: 'bg-secondary/10 text-secondary',
      resource: 'bg-success/10 text-success'
    };
    return styles[type] || 'bg-muted text-muted-foreground';
  };

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">Notifications</h1>
                <p className="text-sm text-muted-foreground">
                  Stay updated on your wellness journey
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>

        {loadingNotifications ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete assessments and journal entries to receive personalized insights.
              </p>
              <Button className="mt-4" onClick={() => navigate('/assessments')}>
                Take an Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${!notification.read ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <Badge variant="outline" className={getTypeBadge(notification.type)}>
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(notification.actionUrl!)}
                          className="gap-2"
                        >
                          {notification.actionLabel}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Notification Settings Hint */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Customize your notification preferences in Settings
              </p>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                Go to Settings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
