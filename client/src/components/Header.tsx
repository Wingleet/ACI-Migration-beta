import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  GitBranch, 
  AlertTriangle,
  Network,
} from 'lucide-react';

const navItems = [
  { 
    path: '/', 
    label: 'Gantt', 
    icon: BarChart3,
    description: 'Planning'
  },
  { 
    path: '/process', 
    label: 'Process', 
    icon: GitBranch,
    description: 'Workflows'
  },
  { 
    path: '/risk', 
    label: 'Risk', 
    icon: AlertTriangle,
    description: 'Management'
  },
  { 
    path: '/organigrame', 
    label: 'Organigramme', 
    icon: Network,
    description: 'Structure'
  },
];

export const Header: React.FC = () => {
  const [location] = useLocation();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/80 backdrop-blur-sm shrink-0 relative z-20">
      {/* Navigation */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-accent",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Project Title */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <h1 className="text-lg font-semibold tracking-tight">AMOS Migration Project</h1>
      </div>

      {/* Logo */}
      <img 
        src="/images/image.png" 
        alt="Logo" 
        className="h-10 object-contain"
      />
    </header>
  );
};
