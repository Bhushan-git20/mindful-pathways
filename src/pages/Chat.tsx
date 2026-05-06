import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PageShell from '@/components/layout/PageShell';
import { Send, Paperclip, Smile } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm MindMate, your AI companion. I'm here to listen, support, and help you navigate your thoughts. How are you feeling right now?",
      created_at: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, created_at: new Date().toISOString() }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message: userMessage,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message, 
        created_at: new Date().toISOString() 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Let's take a deep breath and try again in a moment.", 
        created_at: new Date().toISOString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell maxWidth="full" hideHeader>
      <div className="h-screen flex flex-col relative w-full pt-16 md:pt-0">
        {/* Header */}
        <header className="sticky top-0 w-full flex justify-between items-center px-6 py-4 bg-white/5 dark:bg-zinc-900/30 backdrop-blur-xl border-b border-white/10 z-40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 p-[2px] shadow-lg shadow-sky-500/20">
                <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full shadow-sm"></div>
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-primary">MindMate AI</h2>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Always here for you
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 glass-card rounded-full text-zinc-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Chat Canvas */}
        <section className="flex-grow overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <div className="flex justify-center">
              <span className="px-4 py-1 glass-card rounded-full text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Today</span>
            </div>

            {messages.map((msg, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index} 
                className={`flex gap-4 items-end ${msg.role === 'user' ? 'justify-end ml-auto max-w-[85%]' : 'max-w-[85%]'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                )}
                
                <div className={`p-5 text-base ${msg.role === 'user' ? 'clay-pill-user rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl text-white shadow-lg shadow-sky-900/40' : 'clay-pill-ai rounded-tr-3xl rounded-tl-3xl rounded-br-3xl text-foreground border-l-2 border-primary/30'}`}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/20 bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-4 items-end max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 border border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div className="clay-pill-ai p-5 rounded-tr-3xl rounded-tl-3xl rounded-br-3xl flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </section>

        {/* Message Input */}
        <footer className="p-6 bg-gradient-to-t from-background to-transparent shrink-0">
          <div className="max-w-3xl mx-auto relative group">
            <div className="clay-inset-input rounded-full px-6 py-4 flex items-center gap-4 border border-white/5 transition-all focus-within:ring-2 focus-within:ring-primary/30">
              <button className="p-2 text-zinc-500 hover:text-primary transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input 
                className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 outline-none" 
                placeholder="Share your thoughts with MindMate..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <div className="flex items-center gap-2">
                <button className="p-2 text-zinc-500 hover:text-primary transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button onClick={handleSend} disabled={!input.trim() || isLoading} className="clay-button-primary p-3 rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="absolute -inset-2 bg-primary/5 blur-2xl rounded-full -z-10 group-focus-within:bg-primary/10 transition-colors"></div>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-4 font-bold tracking-widest uppercase">MindMate can provide support but is not a medical professional.</p>
        </footer>
      </div>
    </PageShell>
  );
}
