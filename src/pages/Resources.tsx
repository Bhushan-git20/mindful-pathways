import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/layout/AppHeader';
import { 
  ExternalLink, Phone, Heart, 
  BookOpen, Users, AlertTriangle, Shield, Sparkles 
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  external_url: string | null;
  is_emergency: boolean;
  risk_band_target: string[] | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  'Crisis Support': Phone,
  'Self-Help': Heart,
  'Educational': BookOpen,
  'Campus Resources': Users,
  'Coping Strategies': Sparkles,
  'Professional Help': Shield,
};

export default function Resources() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching resources:', error);
      } else {
        setResources(data || []);
      }
      setLoadingResources(false);
    };

    if (user) {
      fetchResources();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const emergencyResources = resources.filter((r) => r.is_emergency);
  const categories = [...new Set(resources.filter((r) => !r.is_emergency).map((r) => r.category))];
  const filteredResources =
    activeCategory === 'all'
      ? resources.filter((r) => !r.is_emergency)
      : resources.filter((r) => !r.is_emergency && r.category === activeCategory);

  // Default emergency resources if none in database
  const defaultEmergencyResources = [
    {
      id: 'crisis-1',
      title: '988 Suicide & Crisis Lifeline',
      description: 'Call or text 988 for immediate support',
      content: 'Available 24/7 for anyone in emotional distress or suicidal crisis.',
      category: 'Crisis Support',
      external_url: 'https://988lifeline.org',
      is_emergency: true,
      risk_band_target: null,
    },
    {
      id: 'crisis-2',
      title: 'Crisis Text Line',
      description: 'Text HOME to 741741',
      content: 'Free, 24/7 crisis support via text message.',
      category: 'Crisis Support',
      external_url: 'https://www.crisistextline.org',
      is_emergency: true,
      risk_band_target: null,
    },
    {
      id: 'crisis-3',
      title: 'NAMI Helpline',
      description: '1-800-950-NAMI (6264)',
      content: 'National Alliance on Mental Illness helpline for information and referrals.',
      category: 'Crisis Support',
      external_url: 'https://www.nami.org/help',
      is_emergency: true,
      risk_band_target: null,
    },
  ];

  const displayEmergencyResources = emergencyResources.length > 0 ? emergencyResources : defaultEmergencyResources;

  // Default helpful resources if none in database
  const defaultResources = [
    {
      id: 'self-1',
      title: 'Breathing Exercises',
      description: 'Simple techniques for immediate calm',
      content: 'Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3-4 times.',
      category: 'Coping Strategies',
      external_url: null,
      is_emergency: false,
      risk_band_target: null,
    },
    {
      id: 'self-2',
      title: 'Grounding Techniques',
      description: '5-4-3-2-1 sensory method',
      content: 'Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste.',
      category: 'Coping Strategies',
      external_url: null,
      is_emergency: false,
      risk_band_target: null,
    },
    {
      id: 'edu-1',
      title: 'Understanding Anxiety',
      description: 'Learn about anxiety and its effects',
      content: 'Anxiety is a normal response to stress. Learn to recognize symptoms and develop healthy coping strategies.',
      category: 'Educational',
      external_url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
      is_emergency: false,
      risk_band_target: null,
    },
    {
      id: 'edu-2',
      title: 'Understanding Depression',
      description: 'Learn about depression symptoms and treatment',
      content: 'Depression is more than feeling sad. It is a treatable condition that affects how you think, feel, and function.',
      category: 'Educational',
      external_url: 'https://www.nimh.nih.gov/health/topics/depression',
      is_emergency: false,
      risk_band_target: null,
    },
  ];

  const displayResources = filteredResources.length > 0 ? filteredResources : defaultResources.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );
  const displayCategories = categories.length > 0 ? categories : [...new Set(defaultResources.map((r) => r.category))];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-foreground">Mental Health Resources</h1>
          <p className="mt-2 text-muted-foreground">
            Curated resources to support your mental wellness journey
          </p>
        </div>

        {/* Emergency Resources Banner */}
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Crisis Resources - Available 24/7
            </CardTitle>
            <CardDescription>
              If you're in crisis or having thoughts of self-harm, please reach out immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {displayEmergencyResources.map((resource) => (
                <Card key={resource.id} className="border-destructive/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{resource.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                        {resource.external_url && (
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            Visit Website <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-6 flex-wrap h-auto gap-2">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            {displayCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory}>
            {loadingResources ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading resources...</div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayResources.map((resource) => {
                  const IconComponent = categoryIcons[resource.category] || BookOpen;
                  return (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {resource.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-3">{resource.title}</CardTitle>
                        {resource.description && (
                          <CardDescription>{resource.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {resource.content && (
                          <p className="text-sm text-muted-foreground mb-4">{resource.content}</p>
                        )}
                        {resource.external_url && (
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              Learn More
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-8 rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Note:</strong> These resources are for informational purposes only and do not
            replace professional mental health care. If you're experiencing a mental health crisis,
            please contact emergency services or a crisis helpline immediately.
          </p>
        </div>
      </main>
    </div>
  );
}
