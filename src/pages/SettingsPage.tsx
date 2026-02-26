import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">설정</h1>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">계정</div>
            <div className="text-sm font-medium text-foreground">{user?.email}</div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full touch-target rounded-2xl gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" /> 로그아웃
        </Button>
      </div>
    </AppLayout>
  );
}
