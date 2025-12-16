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
  return <div className="min-h-screen gradient-hero">
      <div className="container relative flex min-h-screen flex-col items-center justify-center py-12 lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left side - Branding */}
        <div className="relative hidden h-full flex-col bg-primary p-10 text-primary-foreground lg:flex">
          <div className="absolute inset-0 gradient-calm opacity-90" />
          <div className="relative z-20 flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-6 w-6" />
            <span className="font-display">MindfulU</span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Taking care of your mental health is not a luxury, it's a necessity."
              </p>
              <footer className="text-sm opacity-80">— Student Mental Health Initiative</footer>
            </blockquote>
          </div>
          <div className="relative z-20 mt-8 grid grid-cols-2 gap-4">
            {features.map(feature => <div key={feature.title} className="space-y-2 rounded-lg bg-primary-foreground/10 p-4">
                <feature.icon className="h-5 w-5" />
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>)}
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex w-full flex-col items-center justify-center px-4 lg:px-8 bg-[sidebar-primary-foreground] bg-info">
          {/* Mobile branding */}
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-display">MindfulU</span>
          </div>

          <AuthForm mode={mode} onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} />

          <div className="mt-8 max-w-sm text-center">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Important:</strong> This platform is a screening and self-help tool, not a diagnostic service or replacement for professional mental health care. If you're in crisis, please contact emergency services or a crisis helpline immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}