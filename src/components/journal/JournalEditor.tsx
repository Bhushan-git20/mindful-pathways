import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";

interface JournalEditorProps {
  onSave: () => void;
}

export function JournalEditor({ onSave }: JournalEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || content.trim().length < 10) {
      toast({
        title: "Error",
        description: "Please write at least 10 characters.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Analyze with AI
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-journal', {
        body: { content }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
      }

      const riskLevel = analysisData?.risk_level || 'low';
      const moodTags = analysisData?.mood_tags || [];
      const riskAnalysis = analysisData?.analysis || null;

      setIsAnalyzing(false);
      setIsSaving(true);

      // Save to database
      const { error: saveError } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        content: content,
        risk_level: riskLevel,
        mood_tags: moodTags,
        risk_analysis: riskAnalysis
      });

      if (saveError) throw saveError;

      toast({
        title: "Entry Saved",
        description: "Your journal entry has been saved securely."
      });

      setContent("");
      onSave();

      // Show warning for high risk
      if (riskLevel === 'high') {
        toast({
          title: "We're Here for You",
          description: "If you're struggling, please reach out to a counselor or call 988.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error saving journal:', error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          New Journal Entry
        </CardTitle>
        <CardDescription>
          Write freely about your thoughts and feelings. Your entries are private and secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="How are you feeling today? What's on your mind..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {content.length} characters
          </p>
          <Button 
            onClick={handleSave} 
            disabled={content.trim().length < 10 || isAnalyzing || isSaving}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Entry"
            )}
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your entries are analyzed by AI to help identify patterns and provide personalized resources. 
              This is not a substitute for professional support.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
