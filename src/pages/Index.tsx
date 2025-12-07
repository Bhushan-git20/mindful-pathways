import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, Heart, Shield, Sparkles, ClipboardList } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: ClipboardList,
      title: 'Validated Assessments',
      description: 'Complete PHQ-9 and GAD-7 questionnaires with instant, research-backed scoring and interpretation.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Our AI analyzes your journal entries to identify patterns and provide personalized recommendations.',
    },
    {
      icon: Heart,
      title: 'Wellness Tracking',
      description: 'Monitor your mental health journey with visual dashboards showing trends over time.',
    },
    {
      icon: Sparkles,
      title: 'Smart Support',
      description: 'Get 24/7 access to an AI chatbot for psychoeducation, coping strategies, and resource recommendations.',
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data is encrypted and confidential. You control what you share and can delete anytime.',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold font-display">MindfulU</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border bg-card px-4 py-1.5 text-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-success animate-pulse" />
            Designed for college students
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Mental Wellness
            <span className="block text-primary">Companion</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            A secure, AI-powered platform to help you understand your mental health, 
            track your wellness journey, and access personalized support resources.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="font-display text-3xl font-bold">Everything you need for wellness</h2>
          <p className="mt-4 text-muted-foreground">
            Comprehensive tools designed with students in mind
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <div className="rounded-2xl gradient-calm p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Ready to prioritize your mental wellness?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of students who are taking control of their mental health journey. 
            It's free, confidential, and designed just for you.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="mt-8">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4" />
            <span>MindfulU - Student Mental Health Platform</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md text-center md:text-right">
            This is a screening and self-help tool, not a diagnostic service. 
            Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
