import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageShell from '@/components/layout/PageShell';
import { 
  ExternalLink, Phone, Heart, 
  BookOpen, Users, AlertTriangle, Shield, Sparkles, Music, Play, Search, X, Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';

import { toast } from 'sonner';

// Helper to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

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
  'crisis': Phone,
  'Self-Help': Heart,
  'self-help': Heart,
  'Educational': BookOpen,
  'education': BookOpen,
  'Campus Resources': Users,
  'Coping Strategies': Sparkles,
  'Professional Help': Shield,
  'professional': Shield,
  'Music & Relaxation': Music,
};

// Default emergency resources if none in database
const defaultEmergencyResources = [
  {
    id: 'crisis-1',
    title: 'iCall Psychosocial Helpline',
    description: 'Call 9152987821 for counselling support',
    content: 'Professional psychosocial support by TISS, Mumbai. Available Mon–Sat, 8 AM – 10 PM.',
    category: 'Crisis Support',
    external_url: 'https://icallhelpline.org/',
    is_emergency: true,
    risk_band_target: null,
  },
  {
    id: 'crisis-2',
    title: 'Vandrevala Foundation Helpline',
    description: 'Call 1860-2662-345 (24/7)',
    content: 'Free, 24/7 mental health support in multiple Indian languages.',
    category: 'Crisis Support',
    external_url: 'https://www.vandrevalafoundation.com/',
    is_emergency: true,
    risk_band_target: null,
  },
  {
    id: 'crisis-3',
    title: 'NIMHANS Helpline',
    description: 'Call 080-46110007',
    content: 'National Institute of Mental Health and Neurosciences helpline for mental health assistance.',
    category: 'Crisis Support',
    external_url: 'https://nimhans.ac.in/',
    is_emergency: true,
    risk_band_target: null,
  },
];

// Default helpful resources if none in database
const defaultResources = [
  {
    id: 'self-1',
    title: 'Breathing Exercises',
    description: 'Simple techniques for immediate calm',
    content: 'Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3-4 times.',
    category: 'Coping Strategies',
    external_url: 'https://www.healthline.com/health/breathing-exercises-for-anxiety',
    is_emergency: false,
    risk_band_target: null,
  },
  {
    id: 'self-2',
    title: 'Grounding Techniques',
    description: '5-4-3-2-1 sensory method',
    content: 'Name 5 things you see, 4 things you feel, 3 things you hear, 2 things you smell, and 1 thing you taste.',
    category: 'Coping Strategies',
    external_url: 'https://www.healthline.com/health/grounding-techniques',
    is_emergency: false,
    risk_band_target: null,
  },
  {
    id: 'music-1',
    title: 'Relaxing Piano Music',
    description: 'Calming piano melodies for stress relief',
    content: '3 hours of beautiful piano music to help you relax, study, or sleep peacefully.',
    category: 'Music & Relaxation',
    external_url: 'https://www.youtube.com/watch?v=77ZozI0rw7w',
    is_emergency: false,
    risk_band_target: null,
  },
  {
    id: 'edu-1',
    title: 'Understanding Anxiety',
    description: 'Learn about anxiety and its effects',
    content: 'Anxiety is a normal response to stress. Learn to recognize symptoms and develop healthy coping strategies.',
    category: 'Educational',
    external_url: 'https://nimhans.ac.in/patient-care/',
    is_emergency: false,
    risk_band_target: null,
  },
];

