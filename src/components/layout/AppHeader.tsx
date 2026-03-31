import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, User, Shield, Settings, Home, ClipboardList, BookOpen, MessageCircle, TrendingUp, Library, History, Bell, Sun, Moon, Target, Users, Wind } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/habits', label: 'Habits', icon: Target },
  { href: '/resources', label: 'Library', icon: Library },
  { href: '/breathing', label: 'Breathe', icon: Wind },
  { href: '/chat', label: 'AI Chat', icon: MessageCircle },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
  { href: '/assessments', label: 'Tests', icon: ClipboardList },
];

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data: adminData } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      const { data: counselorData } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'counselor'
      });
      setIsAdmin(adminData === true || counselorData === true);
    };
    checkAdmin();
  }, [user]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
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
          {navItems.map(item => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.href)}
              className={`gap-2 ${location.pathname === item.href ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-primary/10'}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/notifications')}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="hidden sm:flex">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
          
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
                {unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-destructive text-destructive-foreground rounded-full px-1.5">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="sm:hidden">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
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
      <div className="md:hidden border-t bg-card/50 overflow-x-auto">
        <nav className="container flex items-center gap-1 py-2">
          {navItems.map(item => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.href)}
              className={`flex-shrink-0 ${location.pathname === item.href ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
