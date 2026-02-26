import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import AppLayout from '@/components/AppLayout';
import { getScoreLevel, CHECK_ITEMS } from '@/lib/bodycheck';

interface DailyCheck {
  id: string;
  date: string;
  neck_shoulder: number;
  jaw: number;
  breath: number;
  eyes: number;
  energy: number;
  total_score: number;
  summary_text: string;
  reset_text: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState<DailyCheck | null>(null);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('daily_checks')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', weekAgo)
      .order('date', { ascending: false });

    setChecks(data ?? []);
    setLoading(false);
  };

  const levelColors = {
    good: 'bg-score-good',
    mild: 'bg-score-mild',
    moderate: 'bg-score-moderate',
    severe: 'bg-score-severe',
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <span className="text-muted-foreground">로딩 중...</span>
        </div>
      </AppLayout>
    );
  }

  if (selectedCheck) {
    const fields = [
      { key: 'neck_shoulder', value: selectedCheck.neck_shoulder },
      { key: 'jaw', value: selectedCheck.jaw },
      { key: 'breath', value: selectedCheck.breath },
      { key: 'eyes', value: selectedCheck.eyes },
      { key: 'energy', value: selectedCheck.energy },
    ];

    return (
      <AppLayout>
        <button
          onClick={() => setSelectedCheck(null)}
          className="mb-4 text-sm text-primary hover:underline"
        >
          ← 목록으로
        </button>

        <div className="rounded-lg bg-card p-4 shadow-sm border border-border animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-card-foreground">
              {format(new Date(selectedCheck.date), 'M월 d일 (EEE)', { locale: ko })}
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {selectedCheck.total_score}/10
            </span>
          </div>

          <div className="space-y-2">
            {fields.map((field, i) => {
              const item = CHECK_ITEMS[i];
              const option = item.options[field.value];
              return (
                <div key={field.key} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <span className="text-sm text-foreground">
                    {item.icon} {item.label}
                  </span>
                  <span className={`text-sm font-medium ${
                    field.value === 0 ? 'text-score-good' : field.value === 1 ? 'text-score-mild' : 'text-score-severe'
                  }`}>
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <p className="text-sm font-medium text-card-foreground">{selectedCheck.summary_text}</p>
            <p className="mt-1 text-sm text-muted-foreground">💡 {selectedCheck.reset_text}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="mb-4 text-lg font-semibold text-foreground">최근 기록</h1>

      {checks.length === 0 ? (
        <div className="rounded-lg bg-card p-8 text-center shadow-sm border border-border">
          <p className="text-muted-foreground">아직 기록이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {checks.map((check) => {
            const level = getScoreLevel(check.total_score);
            return (
              <button
                key={check.id}
                onClick={() => setSelectedCheck(check)}
                className="flex w-full items-center gap-3 rounded-lg bg-card p-4 text-left shadow-sm border border-border transition-colors hover:bg-muted touch-target"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground ${levelColors[level]}`}>
                  {check.total_score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-card-foreground">
                    {format(new Date(check.date), 'M월 d일 (EEE)', { locale: ko })}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {check.summary_text}
                  </div>
                </div>
                <span className="text-muted-foreground">›</span>
              </button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
