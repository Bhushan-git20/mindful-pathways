import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { JournalList } from "@/components/journal/JournalList";
import PageShell from "@/components/layout/PageShell";
import { Loader2, Sparkles, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
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
    if (user) fetchEntries();
  }, [user]);

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setIsSaving(true);
    
    try {
      const tags = selectedMood ? [selectedMood] : [];
      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        content: content.trim(),
        mood_tags: tags,
      });

      if (error) throw error;
      
      toast.success("Entry saved successfully");
      setContent("");
      setSelectedMood(null);
      fetchEntries();
      
      // Background risk analysis
      supabase.functions.invoke("analyze-journal", {
        body: { content: content.trim() }
      });
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const moods = [
    { emoji: "😔", label: "sad" },
    { emoji: "😐", label: "neutral" },
    { emoji: "😊", label: "happy" },
    { emoji: "🤩", label: "excited" },
    { emoji: "😌", label: "calm" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Loading Journal...
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <PageShell maxWidth="full" hideHeader>
      <div className="atmospheric-bg"></div>
      
      <main className="min-h-screen p-6 lg:p-12 pb-32">
        <header className="max-w-4xl mx-auto flex justify-between items-end mb-12">
          <div>
            <p className="text-[12px] font-bold tracking-[0.2em] mb-2 uppercase text-secondary">{today}</p>
            <h2 className="text-4xl font-display font-bold text-white">Daily Journal</h2>
          </div>
          <div className="flex -space-x-2">
            <div className="w-12 h-12 rounded-full border-2 border-background shadow-xl bg-primary flex items-center justify-center overflow-hidden">
               <span className="text-xl font-bold text-white">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Mood Selector Section */}
          <section>
            <h3 className="text-xl font-display font-semibold mb-6 text-muted-foreground flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
              How are you feeling right now?
            </h3>
            <div className="mood-selector flex items-center justify-between p-6 md:p-8">
              {moods.map((mood) => (
                <button 
                  key={mood.label}
                  onClick={() => setSelectedMood(mood.label)}
                  className={`mood-item w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl ${selectedMood === mood.label ? 'selected border-2 border-secondary bg-secondary/10 transform -translate-y-2 scale-110' : ''}`}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </section>

          {/* Main Writing Area */}
          <section className="relative group">
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 min-h-[500px] flex flex-col gap-8">
              <div className="flex items-start gap-6 border-b border-white/10 pb-8">
                <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <div>
                  <h4 className="text-2xl font-display font-semibold text-white mb-2">Morning Reflection</h4>
                  <p className="text-lg text-zinc-400">"What is one small thing that brought you peace today?"</p>
                </div>
              </div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="inset-input flex-grow w-full rounded-2xl p-6 text-lg text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all resize-none" 
                placeholder="Start typing your thoughts here..."
              />
              <div className="flex flex-wrap gap-3">
                {selectedMood && (
                  <span className="px-4 py-2 glass-card rounded-full text-sm font-medium border-secondary/30 text-secondary">
                    #{selectedMood}
                  </span>
                )}
                <span className="px-4 py-2 glass-card rounded-full text-sm font-medium border-white/5 text-zinc-400">#Mindfulness</span>
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute -right-4 md:-right-8 bottom-12 flex flex-col gap-4 z-10">
              <button 
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className="w-16 h-16 rounded-full glass-orb-fab flex items-center justify-center group/btn active:scale-90 transition-transform disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin text-white" /> : (
                  <Save className="text-white w-8 h-8 transition-transform group-hover/btn:rotate-12" />
                )}
                <span className="absolute -left-20 bg-zinc-800 px-3 py-1 rounded-lg text-sm opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none text-white font-bold">Save</span>
              </button>
              <button className="w-16 h-16 rounded-full glass-card border-secondary/30 flex items-center justify-center group/btn active:scale-90 transition-transform bg-zinc-900/80">
                <Wand2 className="text-secondary w-7 h-7 group-hover/btn:scale-110 transition-transform" />
                <span className="absolute -left-24 bg-zinc-800 px-3 py-1 rounded-lg text-sm opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none text-white font-bold">New Prompt</span>
              </button>
            </div>
          </section>

          {/* Past Entries */}
          <section className="mt-12">
            <h3 className="text-2xl font-display font-semibold text-white mb-6">Past Entries</h3>
            <div className="glass-card rounded-[2.5rem] p-8">
              <JournalList entries={entries} isLoading={isLoading} />
            </div>
          </section>

        </div>
      </main>
    </PageShell>
  );
}
