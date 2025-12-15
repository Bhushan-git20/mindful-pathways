import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppHeader from "@/components/layout/AppHeader";
import { TrendingUp, Brain, Heart, BookOpen } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Assessment {
  id: string;
  assessment_type: string;
  total_score: number;
  severity: string;
  completed_at: string;
}

interface JournalEntry {
  id: string;
  created_at: string;
  risk_level: string | null;
  mood_tags: string[] | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  minimal: "#22c55e",
  mild: "#eab308",
  moderate: "#f97316",
  moderately_severe: "#ef4444",
  severe: "#dc2626"
};

const RISK_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#ef4444"
};

export default function Trends() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [assessmentsRes, journalRes] = await Promise.all([
      supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true }),
      supabase
        .from("journal_entries")
        .select("id, created_at, risk_level, mood_tags")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
    ]);

    if (assessmentsRes.data) setAssessments(assessmentsRes.data);
    if (journalRes.data) setJournalEntries(journalRes.data);
    setIsLoading(false);
  };

  const phq9Data = assessments
    .filter(a => a.assessment_type === "PHQ-9")
    .map(a => ({
      date: format(new Date(a.completed_at), "MMM d"),
      score: a.total_score,
      severity: a.severity
    }));

  const gad7Data = assessments
    .filter(a => a.assessment_type === "GAD-7")
    .map(a => ({
      date: format(new Date(a.completed_at), "MMM d"),
      score: a.total_score,
      severity: a.severity
    }));

  const severityDistribution = assessments.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(severityDistribution).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
    color: SEVERITY_COLORS[name] || "#94a3b8"
  }));

  const moodTagCounts = journalEntries.reduce((acc, entry) => {
    (entry.mood_tags || []).forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topMoods = Object.entries(moodTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const journalRiskData = journalEntries.reduce((acc, entry) => {
    const level = entry.risk_level || "low";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskPieData = Object.entries(journalRiskData).map(([name, value]) => ({
    name,
    value,
    color: RISK_COLORS[name] || "#94a3b8"
  }));

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
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Wellness Trends</h1>
              <p className="text-sm text-muted-foreground">Track your mental health journey over time</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                Total Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{assessments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-500" />
                Journal Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{journalEntries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Top Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold capitalize">
                {topMoods[0]?.name || "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="journal">Journal Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>PHQ-9 Scores Over Time</CardTitle>
                  <CardDescription>Depression screening trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {phq9Data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={phq9Data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis domain={[0, 27]} fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No PHQ-9 assessments yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GAD-7 Scores Over Time</CardTitle>
                  <CardDescription>Anxiety screening trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {gad7Data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={gad7Data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis domain={[0, 21]} fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No GAD-7 assessments yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Breakdown of all assessment results</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Complete assessments to see distribution</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Frequent Moods</CardTitle>
                  <CardDescription>Tags detected in your journal entries</CardDescription>
                </CardHeader>
                <CardContent>
                  {topMoods.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={topMoods} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" fontSize={12} />
                        <YAxis type="category" dataKey="name" fontSize={12} width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No journal entries with mood tags yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Journal Risk Levels</CardTitle>
                  <CardDescription>AI-detected emotional intensity in entries</CardDescription>
                </CardHeader>
                <CardContent>
                  {riskPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={riskPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {riskPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No journal entries analyzed yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Note:</strong> These trends are for self-awareness only. 
              They do not constitute medical advice. Consult a professional for clinical interpretation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
