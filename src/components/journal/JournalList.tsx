import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  mood_tags: string[] | null;
  risk_level: "low" | "medium" | "high" | null;
  risk_analysis: { summary?: string } | null;
}

interface JournalListProps {
  entries: JournalEntry[];
  isLoading: boolean;
}

const riskColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

const moodColors: Record<string, string> = {
  // Calm moods (Blue/Indigo)
  'calm': 'border-indigo-200 bg-indigo-50/30',
  'peaceful': 'border-blue-200 bg-blue-50/30',
  'relaxed': 'border-sky-200 bg-sky-50/30',
  'content': 'border-cyan-200 bg-cyan-50/30',
  
  // Happy moods (Yellow/Orange)
  'happy': 'border-amber-200 bg-amber-50/30',
  'joyful': 'border-yellow-200 bg-yellow-50/30',
  'excited': 'border-orange-200 bg-orange-50/30',
  'grateful': 'border-yellow-300 bg-yellow-50/40',
  
  // High energy / Anxiety (Rose/Red)
  'anxious': 'border-rose-200 bg-rose-50/30',
  'stressed': 'border-red-200 bg-red-50/30',
  'angry': 'border-rose-300 bg-rose-50/40',
  'overwhelmed': 'border-pink-200 bg-pink-50/30',
  
  // Low energy (Purple/Gray/Slate)
  'sad': 'border-slate-300 bg-slate-50/30',
  'tired': 'border-purple-200 bg-purple-50/30',
  'lonely': 'border-violet-200 bg-violet-50/30',
  'bored': 'border-gray-200 bg-gray-50/30',
  
  // Productive (Green/Teal)
  'productive': 'border-emerald-200 bg-emerald-50/30',
  'focused': 'border-teal-200 bg-teal-50/30',
  'motivated': 'border-green-200 bg-green-50/30',
};

const getMoodStyle = (tags: string[] | null) => {
  if (!tags || tags.length === 0) return 'border-border bg-card';
  
  // Find the first tag that has a defined color
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase().trim();
    if (moodColors[normalizedTag]) return moodColors[normalizedTag];
  }
  
  return 'border-border bg-card';
};

export function JournalList({ entries, isLoading }: JournalListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading entries...
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No journal entries yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Start writing to track your thoughts and feelings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className={`p-4 rounded-lg border transition-all hover:shadow-sm ${getMoodStyle(entry.mood_tags)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                  <div className="flex gap-2">
                    {entry.risk_level && (
                      <Badge variant="secondary" className={`text-[10px] font-bold uppercase ${riskColors[entry.risk_level]}`}>
                        {entry.risk_level}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-foreground/90 whitespace-pre-wrap line-clamp-4 text-sm leading-relaxed">
                  {entry.content}
                </p>

                {entry.mood_tags && entry.mood_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {entry.mood_tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-background/50 border-foreground/5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {entry.risk_analysis?.summary && (
                  <p className="text-xs text-muted-foreground mt-4 italic border-l-2 border-primary/20 pl-3 leading-relaxed">
                    {entry.risk_analysis.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
