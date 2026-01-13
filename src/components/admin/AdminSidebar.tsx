import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, LayoutDashboard, BarChart3, Users, Library, AlertTriangle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'resources', label: 'Resource Library', icon: Library },
  { id: 'alerts', label: 'Alerts & Flags', icon: AlertTriangle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => navigate('/dashboard')}
        >
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-semibold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MindMate</span>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 h-11',
              activeSection === item.id && 'bg-primary/10 text-primary font-medium'
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => navigate('/dashboard')}
        >
          ← Back to App
        </Button>
      </div>
    </aside>
  );
}
