import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import AppHeader from './AppHeader';

interface PageShellProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: '',
};

export default function PageShell({ 
  children, 
  maxWidth = 'full', 
  showHeader = true,
  showFooter = true,
  className = ''
}: PageShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-[30%] -left-[15%] h-[70vh] w-[70vh] rounded-full bg-primary/[0.04] blur-[120px] dark:bg-primary/[0.06]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-secondary/[0.05] blur-[100px] dark:bg-secondary/[0.07]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.03),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.05),transparent)]" />
      </div>

      {showHeader && <AppHeader />}

      <main className={`container ${maxWidthMap[maxWidth]} py-10 px-4 sm:px-6 lg:px-8 flex-1 ${className}`}>
        {children}
      </main>

      {showFooter && (
        <footer className="border-t border-border/50 bg-card/40 backdrop-blur-sm mt-auto">
          <div className="container py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">MindMate</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Supporting student mental wellness through self-assessments, journaling, and guided resources.
                </p>
              </div>

              {/* Platform */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</h4>
                <nav className="flex flex-col gap-1.5">
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                  <Link to="/assessments" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Assessments</Link>
                  <Link to="/journal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Journal</Link>
                  <Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat Support</Link>
                </nav>
              </div>

              {/* Resources */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources</h4>
                <nav className="flex flex-col gap-1.5">
                  <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
                  <Link to="/trends" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Wellness Trends</Link>
                  <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Assessment History</Link>
                </nav>
              </div>

              {/* Account */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h4>
                <nav className="flex flex-col gap-1.5">
                  <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
                  <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
                  <Link to="/notifications" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Notifications</Link>
                </nav>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                © {currentYear} MindMate. Not a substitute for professional care.
              </p>
              <p className="text-xs text-muted-foreground">
                If in crisis, call <span className="font-medium text-foreground">988</span> or your campus counseling center.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
