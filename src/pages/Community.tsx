import { useState, useEffect } from 'react';
import { Send, User, MessageCircle, Heart, Shield, Info, AlertTriangle, Filter, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format, subMinutes } from 'date-fns';
import PageShell from '@/components/layout/PageShell';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  mood?: string;
  isLiked?: boolean;
}

const SAMPLE_POSTS: Post[] = [
  { id: '1', author: 'Anonymous Owl', content: 'Remember that it\'s okay to have bad days. Be gentle with yourself today. 💙', timestamp: subMinutes(new Date(), 15).toISOString(), likes: 24, mood: 'Empathy', isLiked: true },
  { id: '2', author: 'Calm River', content: 'Just finished my first meditation in weeks! Feeling much lighter.', timestamp: subMinutes(new Date(), 45).toISOString(), likes: 12, mood: 'Progress', isLiked: false },
  { id: '3', author: 'Kind Soul', content: 'You are enough. Exactly as you are. Don\'t let anyone tell you otherwise.', timestamp: subMinutes(new Date(), 120).toISOString(), likes: 45, mood: 'Support', isLiked: false },
];

const MOOD_TYPES = ['Gratitude', 'Progress', 'Support', 'Empathy', 'Motivation', 'Zen'];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOOD_TYPES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data with cleanup
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('mindmate_community');
        if (saved) {
          setPosts(JSON.parse(saved));
        } else {
          setPosts(SAMPLE_POSTS);
          localStorage.setItem('mindmate_community', JSON.stringify(SAMPLE_POSTS));
        }
      } catch (error) {
        console.error("Failed to parse community posts:", error);
        setPosts(SAMPLE_POSTS);
        localStorage.setItem('mindmate_community', JSON.stringify(SAMPLE_POSTS));
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleReport = () => {
    toast.info("Reporting feature coming soon. Our moderators are currently monitoring the feed manually.");
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    if (newPostContent.length < 10) {
      toast.error('Post content is too short!');
      return;
    }

    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      author: 'Anonymous Student',
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      mood: selectedMood,
      isLiked: false
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('mindmate_community', JSON.stringify(updated));
    setNewPostContent('');
    toast.success('Your message of support was shared! 🌟');
  };

  const toggleLike = (id: string) => {
    const updated = posts.map(post => {
      if (post.id === id) {
        return { 
          ...post, 
          isLiked: !post.isLiked, 
          likes: post.isLiked ? post.likes - 1 : post.likes + 1 
        };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem('mindmate_community', JSON.stringify(updated));
  };

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Community Support</h1>
            <p className="text-muted-foreground mt-1">Anonymous messages of kindness and solidarity</p>
          </div>
          <div className="hidden md:flex gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 px-3 py-1">
              <Shield className="h-3 w-3" /> Anonymous
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            <Card className="border-primary/20 shadow-sm bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Share Support
                </CardTitle>
                <CardDescription>Only messages of encouragement and kindness are allowed here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Write something kind to brighten someone's day..." 
                  className="min-h-[120px] bg-background border-primary/10 transition-all focus:border-primary/50"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {MOOD_TYPES.map(m => (
                      <Badge 
                        key={m} 
                        className={`cursor-pointer transition-all hover:scale-110 ${
                          selectedMood === m ? 'bg-primary' : 'bg-muted text-muted-foreground'
                        }`}
                        onClick={() => setSelectedMood(m)}
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                  <Button onClick={handleCreatePost} className="gap-2 px-8 rounded-full">
                    <Send className="h-4 w-4" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" /> Recent Messages
                </h3>
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  <Filter className="h-3 w-3" /> Latest
                </Button>
              </div>

              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-muted/30"></CardHeader>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Be the first to share some kindness!</p>
                </div>
              ) : (
                posts.map(post => (
                  <Card key={post.id} className="transition-all hover:shadow-md border-muted">
                    <CardHeader className="pb-2 pt-4 px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{post.author}</p>
                            <p className="text-[10px] text-muted-foreground uppercase opacity-70">
                              {format(new Date(post.timestamp), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        {post.mood && (
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                            <Sparkles className="h-3 w-3 mr-1" /> {post.mood}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 py-4">
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </CardContent>
                    <CardFooter className="px-6 py-3 bg-muted/5 flex justify-between">
                      <div className="flex gap-4">
                        <button 
                          className={`flex items-center gap-1.5 transition-all text-sm font-medium ${
                            post.isLiked ? 'text-rose-500 scale-110' : 'text-muted-foreground hover:text-rose-500'
                          }`}
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </button>
                      </div>
                      <div 
                        role="button"
                        tabIndex={0}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                        onClick={handleReport}
                        onKeyDown={(e) => e.key === 'Enter' && handleReport()}
                        aria-label="Report post"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-[10px] font-medium uppercase tracking-tight">Report</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Guidelines Sidebar Column */}
          <div className="space-y-6">
            <Card className="border-amber-200/50 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader className="p-4">
                <CardTitle className="text-md flex items-center gap-2 text-amber-700 dark:text-amber-500">
                  <Shield className="h-4 w-4" /> Community Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm space-y-3 text-amber-800/80 dark:text-amber-400/80">
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p>Keep it kind, respectful, and supportive.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p>Do not share personal identifying information (PII).</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p>Hate speech, spam, and trolling are strictly prohibited.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p>This is not a space for clinical diagnosis or emergency help.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-md flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> About Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your identity is protected. We display "Anonymous Student" or an alias to ensure you can express yourself freely without judgment.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg border border-dashed text-[10px] text-muted-foreground uppercase font-bold text-center">
                  Private & Secure Platform
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
