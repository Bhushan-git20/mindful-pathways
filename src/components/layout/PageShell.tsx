import { ReactNode } from 'react';
import AppHeader from './AppHeader';

interface PageShellProps {
  children: ReactNode;
  /** Max width constraint: 'sm' = max-w-2xl, 'md' = max-w-3xl, 'lg' = max-w-4xl, 'xl' = max-w-6xl, 'full' = container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show AppHeader (default true) */
  showHeader?: boolean;
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
  className = ''
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background — subtle, organic, dark-mode aware */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        {/* Top-left warm wash */}
        <div className="absolute -top-[30%] -left-[15%] h-[70vh] w-[70vh] rounded-full bg-primary/[0.04] blur-[120px] dark:bg-primary/[0.06]" />
        {/* Bottom-right cool accent */}
        <div className="absolute -bottom-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-secondary/[0.05] blur-[100px] dark:bg-secondary/[0.07]" />
        {/* Center subtle grain overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.03),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.05),transparent)]" />
      </div>

      {showHeader && <AppHeader />}

      <main className={`container ${maxWidthMap[maxWidth]} py-10 px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
