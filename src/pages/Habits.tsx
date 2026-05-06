import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, TrendingUp, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, subDays, isSameDay } from 'date-fns';
import PageShell from '@/components/layout/PageShell';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Habit {
  id: string;
  name: string;
  color: string;
  streak: number;
  history: string[]; // Dates completed
}

const HABIT_COLORS = ['bg-primary', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];

export default function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [isAddingMode, setIsAddingMode] = useState(false);

  useEffect(() => {
    const savedHabits = localStorage.getItem('mindmate_habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      const defaults: Habit[] = [
        { 
          id: '1', name: 'Morning Meditation', 
          color: 'bg-primary', streak: 4, history: [
            format(subDays(new Date(), 1), 'yyyy-MM-dd'),
            format(subDays(new Date(), 2), 'yyyy-MM-dd'),
            format(subDays(new Date(), 3), 'yyyy-MM-dd')
          ] 
        }
      ];
      setHabits(defaults);
      localStorage.setItem('mindmate_habits', JSON.stringify(defaults));
    }

    if (user) {
      const fetchSuggestions = async () => {
        try {
          const { data, error } = await supabase
            .from('assessments')
            .select('responses')
            .eq('user_id', user.id)
            .eq('assessment_type', 'Conversational')
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data && data.responses && Array.isArray(data.responses)) {
            // responses array: [summary, habit1, habit2...]
            const suggested = data.responses.slice(1);
            if (suggested.length > 0) setAiSuggestions(suggested);
          }
        } catch (err) {
          console.error("Could not fetch suggestions", err);
        }
      };
      fetchSuggestions();
    }
  }, [user]);

  const saveToStorage = (updated: Habit[]) => {
    localStorage.setItem('mindmate_habits', JSON.stringify(updated));
    setHabits(updated);
  };

  const addHabit = (name: string) => {
    if (!name) return;
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(7),
      name: name,
      color: selectedColor,
      streak: 0,
      history: []
    };
    saveToStorage([...habits, newHabit]);
    setNewHabitName('');
    setIsAddingMode(false);
    toast.success('Habit added successfully!');
  };

  const addSuggestedHabit = (name: string) => {
    addHabit(name);
    setAiSuggestions(prev => prev.filter(h => h !== name));
  };

  const deleteHabit = (id: string) => {
    saveToStorage(habits.filter(h => h.id !== id));
    toast.info('Habit removed');
  };

  const toggleHabit = (id: string, date: string) => {
    const updated = habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.history.includes(date);
        let newHistory = [...habit.history];
        
        if (isCompleted) {
          newHistory = newHistory.filter(d => d !== date);
        } else {
          newHistory.push(date);
        }

        const today = format(new Date(), 'yyyy-MM-dd');
        let streak = 0;
        let checkDate = new Date(today);
        
        while (newHistory.includes(format(checkDate, 'yyyy-MM-dd'))) {
          streak++;
          checkDate = subDays(checkDate, 1);
        }

        return { ...habit, history: newHistory, streak };
      }
      return habit;
    });
    saveToStorage(updated);
  };

  const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), 6 - i));

  return (
    <PageShell maxWidth="md">
      <div className="py-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Smart Habits</h1>
          <p className="text-muted-foreground text-lg">Small, consistent steps build lasting resilience.</p>
        </div>

        {/* AI Suggestions Block */}
        {aiSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-transparent bg-primary/5 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Suggested by MindMate
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm">
                      <span className="text-sm font-medium">{suggestion}</span>
                      <Button size="sm" variant="ghost" className="h-8 rounded-full text-primary" onClick={() => addSuggestedHabit(suggestion)}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Add Habit Inline Form */}
        <Card className="border-transparent bg-card/60 backdrop-blur-md shadow-lg overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Input 
                placeholder="What new habit do you want to build?" 
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="bg-background border-muted/50 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && addHabit(newHabitName)}
              />
              <Button onClick={() => addHabit(newHabitName)} disabled={!newHabitName} className="rounded-xl flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
            
            <div className="flex gap-2">
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full ${color} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary/50' : ''}`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Habit List */}
        <div className="space-y-4">
          {habits.map((habit) => (
            <motion.div key={habit.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-transparent bg-card shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="p-5 md:w-56 border-r border-border/40 bg-muted/5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={`${habit.color} text-white border-none`}>Active</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground/50 hover:text-destructive" onClick={() => deleteHabit(habit.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <h3 className="font-bold text-lg font-display leading-tight">{habit.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold">{habit.streak} day streak</span>
                    </div>
                  </div>

                  <div className="flex-1 p-5 overflow-x-auto">
                    <div className="flex items-center justify-between gap-2 min-w-max">
                      {last7Days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isDone = habit.history.includes(dateStr);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <div key={dateStr} className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">{format(day, 'eee')}</span>
                            <button
                              onClick={() => toggleHabit(habit.id, dateStr)}
                              className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                                isDone 
                                  ? `${habit.color} text-white shadow-sm` 
                                  : 'bg-muted text-transparent hover:bg-muted/80'
                              } ${isToday ? 'ring-2 ring-offset-2 ring-primary/20' : ''}`}
                            >
                              {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : <Check className="h-5 w-5 text-foreground/10" />}
                            </button>
                            <span className={`text-[10px] ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                              {format(day, 'd')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </PageShell>
  );
}
