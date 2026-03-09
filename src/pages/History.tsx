import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageShell from "@/components/layout/PageShell";
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
import type { Json } from "@/integrations/supabase/types";

interface Assessment {
  id: string;
  assessment_type: string;
  total_score: number;
  severity: string;
  completed_at: string;
  responses: Json;
  interpretation?: string | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  minimal: "bg-severity-minimal/15 text-severity-minimal",
  mild: "bg-severity-mild/15 text-severity-mild",
  moderate: "bg-severity-moderate/15 text-severity-moderate",
  moderately_severe: "bg-severity-moderately-severe/15 text-severity-moderately-severe",
  severe: "bg-severity-severe/15 text-severity-severe"
};

// Helper to extract PHQ-9 and GAD-7 subscores from combined assessment
const getSubscores = (assessment: Assessment) => {
  const responses = (typeof assessment.responses === 'object' && assessment.responses !== null && !Array.isArray(assessment.responses)) 
    ? assessment.responses as Record<string, unknown>
    : {};
  let phq9Score = 0;
  let gad7Score = 0;
  
  // PHQ-9 questions are q1-q9, GAD-7 are q10-q16
  for (let i = 1; i <= 9; i++) {
    const val = responses[`q${i}`];
    phq9Score += typeof val === 'number' ? val : 0;
  }
  for (let i = 10; i <= 16; i++) {
    const val = responses[`q${i}`];
    gad7Score += typeof val === 'number' ? val : 0;
  }
  
  return { phq9Score, gad7Score };
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

  // Chart data - last 8 assessments with subscores
  const chartData = [...assessments]
    .reverse()
    .slice(-8)
    .map(a => {
      const { phq9Score, gad7Score } = getSubscores(a);
      return {
        date: format(new Date(a.completed_at), "MMM d"),
        score: a.total_score,
        phq9: phq9Score,
        gad7: gad7Score,
        type: a.assessment_type
      };
    });

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
    if (risk === "High") return "text-destructive";
    if (risk === "Moderate") return "text-warning";
    return "text-success";
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <PageShell maxWidth="xl">
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

        {/* Subscale Trend Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                Depression (PHQ-9) Trend
              </CardTitle>
              <CardDescription>Score range: 0-27</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" fontSize={12} className="text-muted-foreground" />
                    <YAxis domain={[0, 27]} fontSize={12} className="text-muted-foreground" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.date}</p>
                              <p className="text-sm text-blue-600">PHQ-9: {data.phq9}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="phq9" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">Complete assessments to see your trend</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                Anxiety (GAD-7) Trend
              </CardTitle>
              <CardDescription>Score range: 0-21</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" fontSize={12} className="text-muted-foreground" />
                    <YAxis domain={[0, 21]} fontSize={12} className="text-muted-foreground" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.date}</p>
                              <p className="text-sm text-purple-600">GAD-7: {data.gad7}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gad7" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-12">Complete assessments to see your trend</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Combined Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Combined Wellness Trend</CardTitle>
            <CardDescription>Depression and anxiety scores compared over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={12} className="text-muted-foreground" />
                  <YAxis fontSize={12} className="text-muted-foreground" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-2">{data.date}</p>
                            <p className="text-sm text-blue-600">Depression (PHQ-9): {data.phq9}</p>
                            <p className="text-sm text-purple-600">Anxiety (GAD-7): {data.gad7}</p>
                            <p className="text-sm text-muted-foreground mt-1">Total: {data.score}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="phq9" 
                    name="Depression"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gad7" 
                    name="Anxiety"
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6" }}
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assessments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>PHQ-9</TableHead>
                    <TableHead>GAD-7</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment, index) => {
                    const trend = getTrend(index);
                    const { phq9Score, gad7Score } = getSubscores(assessment);
                    return (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {format(new Date(assessment.completed_at), "MMM d, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600 font-medium">{phq9Score}</span>
                          <span className="text-muted-foreground text-xs">/27</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-purple-600 font-medium">{gad7Score}</span>
                          <span className="text-muted-foreground text-xs">/21</span>
                        </TableCell>
                        <TableCell className="font-semibold">{assessment.total_score}</TableCell>
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
                                <Minus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Stable</span>
                              </>
                            )}
                          </div>
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
    </PageShell>
  );
}
