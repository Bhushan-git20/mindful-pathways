import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { JournalList } from "@/components/journal/JournalList";
import PageShell from "@/components/layout/PageShell";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  mood_tags: string[] | null;
  risk_level: "low" | "medium" | "high" | null;
  risk_analysis: { summary?: string } | null;
}

export default function Journal() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const fetchEntries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      setEntries((data || []).map(entry => ({
        ...entry,
        risk_analysis: entry.risk_analysis as { summary?: string } | null
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container max-w-4xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Journal</h1>
          <p className="text-muted-foreground mt-2">
            A private space to reflect on your thoughts and feelings.
          </p>
        </div>

        <Card className="mb-6 bg-warning/10 border-warning/30">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <p className="text-sm text-foreground/80">
                Your journal entries are analyzed to help identify patterns and provide support. 
                This is a self-help tool, not therapy. If you need immediate help, please contact a counselor or call 988.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <JournalEditor onSave={fetchEntries} />
          <JournalList entries={entries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
