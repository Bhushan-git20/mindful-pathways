import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppHeader from '@/components/layout/AppHeader';
import { Shield, Users, AlertTriangle, TrendingUp, ClipboardList, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Stats {
  totalStudents: number;
  totalAssessments: number;
  totalJournalEntries: number;
  highRiskCount: number;
  severityDistribution: { name: string; value: number; color: string }[];
  riskDistribution: { name: string; value: number; color: string }[];
}

interface HighRiskAlert {
  userId: string;
  riskLevel: string;
  source: string;
  date: string;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<HighRiskAlert[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking role:', error);
        const { data: counselorData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'counselor'
        });
        setHasAccess(counselorData === true);
      } else {
        if (data) {
          setHasAccess(true);
        } else {
          const { data: counselorData } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: 'counselor'
          });
          setHasAccess(counselorData === true);
        }
      }
    };

    if (user) {
      checkAccess();
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!hasAccess) return;
      setLoadingData(true);

      try {
        // Get total students
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get total assessments
        const { count: assessmentCount } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true });

        // Get total journal entries
        const { count: journalCount } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true });

        // Get severity distribution from assessments
        const { data: assessments } = await supabase
          .from('assessments')
          .select('severity');

        const severityCounts: Record<string, number> = {};
        assessments?.forEach((a) => {
          severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
        });

        const severityColors: Record<string, string> = {
          minimal: 'hsl(142, 55%, 45%)',
          mild: 'hsl(80, 50%, 45%)',
          moderate: 'hsl(38, 92%, 50%)',
          moderately_severe: 'hsl(25, 80%, 50%)',
          severe: 'hsl(0, 72%, 51%)',
        };

        const severityDistribution = Object.entries(severityCounts).map(([name, value]) => ({
          name: name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value,
          color: severityColors[name] || 'hsl(200, 15%, 50%)',
        }));

        // Get risk distribution from journal entries
        const { data: journals } = await supabase
          .from('journal_entries')
          .select('risk_level');

        const riskCounts: Record<string, number> = { low: 0, medium: 0, high: 0 };
        journals?.forEach((j) => {
          if (j.risk_level) {
            const level = j.risk_level.toLowerCase();
            if (level in riskCounts) {
              riskCounts[level] = (riskCounts[level] || 0) + 1;
            }
          }
        });

        const riskColors: Record<string, string> = {
          low: 'hsl(142, 55%, 45%)',
          medium: 'hsl(38, 92%, 50%)',
          high: 'hsl(0, 72%, 51%)',
        };

        const riskDistribution = Object.entries(riskCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: riskColors[name],
        }));

        // Get high risk count
        const highRiskJournals = journals?.filter((j) => j.risk_level === 'high').length || 0;
        const severeAssessments = assessments?.filter((a) => 
          a.severity === 'severe' || a.severity === 'moderately_severe'
        ).length || 0;

        // Get recent high risk alerts (anonymized)
        const { data: recentHighRiskJournals } = await supabase
          .from('journal_entries')
          .select('user_id, risk_level, created_at')
          .eq('risk_level', 'high')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: recentSevereAssessments } = await supabase
          .from('assessments')
          .select('user_id, severity, completed_at')
          .in('severity', ['severe', 'moderately_severe'])
          .order('completed_at', { ascending: false })
          .limit(5);

        const alertsList: HighRiskAlert[] = [
          ...(recentHighRiskJournals?.map((j) => ({
            userId: j.user_id.substring(0, 8) + '...',
            riskLevel: 'High',
            source: 'Journal',
            date: new Date(j.created_at).toLocaleDateString(),
          })) || []),
          ...(recentSevereAssessments?.map((a) => ({
            userId: a.user_id.substring(0, 8) + '...',
            riskLevel: a.severity.replace('_', ' '),
            source: 'Assessment',
            date: new Date(a.completed_at).toLocaleDateString(),
          })) || []),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        setStats({
          totalStudents: studentCount || 0,
          totalAssessments: assessmentCount || 0,
          totalJournalEntries: journalCount || 0,
          highRiskCount: highRiskJournals + severeAssessments,
          severityDistribution,
          riskDistribution,
        });
        setAlerts(alertsList);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (hasAccess) {
      fetchStats();
    }
  }, [hasAccess]);

  if (loading || hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Shield className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6">
          You don't have permission to access the admin panel.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-display text-foreground">Admin Panel</h1>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Anonymized statistics and high-risk student alerts
          </p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading statistics...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-info" />
                    <CardTitle className="text-sm font-medium">Assessments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.totalAssessments || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.totalJournalEntries || 0}</p>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-destructive">{stats?.highRiskCount || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Assessment Severity Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of assessment severity bands</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.severityDistribution && stats.severityDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={stats.severityDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {stats.severityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No assessment data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Journal Risk Distribution
                  </CardTitle>
                  <CardDescription>Risk levels from AI analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.riskDistribution && stats.riskDistribution.some((r) => r.value > 0) ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.riskDistribution}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Entries">
                          {stats.riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No journal data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* High Risk Alerts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Recent High-Risk Alerts
                </CardTitle>
                <CardDescription>
                  Students flagged for elevated risk (anonymized IDs)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID (Partial)</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">{alert.userId}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                alert.riskLevel === 'High' || alert.riskLevel === 'severe'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {alert.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>{alert.source}</TableCell>
                          <TableCell>{alert.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No high-risk alerts at this time
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <div className="mt-8 rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Privacy Notice:</strong> All data displayed is anonymized. User IDs are
                partially hidden to protect student privacy. This panel is for monitoring trends
                and ensuring student safety only.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
