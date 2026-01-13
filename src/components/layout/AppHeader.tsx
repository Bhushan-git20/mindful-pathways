import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, User, Shield, Settings, Home, ClipboardList, BookOpen, MessageCircle, TrendingUp, Library, History, Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/assessments', label: 'Self-Assessment', icon: ClipboardList },
  { href: '/trends', label: 'Insights', icon: TrendingUp },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/resources', label: 'Resources', icon: Library },
  { href: '/chat', label: 'Chatbot', icon: MessageCircle },
  { href: '/history', label: 'History', icon: History },
];
export default function AppHeader() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const {
        data: adminData
      } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      const {
        data: counselorData
      } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'counselor'
      });
      setIsAdmin(adminData === true || counselorData === true);
    };
    checkAdmin();
  }, [user]);
  return <header className="border-b bg-gradient-to-r from-card via-card to-primary/5 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MindMate</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => <Button key={item.href} variant={location.pathname === item.href ? 'default' : 'ghost'} size="sm" onClick={() => navigate(item.href)} className={`gap-2 ${location.pathname === item.href ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-primary/10'}`}>
              <item.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>)}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {isAdmin && <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="hidden sm:flex">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/notifications')}>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')} className="sm:hidden">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gradient-to-r from-muted/30 to-primary/5 overflow-x-auto">
        <nav className="container flex items-center gap-1 py-2">
          {navItems.map(item => <Button key={item.href} variant={location.pathname === item.href ? 'default' : 'ghost'} size="sm" onClick={() => navigate(item.href)} className={`flex-shrink-0 ${location.pathname === item.href ? 'bg-primary text-primary-foreground' : ''}`}>
              <item.icon className="h-4 w-4" />
            </Button>)}
        </nav>
      </div>
    </header>;
}