export default function Resources() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  
  // Read initial values from URL params
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Apply search filter
  const searchFilter = (resource: Resource) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      (resource.description?.toLowerCase().includes(query)) ||
      (resource.content?.toLowerCase().includes(query)) ||
      resource.category.toLowerCase().includes(query)
    );
  };
  
  // Load bookmarks
  useEffect(() => {
    const saved = localStorage.getItem('mindmate_bookmarks');
    if (saved) setBookmarkedIds(JSON.parse(saved));
  }, []);

  const toggleBookmark = (id: string) => {
    const updated = bookmarkedIds.includes(id) 
      ? bookmarkedIds.filter(bid => bid !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem('mindmate_bookmarks', JSON.stringify(updated));
    toast.success(bookmarkedIds.includes(id) ? 'Removed from bookmarks' : 'Added to bookmarks!');
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Sync URL params when category or search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params, { replace: true });
  }, [activeCategory, searchQuery, setSearchParams]);

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
  
  const allAvailableResources = resources.length > 0 ? resources.filter((r) => !r.is_emergency) : defaultResources;
  
  const filteredResources =
    activeCategory === 'all'
      ? allAvailableResources
      : allAvailableResources.filter((r) => r.category === activeCategory);

  const displayEmergencyResources = emergencyResources.length > 0 ? emergencyResources : defaultEmergencyResources;
  const displayResources = filteredResources.filter(searchFilter);
  const displayCategories = categories.length > 0 ? categories : [...new Set(defaultResources.map((r) => r.category))];

  const bookmarkedResources = allAvailableResources.filter(r => bookmarkedIds.includes(r.id));

  return (
    <PageShell>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Mental Health Resources</h1>
            <p className="mt-2 text-muted-foreground">
              Curated resources to support your mental wellness journey
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <Button 
                variant="outline" 
                className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                onClick={() => navigate('/breathing')}
              >
                <Sparkles className="h-4 w-4" />
                Try Breathing Exercise
              </Button>
          </div>
        </div>

        {/* Search & Saved Quick Access */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources by topic, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Heart className={`h-5 w-5 ${bookmarkedIds.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'}`} />
                 <span className="text-sm font-medium">{bookmarkedIds.length} Saved Items</span>
               </div>
               {bookmarkedIds.length > 0 && (
                 <Button variant="link" size="sm" onClick={() => setActiveCategory('Saved')} className="h-auto p-0">View all</Button>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Emergency Resources Banner */}
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Crisis Resources - Available 24/7
            </CardTitle>
            <CardDescription className="text-destructive/80">
              If you're in crisis or having thoughts of self-harm, please reach out immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {displayEmergencyResources.map((resource) => (
                <Card key={resource.id} className="border-destructive/20 hover:border-destructive/40 transition-colors bg-background/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm tracking-tight">{resource.title}</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>
                        {resource.external_url && (
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive hover:underline mt-2"
                          >
                            CALL NOW <ExternalLink className="h-3 w-3" />
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
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="bg-transparent h-auto gap-2 p-0">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border px-4 py-1.5"
              >
                All
              </TabsTrigger>
              {bookmarkedIds.length > 0 && (
                <TabsTrigger 
                  value="Saved" 
                  className="data-[state=active]:bg-rose-500 data-[state=active]:text-white rounded-full border px-4 py-1.5 gap-2"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" /> Saved
                </TabsTrigger>
              )}
              {displayCategories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full border px-4 py-1.5"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategory} className="mt-0">
            {loadingResources ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground font-medium">Loading library...</p>
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                activeCategory === 'Music & Relaxation' 
                  ? 'md:grid-cols-1 lg:grid-cols-2' 
                  : 'md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {(activeCategory === 'Saved' ? bookmarkedResources.filter(searchFilter) : displayResources).map((resource) => {
                  const IconComponent = categoryIcons[resource.category] || BookOpen;
                  const isMusic = resource.category === 'Music & Relaxation';
                  const videoId = isMusic ? getYouTubeVideoId(resource.external_url) : null;
                  const isBookmarked = bookmarkedIds.includes(resource.id);
                  
                  return (
                    <Card key={resource.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-muted flex flex-col h-full">
                      {/* Embedded YouTube Player for Music */}
                      {isMusic && videoId && (
                        <div className="aspect-video w-full bg-muted relative group">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={resource.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      
                      <CardHeader className="pb-2 relative">
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex gap-2">
                             <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-8 w-8 rounded-full ${isBookmarked ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-rose-500'}`}
                              onClick={() => toggleBookmark(resource.id)}
                            >
                               <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                              {resource.category}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-4 group-hover:text-primary transition-colors">{resource.title}</CardTitle>
                        {resource.description && (
                          <CardDescription className="line-clamp-2 text-xs">{resource.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="flex-grow pt-0">
                        {resource.content && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">{resource.content}</p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 pb-6">
                        {resource.external_url && !isMusic && (
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button variant="outline" size="sm" className="w-full rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              Read Article
                              <ExternalLink className="h-3.5 w-3.5 ml-2" />
                            </Button>
                          </a>
                        )}
                        {resource.external_url && isMusic && (
                          <a
                            href={resource.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button variant="outline" size="sm" className="w-full rounded-full group-hover:bg-red-500 group-hover:text-white transition-all group-hover:border-red-500">
                              <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                              Watch on YouTube
                            </Button>
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {!loadingResources && activeCategory === 'Saved' && bookmarkedResources.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <Heart className="h-16 w-16 text-muted-foreground/20 mb-4" />
                 <h3 className="text-xl font-bold">No saved items yet</h3>
                 <p className="text-muted-foreground max-w-xs mt-2">
                   Click the heart icon on any resource to save it here for quick access later.
                 </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-12 rounded-2xl border bg-muted/30 p-6 flex items-start gap-4">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> The resources provided on MindMate are for educational and self-help purposes only. 
            They are not intended to be a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions you may have 
            regarding a medical condition. Never disregard professional medical advice or delay in seeking it 
            because of something you have read on this platform.
          </p>
        </div>
    </PageShell>
  );
}
