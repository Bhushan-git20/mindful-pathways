import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Heart, Shield, Sparkles } from 'lucide-react';
export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>;
  }
  const features = [{
    icon: Brain,
    title: 'Self-Assessment',
    description: 'Validated questionnaires to understand your mental state'
  }, {
    icon: Heart,
    title: 'Personal Insights',
    description: 'Track your wellness journey with personalized dashboards'
  }, {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your data is encrypted and completely confidential'
  }, {
    icon: Sparkles,
    title: 'AI Support',
    description: 'Get guidance and resources tailored to your needs'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container relative flex min-h-screen flex-col items-center justify-center py-12 lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left side - Branding */}
        <div className="relative hidden h-full flex-col p-10 text-primary-foreground lg:flex overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          <div className="relative z-20 flex items-center gap-3 text-lg font-semibold animate-fade-in-down">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-6">
              <Brain className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl">MindMate</span>
          </div>
          <div className="relative z-20 mt-auto animate-fade-in-left">
            <blockquote className="space-y-2">
              <p className="text-xl font-medium leading-relaxed">
                "Taking care of your mental health is not a luxury, it's a necessity."
              </p>
              <footer className="text-sm opacity-80">— Student Mental Health Initiative</footer>
            </blockquote>
          </div>
          <div className="relative z-20 mt-8 grid grid-cols-2 gap-4">
            {features.map((feature, index) => <div 
                key={feature.title} 
                className="space-y-2 rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-lg animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.2 + index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <feature.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>)}
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex w-full flex-col items-center justify-center px-4 lg:px-8 bg-card/80 backdrop-blur-sm animate-fade-in">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-3 text-lg font-semibold lg:hidden group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MindMate</span>
          </div>

          <AuthForm mode={mode} onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} />

          <div className="mt-8 max-w-sm text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-sm">
              <p className="text-xs text-muted-foreground">
                <strong>Important:</strong> This platform is a screening and self-help tool, not a diagnostic service or replacement for professional mental health care. If you're in crisis, please call iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}