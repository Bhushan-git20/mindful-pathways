import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Shield, Users, AlertTriangle, TrendingUp, ClipboardList, BookOpen, Eye, Download, CheckCircle, XCircle, Search, BarChart3, UserCog, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface Stats {
  totalStudents: number;
  totalAssessments: number;
  totalJournalEntries: number;
  highRiskCount: number;
  avgWellnessScore: number;
  resourceViews: number;
  severityDistribution: { name: string; value: number; color: string }[];
  riskDistribution: { name: string; value: number; color: string }[];
  weeklyTrend: { week: string; assessments: number; journals: number }[];
  topStressors: { name: string; percentage: number }[];
  topResources: { name: string; category: string; views: number; rating: number }[];
}

interface HighRiskAlert {
  id: string;
  userId: string;
  riskLevel: string;
  source: string;
  date: string;
  status: 'open' | 'resolved';
}

interface ManagedUser {
  user_id: string;
  email: string;
  full_name: string | null;
  institution: string | null;
  created_at: string;
  roles: AppRole[];
  assessmentCount: number;
  journalCount: number;
  latestRisk: string | null;
  latestSeverity: string | null;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<HighRiskAlert[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // User management state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>('student');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return;
      
      const { data: adminData } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (adminData) {
        setHasAccess(true);
        setIsAdmin(true);
      } else {
        const { data: counselorData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'counselor'
        });
        setHasAccess(counselorData === true);
        setIsAdmin(false);
      }
    };

    if (user) {
      checkAccess();
    }
  }, [user]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!hasAccess) return;
      setLoadingData(true);

      try {
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: assessmentCount } = await supabase
          .from('assessments')
          .select('*', { count: 'exact', head: true });

        const { count: journalCount } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact', head: true });

        const { data: assessments } = await supabase
          .from('assessments')
          .select('severity, total_score, completed_at');

        const severityCounts: Record<string, number> = {};
        let totalScore = 0;
        assessments?.forEach((a) => {
          severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
          totalScore += a.total_score;
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

        const highRiskJournals = journals?.filter((j) => j.risk_level === 'high').length || 0;
        const severeAssessments = assessments?.filter((a) => 
          a.severity === 'severe' || a.severity === 'moderately_severe'
        ).length || 0;

        const weeklyTrend = [
          { week: 'Week 1', assessments: 12, journals: 28 },
          { week: 'Week 2', assessments: 15, journals: 32 },
          { week: 'Week 3', assessments: 18, journals: 25 },
          { week: 'Week 4', assessments: 22, journals: 38 },
        ];

        const topStressors = [
          { name: 'Academic Pressure', percentage: 42 },
          { name: 'Social Anxiety', percentage: 28 },
          { name: 'Sleep Issues', percentage: 18 },
          { name: 'Homesickness', percentage: 12 },
        ];

        const topResources = [
          { name: 'Breathing Exercises', category: 'Coping Strategies', views: 234, rating: 4.8 },
          { name: 'Understanding Anxiety', category: 'Educational', views: 189, rating: 4.6 },
          { name: 'Guided Sleep Meditation', category: 'Music & Relaxation', views: 156, rating: 4.9 },
          { name: 'CBT Techniques', category: 'Self-Help', views: 142, rating: 4.5 },
        ];

        const { data: recentHighRiskJournals } = await supabase
          .from('journal_entries')
          .select('id, user_id, risk_level, created_at')
          .eq('risk_level', 'high')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: recentSevereAssessments } = await supabase
          .from('assessments')
          .select('id, user_id, severity, completed_at')
          .in('severity', ['severe', 'moderately_severe'])
          .order('completed_at', { ascending: false })
          .limit(5);

        const alertsList: HighRiskAlert[] = [
          ...(recentHighRiskJournals?.map((j) => ({
            id: j.id,
            userId: j.user_id.substring(0, 8) + '...',
            riskLevel: 'High',
            source: 'Journal',
            date: format(new Date(j.created_at), 'MMM d, yyyy'),
            status: 'open' as const,
          })) || []),
          ...(recentSevereAssessments?.map((a) => ({
            id: a.id,
            userId: a.user_id.substring(0, 8) + '...',
            riskLevel: a.severity.replace('_', ' '),
            source: 'Assessment',
            date: format(new Date(a.completed_at), 'MMM d, yyyy'),
            status: 'open' as const,
          })) || []),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

        const avgWellness = assessments && assessments.length > 0 
          ? Math.round(100 - (totalScore / assessments.length / 27) * 100)
          : 75;

        setStats({
          totalStudents: studentCount || 0,
          totalAssessments: assessmentCount || 0,
          totalJournalEntries: journalCount || 0,
          highRiskCount: highRiskJournals + severeAssessments,
          avgWellnessScore: avgWellness,
          resourceViews: 721,
          severityDistribution,
          riskDistribution,
          weeklyTrend,
          topStressors,
          topResources,
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

  // Fetch users for management
  useEffect(() => {
    if (hasAccess && activeSection === 'students') {
      fetchManagedUsers();
    }
  }, [hasAccess, activeSection]);

  const fetchManagedUsers = async () => {
    setLoadingUsers(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, institution, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      if (!profiles) return;

      // Fetch all roles
      const { data: allRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Fetch assessment counts per user
      const { data: allAssessments } = await supabase
        .from('assessments')
        .select('user_id, severity, completed_at');

      // Fetch journal counts per user
      const { data: allJournals } = await supabase
        .from('journal_entries')
        .select('user_id, risk_level, created_at');

      // Build user map
      const users: ManagedUser[] = profiles.map((p) => {
        const roles = allRoles?.filter(r => r.user_id === p.user_id).map(r => r.role) || [];
        const userAssessments = allAssessments?.filter(a => a.user_id === p.user_id) || [];
        const userJournals = allJournals?.filter(j => j.user_id === p.user_id) || [];
        
        // Latest severity from assessments
        const sortedAssessments = [...userAssessments].sort(
          (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        );
        const latestSeverity = sortedAssessments.length > 0 ? sortedAssessments[0].severity : null;

        // Latest risk from journals
        const sortedJournals = [...userJournals].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestRisk = sortedJournals.length > 0 ? sortedJournals[0].risk_level : null;

        return {
          user_id: p.user_id,
          email: p.email,
          full_name: p.full_name,
          institution: p.institution,
          created_at: p.created_at,
          roles,
          assessmentCount: userAssessments.length,
          journalCount: userJournals.length,
          latestRisk,
          latestSeverity,
        };
      });

      setManagedUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !isAdmin) return;

    try {
      // Check if user already has this role
      if (selectedUser.roles.includes(newRole)) {
        toast.info('User already has this role');
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.user_id, role: newRole });

      if (error) throw error;

      toast.success(`Added ${newRole} role to user`);
      setRoleChangeOpen(false);
      fetchManagedUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error(error.message || 'Failed to change role');
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    if (!isAdmin) return;
    if (role === 'student') {
      toast.error('Cannot remove the default student role');
      return;
    }
    if (userId === user?.id && role === 'admin') {
      toast.error('Cannot remove your own admin role');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      toast.success(`Removed ${role} role`);
      fetchManagedUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove role');
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'counselor': return 'default';
      case 'student': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return null;
    const colors: Record<string, string> = {
      minimal: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      mild: 'bg-lime-500/10 text-lime-600 border-lime-500/20',
      moderate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      moderately_severe: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      severe: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return (
      <Badge variant="outline" className={colors[severity] || ''}>
        {severity.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string | null) => {
    if (!risk) return null;
    const colors: Record<string, string> = {
      low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      high: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    };
    return (
      <Badge variant="outline" className={colors[risk] || ''}>
        {risk}
      </Badge>
    );
  };

  if (loading || hasAccess === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

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

  const filteredUsers = managedUsers.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name?.toLowerCase().includes(q) ?? false) ||
      u.roles.some(r => r.toLowerCase().includes(q)) ||
      (u.institution?.toLowerCase().includes(q) ?? false)
    );
  });

  const renderDashboard = () => (
    <>
      {(stats?.highRiskCount ?? 0) > 0 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div className="flex-1">
                <p className="font-semibold text-destructive">High Stress Alert Detected</p>
                <p className="text-sm text-muted-foreground">
                  {stats?.highRiskCount} students reported elevated stress levels in recent check-ins.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setActiveSection('alerts')}>
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <TrendingUp className="h-4 w-4 text-success" />
              <CardTitle className="text-sm font-medium">Avg Wellness</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.avgWellnessScore || 0}%</p>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-info" />
              <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalAssessments || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm font-medium">At-Risk Flags</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats?.highRiskCount || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Wellness Trends</CardTitle>
            <CardDescription>Average wellness score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats?.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="assessments" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Assessments" />
                <Area type="monotone" dataKey="journals" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} name="Journals" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Reported Stressors</CardTitle>
            <CardDescription>Most common concerns this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topStressors.map((stressor) => (
                <div key={stressor.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{stressor.name}</span>
                      <span className="text-sm text-muted-foreground">{stressor.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${stressor.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Accessed Resources</CardTitle>
          <CardDescription>Popular resources this month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.topResources.map((resource, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell><Badge variant="outline">{resource.category}</Badge></TableCell>
                  <TableCell>{resource.views}</TableCell>
                  <TableCell>⭐ {resource.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Assessment severity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.severityDistribution && stats.severityDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.severityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {stats.severityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journal Risk Distribution</CardTitle>
            <CardDescription>AI-detected risk levels</CardDescription>
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
              <p className="text-center text-muted-foreground py-12">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{managedUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins / Counselors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {managedUsers.filter(u => u.roles.includes('admin')).length} / {managedUsers.filter(u => u.roles.includes('counselor')).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {managedUsers.filter(u => u.latestRisk === 'high' || u.latestSeverity === 'severe' || u.latestSeverity === 'moderately_severe').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 w-[250px]"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading users...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Assessments</TableHead>
                  <TableHead>Journals</TableHead>
                  <TableHead>Latest Risk</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{u.assessmentCount}</TableCell>
                    <TableCell>{u.journalCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-col">
                        {getSeverityBadge(u.latestSeverity)}
                        {getRiskBadge(u.latestRisk)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(u.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedUser(u); setUserDetailOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedUser(u); setNewRole('student'); setRoleChangeOpen(true); }}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-12">No users found</p>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Anonymized user profile and activity summary</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedUser.full_name || 'Unnamed'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Institution</Label>
                  <p className="font-medium">{selectedUser.institution || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Joined</Label>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Roles</Label>
                <div className="flex gap-1 mt-1">
                  {selectedUser.roles.map((role) => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)}>
                      {role}
                      {isAdmin && role !== 'student' && (
                        <button
                          className="ml-1 hover:text-destructive-foreground"
                          onClick={() => handleRemoveRole(selectedUser.user_id, role)}
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedUser.assessmentCount}</p>
                    <p className="text-xs text-muted-foreground">Assessments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedUser.journalCount}</p>
                    <p className="text-xs text-muted-foreground">Journal Entries</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Latest Assessment</Label>
                  <div className="mt-1">{getSeverityBadge(selectedUser.latestSeverity) || <span className="text-sm text-muted-foreground">None</span>}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Latest Journal Risk</Label>
                  <div className="mt-1">{getRiskBadge(selectedUser.latestRisk) || <span className="text-sm text-muted-foreground">None</span>}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleChangeOpen} onOpenChange={setRoleChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Role</DialogTitle>
            <DialogDescription>
              Add a role to {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Roles</Label>
              <div className="flex gap-1 mt-1">
                {selectedUser?.roles.map((role) => (
                  <Badge key={role} variant={getRoleBadgeVariant(role)}>
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Add Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="counselor">Counselor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeOpen(false)}>Cancel</Button>
            <Button onClick={handleRoleChange}>Add Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Active Alerts
          </CardTitle>
          <CardDescription>High-risk cases requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-mono text-sm">{alert.userId}</TableCell>
                    <TableCell>
                      <Badge variant={alert.riskLevel === 'High' ? 'destructive' : 'secondary'}>
                        {alert.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{alert.source}</TableCell>
                    <TableCell>{alert.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={alert.status === 'open' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}>
                        {alert.status === 'open' ? 'Open' : 'Resolved'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-12">No active alerts</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Library</CardTitle>
              <CardDescription>Manage student resources</CardDescription>
            </div>
            <Button>Add Resource</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.topResources.map((resource, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell><Badge variant="outline">{resource.category}</Badge></TableCell>
                  <TableCell>{resource.views}</TableCell>
                  <TableCell><Badge className="bg-green-50 text-green-700">Active</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Check-in Frequency</Label>
              <p className="text-sm text-muted-foreground">Default reminder frequency for students</p>
            </div>
            <Badge variant="outline">Weekly</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">High Risk Threshold</Label>
              <p className="text-sm text-muted-foreground">Score threshold for flagging high risk</p>
            </div>
            <Badge variant="outline">15+</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Crisis Banner</Label>
              <p className="text-sm text-muted-foreground">Show crisis resources banner to all students</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard Overview',
      analytics: 'Analytics',
      students: 'User Management',
      resources: 'Resource Library',
      alerts: 'Alerts & Flags',
      settings: 'Settings',
    };
    return titles[activeSection] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'analytics': return renderAnalytics();
      case 'students': return renderStudents();
      case 'resources': return renderResources();
      case 'alerts': return renderAlerts();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-foreground">{getSectionTitle()}</h1>
              <Badge variant="secondary">{isAdmin ? 'Admin' : 'Counselor'}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              {activeSection === 'dashboard' && 'Anonymized overview of student wellness'}
              {activeSection === 'analytics' && 'Detailed analytics and trends'}
              {activeSection === 'students' && 'View all users, manage roles, and monitor activity'}
              {activeSection === 'resources' && 'Manage educational resources'}
              {activeSection === 'alerts' && 'Review and manage high-risk alerts'}
              {activeSection === 'settings' && 'Configure system settings'}
            </p>
          </div>

          {loadingData && activeSection !== 'students' ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading statistics...</div>
            </div>
          ) : (
            renderContent()
          )}

          <div className="mt-8 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Privacy Notice:</strong> All data displayed is anonymized. User IDs are
              partially hidden to protect student privacy. This panel is for monitoring trends
              and ensuring student safety only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
