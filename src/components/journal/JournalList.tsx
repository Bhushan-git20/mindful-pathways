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
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                  {entry.risk_level && (
                    <Badge variant="secondary" className={riskColors[entry.risk_level]}>
                      {entry.risk_level}
                    </Badge>
                  )}
                </div>
                
                <p className="text-foreground whitespace-pre-wrap line-clamp-4">
                  {entry.content}
                </p>

                {entry.mood_tags && entry.mood_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {entry.mood_tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {entry.risk_analysis?.summary && (
                  <p className="text-sm text-muted-foreground mt-3 italic border-l-2 border-primary/30 pl-3">
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
