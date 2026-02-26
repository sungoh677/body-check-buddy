import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AppLayout>
      <h1 className="mb-4 text-lg font-semibold text-foreground">설정</h1>

      <div className="space-y-3">
        <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
          <div className="text-xs text-muted-foreground">계정</div>
          <div className="mt-1 text-sm font-medium text-card-foreground">{user?.email}</div>
        </div>

        <Button
          variant="outline"
          className="w-full touch-target"
          onClick={handleSignOut}
        >
          로그아웃
        </Button>
      </div>
    </AppLayout>
  );
}
