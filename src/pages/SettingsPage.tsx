import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { LogOut, User, Moon, Sun, Save } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('age, gender')
      .eq('id', user!.id)
      .maybeSingle();

    if (data) {
      setAge(data.age?.toString() || '');
      setGender(data.gender || '');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        age: age ? parseInt(age) : null,
        gender: gender || null
      })
      .eq('id', user!.id);

    setSaving(false);

    if (error) {
      toast({ title: '오류가 발생했습니다.', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '프로필 저장 성공', description: '나이와 성별이 업데이트되었습니다.' });
    }
  };

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

        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">다크 모드</div>
              <div className="text-xs text-muted-foreground">앱 화면 테마 설정</div>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-primary' : 'bg-secondary-foreground/20'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Profile Settings */}
        <div className="rounded-2xl bg-card p-5 shadow-sm border border-border">
          <h2 className="text-sm font-semibold text-foreground mb-4">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">나이</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="예: 30"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">성별</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm transition-colors ${gender === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-secondary'}`}
                  >
                    {g === 'Male' ? '남성' : g === 'Female' ? '여성' : '기타'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full rounded-xl mt-2 flex items-center gap-2"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? '저장 중...' : '저장하기'}
            </Button>
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
