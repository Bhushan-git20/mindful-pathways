import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowRight, TrendingUp, Library, MessageCircle, Sparkles, BookOpen, Shield, Sun, Moon } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
      gradient: 'from-primary to-primary/70',
    },
    {
      icon: Library,
      title: 'Supportive Resources',
      description: 'Access articles, videos, and campus services tailored to your needs.',
      link: '/resources',
      gradient: 'from-secondary to-secondary/70',
    },
    {
      icon: MessageCircle,
      title: 'Chatbot Support',
      description: 'Speak with an AI-powered support bot anytime for guidance and coping strategies.',
      link: '/chat',
      gradient: 'from-info to-info/70',
    },
  ];

  const exploreLinks = [
    { title: 'Mindfulness Techniques', href: '/resources' },
    { title: 'Improving Focus', href: '/resources' },
    { title: 'Managing Stress', href: '/resources' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="container py-6 animate-fade-in-down">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-110">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MindMate</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Link to="/auth">
              <Button variant="ghost" className="hover:bg-primary/10">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-md hover:shadow-lg">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section - Welcome Banner */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in-up opacity-0 stagger-1">
            <Sparkles className="h-4 w-4 animate-pulse-gentle" />
            Your mental wellness companion
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up opacity-0 stagger-2">
            Welcome to <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">MindMate</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl animate-fade-in-up opacity-0 stagger-3">
            Enhance your mental well-being with personalized insights, AI-powered support, and evidence-based tools designed for students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0 stagger-4">
            <Link to="/auth">
              <Button size="lg" className="px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                Start Self-Assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="px-8 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card, index) => (
            <Card 
              key={card.title} 
              className={`group cursor-pointer overflow-hidden card-interactive animate-fade-in-up opacity-0`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              onClick={() => navigate('/auth')}
            >
              <CardHeader>
                <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <card.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{card.title}</CardTitle>
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
          {exploreLinks.map((link, index) => (
            <Link key={link.title} to="/auth">
              <Button 
                variant="outline" 
                className="gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Sparkles className="h-4 w-4 transition-transform hover:rotate-12" />
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
            <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Everything you need for wellness</h2>
            <p className="mt-4 text-muted-foreground">
              Comprehensive tools designed with students in mind
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4 p-6 rounded-xl border bg-card card-interactive group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Personal Journal</h3>
                <p className="text-sm text-muted-foreground">
                  Reflect on your day with AI-assisted mood tagging and insights.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border bg-card card-interactive group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-teal">
                  <TrendingUp className="h-5 w-5 text-secondary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-secondary transition-colors">Wellness Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your mental health journey with visual dashboards.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border bg-card card-interactive group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-info to-info/70 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110">
                  <Brain className="h-5 w-5 text-info-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-info transition-colors">Validated Assessments</h3>
                <p className="text-sm text-muted-foreground">
                  PHQ-9 and GAD-7 questionnaires with research-backed scoring.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 rounded-xl border bg-card card-interactive group">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110">
                  <Shield className="h-5 w-5 text-success-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-success transition-colors">Private & Secure</h3>
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
        <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 md:p-12 text-center text-primary-foreground shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Ready to prioritize your mental wellness?
            </h2>
            <p className="mt-4 text-primary-foreground/90 max-w-xl mx-auto">
              Join thousands of students who are taking control of their mental health journey. 
              It's free, confidential, and designed just for you.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="mt-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
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
