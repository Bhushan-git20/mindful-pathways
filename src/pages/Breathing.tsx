import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, Wind, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';

type BreathingState = 'idle' | 'inhale' | 'hold' | 'exhale' | 'finished';

const BREATHING_TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Relieve stress and improve concentration',
    durations: { inhale: 4, hold: 4, exhale: 4, holdPost: 4 },
  },
  {
    id: '478',
    name: '4-7-8 Technique',
    description: 'Immediate calm and better sleep',
    durations: { inhale: 4, hold: 7, exhale: 8, skipHoldPost: true },
  },
  {
    id: 'calm',
    name: 'Deep Calm',
    description: 'Gentle relaxation for anxiety',
    durations: { inhale: 5, hold: 0, exhale: 7, skipHoldPost: true },
  },
];

export default function Breathing() {
  const navigate = useNavigate();
  const [activeTechnique, setActiveTechnique] = useState(BREATHING_TECHNIQUES[0]);
  const [breathingState, setBreathingState] = useState<BreathingState>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles] = useState(4);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const advanceState = useCallback(() => {
    if (breathingState === 'inhale') {
      if (activeTechnique.durations.hold > 0) {
        setBreathingState('hold');
        setTimeLeft(activeTechnique.durations.hold);
      } else {
        setBreathingState('exhale');
        setTimeLeft(activeTechnique.durations.exhale);
      }
    } else if (breathingState === 'hold') {
      setBreathingState('exhale');
      setTimeLeft(activeTechnique.durations.exhale);
    } else if (breathingState === 'exhale') {
      // Allow cycles to complete - if cycles is 4, we run 0,1,2,3
      if (currentCycle < cycles - 1) {
        setBreathingState('inhale');
        setTimeLeft(activeTechnique.durations.inhale);
        setCurrentCycle(prev => prev + 1);
      } else {
        setBreathingState('finished');
        setIsPlaying(false);
      }
    }
  }, [breathingState, activeTechnique, currentCycle, cycles]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && breathingState !== 'idle' && breathingState !== 'finished') {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        advanceState();
      }
    }

    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, breathingState, advanceState]);

  const startBreathing = () => {
    setIsPlaying(true);
    setBreathingState('inhale');
    setTimeLeft(activeTechnique.durations.inhale);
    setCurrentCycle(0); // Start at 0 for proper indexing
  };

  const resetBreathing = () => {
    setIsPlaying(false);
    setBreathingState('idle');
    setTimeLeft(0);
    setCurrentCycle(0);
  };

  const getBackgroundColor = () => {
    switch (breathingState) {
      case 'inhale': return 'bg-primary/20';
      case 'hold': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'exhale': return 'bg-secondary/20';
      default: return 'bg-muted/50';
    }
  };

  const getStatusText = () => {
    switch (breathingState) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'finished': return 'Great Job!';
      default: return 'Ready?';
    }
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/resources')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Guided Breathing</h1>
            <p className="text-muted-foreground">Find your calm in just a few minutes</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Technique Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wind className="h-5 w-5 text-primary" />
              Choose Technique
            </h2>
            {BREATHING_TECHNIQUES.map((tech) => (
              <Card 
                key={tech.id} 
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  activeTechnique.id === tech.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => {
                  if (breathingState === 'idle') setActiveTechnique(tech);
                }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{tech.name}</CardTitle>
                  <CardDescription className="text-xs">{tech.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}

            <div className="pt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Tip
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sit comfortably with your back straight. Rest your hands on your lap and relax your shoulders.
              </p>
            </div>
          </div>

          {/* Breathing Circle */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[500px]">
            <div className={`relative w-72 h-72 rounded-full flex items-center justify-center transition-colors duration-1000 ${getBackgroundColor()}`}>
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ 
                      scale: breathingState === 'inhale' ? 1.5 : breathingState === 'exhale' ? 1 : 1.2,
                      opacity: breathingState === 'hold' ? 0.3 : 0.6
                    }}
                    transition={{ 
                      duration: timeLeft > 0 ? timeLeft : 0.5, 
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 border-2 border-primary/30 rounded-full"
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{ 
                  scale: breathingState === 'inhale' ? 1.2 : breathingState === 'exhale' ? 0.8 : 1,
                }}
                transition={{ 
                  duration: timeLeft > 0 ? timeLeft : 0.5,
                  ease: "easeInOut"
                }}
                className="w-48 h-48 rounded-full bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-2xl relative z-10"
              >
                <span className="text-2xl font-bold tracking-tight mb-1">{getStatusText()}</span>
                {timeLeft > 0 && (
                  <span className="text-4xl font-black">{timeLeft}</span>
                )}
                {breathingState === 'finished' && (
                  <Heart className="h-10 w-10 text-white fill-white animate-pulse" />
                )}
              </motion.div>

              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {[...Array(cycles)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                      i <= currentCycle && breathingState !== 'finished' ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-20 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                {breathingState === 'idle' ? (
                  <Button size="lg" className="rounded-full px-8 gap-2" onClick={startBreathing}>
                    <Play className="h-5 w-5" />
                    Start Session
                  </Button>
                ) : breathingState === 'finished' ? (
                  <Button size="lg" className="rounded-full px-8 gap-2" onClick={resetBreathing}>
                    <RotateCcw className="h-5 w-5" />
                    Breathe Again
                  </Button>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="rounded-full h-14 w-14 p-0" 
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button 
                      size="lg" 
                      variant="ghost" 
                      className="rounded-full px-8 text-muted-foreground" 
                      onClick={resetBreathing}
                    >
                      Stop
                    </Button>
                  </div>
                )}
              </div>

              {breathingState !== 'idle' && breathingState !== 'finished' && (
                <p className="text-sm text-muted-foreground">
                  Cycle {currentCycle + 1} of {cycles}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
