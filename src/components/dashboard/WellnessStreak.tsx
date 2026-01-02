import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WellnessStreakProps {
  currentStreak: number;
  weeklyCheckIns: boolean[];
  longestStreak: number;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WellnessStreak({ currentStreak, weeklyCheckIns, longestStreak }: WellnessStreakProps) {
  const getStreakColor = () => {
    if (currentStreak >= 7) return 'text-orange-500';
    if (currentStreak >= 3) return 'text-amber-500';
    return 'text-primary';
  };

  const getStreakMessage = () => {
    if (currentStreak >= 7) return "🔥 On fire! Perfect week!";
    if (currentStreak >= 5) return "Amazing consistency!";
    if (currentStreak >= 3) return "Great streak going!";
    if (currentStreak >= 1) return "Keep it up!";
    return "Start your streak today!";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wellness Streak</CardTitle>
            <motion.div
              animate={{ scale: currentStreak > 0 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5, repeat: currentStreak >= 3 ? Infinity : 0, repeatDelay: 2 }}
            >
              <Flame className={`h-5 w-5 ${getStreakColor()}`} />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Current Streak Display */}
          <div className="flex items-center gap-4">
            <motion.div
              className={`text-5xl font-bold ${getStreakColor()}`}
              key={currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {currentStreak}
            </motion.div>
            <div>
              <p className="text-sm font-medium text-foreground">
                day{currentStreak !== 1 ? 's' : ''} streak
              </p>
              <p className="text-xs text-muted-foreground">{getStreakMessage()}</p>
            </div>
          </div>

          {/* Weekly Check-in Dots */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">This Week</p>
            <div className="flex justify-between gap-1">
              {weeklyCheckIns.map((checkedIn, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  {checkedIn ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15, delay: index * 0.05 + 0.3 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </motion.div>
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground/30" />
                  )}
                  <span className="text-[10px] text-muted-foreground">{dayLabels[index]}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
              <p className="text-sm font-semibold text-foreground">{longestStreak} days</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-sm font-semibold text-foreground">
                {weeklyCheckIns.filter(Boolean).length}/7 days
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
