import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppHeader from "@/components/layout/AppHeader";
import { History as HistoryIcon, TrendingUp, TrendingDown, Minus, Calendar, Target, Activity, AlertTriangle, Download } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Assessment {
  id: string;
  assessment_type: string;
  total_score: number;
  severity: string;
  completed_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  minimal: "bg-green-100 text-green-800",
  mild: "bg-yellow-100 text-yellow-800",
  moderate: "bg-orange-100 text-orange-800",
  moderately_severe: "bg-red-100 text-red-800",
  severe: "bg-red-200 text-red-900"
};

export default function History() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (data) setAssessments(data);
    setIsLoading(false);
  };

  const filteredAssessments = filterType === "all" 
    ? assessments 
    : assessments.filter(a => a.assessment_type === filterType);

  // Calculate stats
  const latestAssessment = assessments[0];
  const avgScore = assessments.length > 0 
    ? Math.round(assessments.reduce((acc, a) => acc + a.total_score, 0) / assessments.length)
    : 0;
  
  // Check-in consistency (assessments in last 30 days / expected 4 weekly)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = assessments.filter(a => new Date(a.completed_at) > thirtyDaysAgo).length;
  const consistency = Math.min(100, Math.round((recentCount / 4) * 100));

  // Primary stressor (most common severe/moderate)
  const severeCounts = assessments
    .filter(a => ['moderate', 'moderately_severe', 'severe'].includes(a.severity))
    .reduce((acc, a) => {
      acc[a.assessment_type] = (acc[a.assessment_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const primaryStressor = Object.entries(severeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None detected";

  // Chart data - last 8 assessments
  const chartData = [...assessments]
    .reverse()
    .slice(-8)
    .map(a => ({
      date: format(new Date(a.completed_at), "MMM d"),
      score: a.total_score,
      type: a.assessment_type
    }));

  // Determine trend
  const getTrend = (index: number) => {
    if (index === 0 || assessments.length < 2) return "stable";
    const current = assessments[index];
    const previous = assessments.find((a, i) => i > index && a.assessment_type === current.assessment_type);
    if (!previous) return "stable";
    if (current.total_score < previous.total_score) return "improving";
    if (current.total_score > previous.total_score) return "worsening";
    return "stable";
  };

  const getRiskLevel = () => {
    if (!latestAssessment) return "Unknown";
    if (['severe', 'moderately_severe'].includes(latestAssessment.severity)) return "High";
    if (['moderate'].includes(latestAssessment.severity)) return "Moderate";
    return "Low";
  };

  const getRiskColor = () => {
    const risk = getRiskLevel();
    if (risk === "High") return "text-red-600";
    if (risk === "Moderate") return "text-yellow-600";
    return "text-green-600";
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container max-w-6xl py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HistoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assessment History</h1>
              <p className="text-sm text-muted-foreground">Track your check-ins and assessments over time</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Current Risk Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${getRiskColor()}`}>{getRiskLevel()}</p>
              {assessments.length >= 2 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getTrend(0) === "improving" ? "Improved" : getTrend(0) === "worsening" ? "Escalated" : "Stable"} since last check
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{avgScore}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all assessments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Check-in Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{consistency}%</p>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Primary Stressor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{primaryStressor === "PHQ-9" ? "Depression" : primaryStressor === "GAD-7" ? "Anxiety" : primaryStressor}</p>
              <p className="text-xs text-muted-foreground mt-1">Based on elevated scores</p>
            </CardContent>
          </Card>
        </div>

        {/* Wellness Score Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Wellness Score Trend</CardTitle>
            <CardDescription>Your assessment scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.date}</p>
                            <p className="text-sm text-muted-foreground">{data.type}: {data.score}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Complete assessments to see your trend</p>
            )}
          </CardContent>
        </Card>

        {/* Past Assessments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Past Assessments</CardTitle>
                <CardDescription>All your completed check-ins</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PHQ-9">PHQ-9</SelectItem>
                    <SelectItem value="GAD-7">GAD-7</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment, index) => {
                    const trend = getTrend(index);
                    return (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {format(new Date(assessment.completed_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{assessment.assessment_type}</TableCell>
                        <TableCell>{assessment.total_score}</TableCell>
                        <TableCell>
                          <Badge className={SEVERITY_COLORS[assessment.severity] || "bg-gray-100"}>
                            {assessment.severity.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {trend === "improving" && (
                              <>
                                <TrendingDown className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">Improving</span>
                              </>
                            )}
                            {trend === "worsening" && (
                              <>
                                <TrendingUp className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-600">Worsening</span>
                              </>
                            )}
                            {trend === "stable" && (
                              <>
                                <Minus className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Stable</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate('/trends')}>
                            View Details →
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No assessments found. Take your first assessment to start tracking.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Note:</strong> This history is for self-awareness only and does not constitute medical advice. 
              Consult a healthcare professional for clinical interpretation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
