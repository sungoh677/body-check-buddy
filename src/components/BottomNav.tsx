import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, ClipboardList, BarChart3, Settings, Shield } from 'lucide-react';

const navItems = [
  { path: '/', label: '오늘', icon: Activity },
  { path: '/history', label: '기록', icon: ClipboardList },
  { path: '/patterns', label: '패턴', icon: BarChart3 },
  { path: '/settings', label: '설정', icon: Settings },
];

export default function BottomNav() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const items = isAdmin
    ? [...navItems, { path: '/admin', label: '관리', icon: Shield }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg">
        {items.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors touch-target ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
