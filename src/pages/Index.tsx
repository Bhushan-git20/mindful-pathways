import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowRight, TrendingUp, Library, MessageCircle, Sparkles, BookOpen, Shield } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const featureCards = [
    {
      icon: TrendingUp,
      title: 'Personalized Insights',
      description: 'Unique insights into your mental health trends, risk levels, and wellness patterns over time.',
      link: '/insights',
    },
    {
      icon: Library,
      title: 'Supportive Resources',
      description: 'Access articles, videos, and campus services tailored to your needs.',
      link: '/resources',
    },
    {
      icon: MessageCircle,
      title: 'Chatbot Support',
      description: 'Speak with an AI-powered support bot anytime for guidance and coping strategies.',
      link: '/chat',
    },
  ];

  const exploreLinks = [
    { title: 'Mindfulness Techniques', href: '/resources' },
    { title: 'Improving Focus', href: '/resources' },
    { title: 'Managing Stress', href: '/resources' },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold font-display">MindMate</span>
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

      {/* Hero Section - Welcome Banner */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">MindMate</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Enhance your mental well-being with personalized insights and support.
          </p>
          <div className="mt-10">
            <Link to="/auth">
              <Button size="lg" className="px-8">
                Start Self-Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <Card 
              key={card.title} 
              className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
              onClick={() => navigate('/auth')}
            >
              <CardHeader>
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Explore More Section */}
      <section className="container py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-bold">Explore More</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {exploreLinks.map((link) => (
            <Link key={link.title} to="/auth">
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {link.title}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold">Everything you need for wellness</h2>
            <p className="mt-4 text-muted-foreground">
              Comprehensive tools designed with students in mind
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4 p-6 rounded-xl border bg-card">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Personal Journal</h3>
                <p className="text-sm text-muted-foreground">
                  Reflect on your day with AI-assisted mood tagging and insights.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border bg-card">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Wellness Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your mental health journey with visual dashboards.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border bg-card">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Validated Assessments</h3>
                <p className="text-sm text-muted-foreground">
                  PHQ-9 and GAD-7 questionnaires with research-backed scoring.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border bg-card">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and confidential. You control everything.
                </p>
              </div>
            </div>
          </div>
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
            <span>© 2025 MindMate. All rights reserved.</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md text-center md:text-right">
            MindMate is not an emergency service. If you're in crisis, please contact your local emergency services or crisis hotline.
          </p>
        </div>
      </footer>
    </div>
  );
}
