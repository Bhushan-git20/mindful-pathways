import { useState, useEffect } from 'react';
import { Plus, Check, MoreVertical, Trash2, Calendar, Target, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, startOfWeek, addDays, isSameDay, subDays } from 'date-fns';
import PageShell from '@/components/layout/PageShell';

interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  streak: number;
  lastCompleted?: string;
  history: string[]; // Dates completed
}

const HABIT_COLORS = [
  'bg-primary', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 
  'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-violet-500'
];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  // Use localStorage for persistence if DB tables aren't ready
  useEffect(() => {
    const savedHabits = localStorage.getItem('mindmate_habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      // Default sample habits
      const defaults: Habit[] = [
        { 
          id: '1', name: 'Morning Meditation', description: '5 minutes of breathing', 
          color: 'bg-primary', streak: 4, history: [
            format(subDays(new Date(), 1), 'yyyy-MM-dd'),
            format(subDays(new Date(), 2), 'yyyy-MM-dd'),
            format(subDays(new Date(), 3), 'yyyy-MM-dd'),
            format(subDays(new Date(), 4), 'yyyy-MM-dd')
          ] 
        },
        { 
          id: '2', name: 'Journaling', description: 'Reflect on my day', 
          color: 'bg-emerald-500', streak: 2, history: [
            format(subDays(new Date(), 1), 'yyyy-MM-dd'),
            format(subDays(new Date(), 2), 'yyyy-MM-dd')
          ] 
        }
      ];
      setHabits(defaults);
      localStorage.setItem('mindmate_habits', JSON.stringify(defaults));
    }
  }, []);

  const saveToStorage = (updated: Habit[]) => {
    localStorage.setItem('mindmate_habits', JSON.stringify(updated));
    setHabits(updated);
  };

  const addHabit = () => {
    if (!newHabitName) return;
    const newHabit: Habit = {
      id: Math.random().toString(36).substring(7),
      name: newHabitName,
      description: newHabitDesc,
      color: selectedColor,
      streak: 0,
      history: []
    };
    const updated = [...habits, newHabit];
    saveToStorage(updated);
    setNewHabitName('');
    setNewHabitDesc('');
    setIsAddingMode(false);
    toast.success('Habit added successfully!');
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    saveToStorage(updated);
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

        // Simple streak calculation (only if today/yesterday)
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
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
    <PageShell>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Habit Tracking</h1>
            <p className="text-muted-foreground">Small steps lead to big changes</p>
          </div>
          <Dialog open={isAddingMode} onOpenChange={setIsAddingMode}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full px-6">
                <Plus className="h-4 w-4" /> New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
                <DialogDescription>What positive action do you want to build?</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Habit Name</Label>
                  <Input id="name" placeholder="e.g. Read for 10 minutes" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Input id="desc" placeholder="e.g. Right after morning coffee" value={newHabitDesc} onChange={e => setNewHabitDesc(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pick a Color</Label>
                  <div className="flex gap-2">
                    {HABIT_COLORS.map(color => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full ${color} ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingMode(false)}>Cancel</Button>
                <Button onClick={addHabit}>Create Habit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No habits yet</h3>
              <p className="text-muted-foreground max-w-xs mt-1">Start your journey by adding a habit you want to build.</p>
              <Button variant="outline" className="mt-6" onClick={() => setIsAddingMode(true)}>
                Add your first habit
              </Button>
            </div>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="overflow-hidden group transition-all hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Left Info Column */}
                    <div className="p-6 md:w-64 border-r bg-muted/10">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={`${habit.color} text-white border-none px-2 py-0.5`}>
                          Active
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteHabit(habit.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="text-xl font-bold font-display">{habit.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{habit.description}</p>
                      
                      <div className="flex items-center gap-2 mt-6">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-bold leading-none">{habit.streak} days</p>
                          <p className="text-xs text-muted-foreground">Current streak</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Grid Column (Days) */}
                    <div className="flex-1 p-6 overflow-x-auto">
                      <div className="flex items-center justify-between gap-4 min-w-max">
                        {last7Days.map((day, i) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isDone = habit.history.includes(dateStr);
                          const isToday = isSameDay(day, new Date());
                          
                          return (
                            <div key={dateStr} className="flex flex-col items-center gap-3">
                              <span className="text-xs font-medium text-muted-foreground uppercase">{format(day, 'eee')}</span>
                              <button
                                onClick={() => toggleHabit(habit.id, dateStr)}
                                className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                  isDone 
                                    ? `${habit.color} text-white shadow-lg` 
                                    : 'bg-muted/50 text-transparent hover:bg-muted border border-transparent'
                                } ${isToday ? 'scale-110 shadow-md border-primary/30' : ''}`}
                              >
                                {isDone && <Check className="h-6 w-6" strokeWidth={3} />}
                                {!isDone && <Check className="h-6 w-6 text-muted-foreground/30" />}
                              </button>
                              <span className={`text-xs ${isToday ? 'font-bold text-primary underline underline-offset-4' : 'text-muted-foreground'}`}>
                                {format(day, 'd')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Feature info footer */}
        <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
          <Info className="h-6 w-6 text-primary flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold">About Habit Tracking</h4>
            <p className="text-sm text-muted-foreground">
              This feature currently uses local storage. To synchronize habits across devices, 
              ask the admin to set up the <code>habits</code> table in the Supabase database.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
