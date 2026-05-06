import { useState, useEffect } from 'react';
import { Send, Heart, Info, AlertTriangle, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, subMinutes } from 'date-fns';
import PageShell from '@/components/layout/PageShell';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  tag?: string;
  isLiked?: boolean;
}

const SAMPLE_POSTS: Post[] = [
  { id: '1', author: 'Anonymous', content: 'Remember that it\'s okay to have bad days. Be gentle with yourself today. 💙', timestamp: subMinutes(new Date(), 15).toISOString(), likes: 24, tag: '#Support', isLiked: true },
  { id: '2', author: 'Anonymous', content: 'Just finished my first meditation in weeks! Feeling much lighter.', timestamp: subMinutes(new Date(), 45).toISOString(), likes: 12, tag: '#Wins', isLiked: false },
  { id: '3', author: 'Anonymous', content: 'Struggling a bit with anxiety today, but I am trying to focus on my breathing.', timestamp: subMinutes(new Date(), 120).toISOString(), likes: 45, tag: '#Struggles', isLiked: false },
];

const TAGS = ['#Wins', '#Struggles', '#Support', '#Gratitude'];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState(TAGS[0]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('mindmate_community');
      if (saved) {
        setPosts(JSON.parse(saved));
      } else {
        setPosts(SAMPLE_POSTS);
        localStorage.setItem('mindmate_community', JSON.stringify(SAMPLE_POSTS));
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    if (newPostContent.length < 5) {
      toast.error('Your message is too short.');
      return;
    }

    setIsPosting(true);

    try {
      // Hit moderation edge function
      const { data, error } = await supabase.functions.invoke('moderate-post', {
        body: { content: newPostContent }
      });

      if (error) throw error;

      if (!data.isSafe) {
        toast.error('Post Blocked', {
          description: data.reason || 'This post violates community guidelines.',
          duration: 8000,
        });
        setIsPosting(false);
        return;
      }

      // Safe to post
      const newPost: Post = {
        id: Math.random().toString(36).substring(7),
        author: 'Anonymous',
        content: newPostContent,
        timestamp: new Date().toISOString(),
        likes: 0,
        tag: selectedTag,
        isLiked: false
      };

      const updated = [newPost, ...posts];
      setPosts(updated);
      localStorage.setItem('mindmate_community', JSON.stringify(updated));
      setNewPostContent('');
      toast.success('Your message was shared safely! 🌟');
    } catch (err) {
      console.error('Moderation error:', err);
      toast.error('Failed to post. Please try again later.');
    } finally {
      setIsPosting(false);
    }
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
    <PageShell maxWidth="md">
      <div className="py-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Community Support</h1>
          <p className="text-muted-foreground text-lg">A safe, anonymous space to share and support each other.</p>
        </div>

        <Card className="border-transparent bg-card/60 backdrop-blur-md shadow-lg">
          <CardContent className="p-6 space-y-4">
            <Textarea 
              placeholder="Share a win, a struggle, or some words of support..." 
              className="min-h-[100px] resize-none bg-background border-muted"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={isPosting}
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {TAGS.map(t => (
                  <Badge 
                    key={t} 
                    variant={selectedTag === t ? 'default' : 'secondary'}
                    className="cursor-pointer transition-all px-3 py-1 text-sm font-normal"
                    onClick={() => setSelectedTag(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <Button onClick={handleCreatePost} disabled={isPosting || !newPostContent.trim()} className="gap-2 rounded-full px-6">
                {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between px-2">
          <h2 className="font-semibold text-lg">Recent Notes</h2>
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Filtered for safety</span>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
          ) : (
            <AnimatePresence>
              {posts.map(post => (
                <motion.div key={post.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-transparent bg-card shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            A
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{post.author}</p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(post.timestamp), 'MMM d, h:mm a')}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-muted/30 border-muted">
                          {post.tag}
                        </Badge>
                      </div>
                      
                      <p className="text-foreground/90 mb-6">{post.content}</p>
                      
                      <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-2">
                        <Button
                          variant="ghost" 
                          size="sm"
                          className={`gap-2 rounded-full ${post.isLiked ? 'text-rose-500 bg-rose-50' : 'text-muted-foreground'}`}
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes} {post.likes === 1 ? 'Hug' : 'Hugs'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 p-0 rounded-full" aria-label="Report">
                          <AlertTriangle className="h-4 w-4 opacity-50 hover:opacity-100" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageShell>
  );
}
