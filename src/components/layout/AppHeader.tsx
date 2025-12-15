import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, User, Shield, Settings, Home, ClipboardList, BookOpen, MessageCircle, TrendingUp, Library } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/assessments', label: 'Assessments', icon: ClipboardList },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
  { href: '/resources', label: 'Resources', icon: Library },
];

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      const { data: adminData } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      const { data: counselorData } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'counselor',
      });
      setIsAdmin(adminData === true || counselorData === true);
    };

    checkAdmin();
  }, [user]);

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold font-display">MindfulU</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.href)}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="hidden sm:flex"
            >
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
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Profile Settings
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
      <div className="md:hidden border-t overflow-x-auto">
        <nav className="container flex items-center gap-1 py-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.href)}
              className="flex-shrink-0"
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
