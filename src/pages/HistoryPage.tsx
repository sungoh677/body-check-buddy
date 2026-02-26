import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import AppLayout from '@/components/AppLayout';
import { getScoreLevel, CHECK_ITEMS } from '@/lib/bodycheck';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, TrendingUp } from 'lucide-react';

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-64 items-center justify-center">
          <span className="text-muted-foreground">로딩 중...</span>
        </div>
      </AppLayout>
    );
  }

  // Summary KPIs
  const avgScore = checks.length > 0
    ? (checks.reduce((s, c) => s + c.total_score, 0) / checks.length).toFixed(1)
    : '-';
  const fieldKeys = ['neck_shoulder', 'jaw', 'breath', 'eyes', 'energy'] as const;
  const twoCounts = fieldKeys.map((key) => ({
    key,
    count: checks.filter((c) => c[key] === 2).length,
  }));
  const topItem = twoCounts.sort((a, b) => b.count - a.count)[0];
  const topInfo = topItem && topItem.count > 0 ? CHECK_ITEMS[fieldKeys.indexOf(topItem.key)] : null;

  const levelBg: Record<string, string> = {
    good: 'bg-score-good',
    mild: 'bg-score-mild',
    moderate: 'bg-score-moderate',
    severe: 'bg-score-severe',
  };

  // Detail view
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
        <button onClick={() => setSelectedCheck(null)} className="mb-4 flex items-center gap-1 text-sm text-primary touch-target">
          <ChevronLeft className="h-4 w-4" /> 목록으로
        </button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-5 shadow-sm border border-border"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              {format(new Date(selectedCheck.date), 'M월 d일 (EEE)', { locale: ko })}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold text-primary-foreground ${levelBg[getScoreLevel(selectedCheck.total_score)]}`}>
              {selectedCheck.total_score}/10
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {fields.map((field, i) => {
              const info = CHECK_ITEMS[i];
              const chipColors = ['text-score-good', 'text-score-mild', 'text-score-severe'];
              return (
                <div key={field.key} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                  <span className="text-sm text-foreground">{info.icon} {info.label}</span>
                  <span className={`text-sm font-semibold ${chipColors[field.value]}`}>
                    {info.options[field.value].label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-sm font-medium text-foreground">{selectedCheck.summary_text}</p>
            <p className="mt-1 text-sm text-muted-foreground">💡 {selectedCheck.reset_text}</p>
          </div>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">최근 기록</h1>
        <p className="text-sm text-muted-foreground mt-0.5">최근 7일</p>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border text-center">
          <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
          <div className="text-2xl font-bold text-foreground">{avgScore}</div>
          <div className="text-xs text-muted-foreground">7일 평균</div>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border text-center">
          <span className="text-2xl block mb-1">{topInfo ? topInfo.icon : '✨'}</span>
          <div className="text-xs text-muted-foreground">
            {topInfo ? `${topInfo.label} (${topItem.count}회)` : '양호'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">가장 높은 항목</div>
        </div>
      </div>

      {/* List */}
      {checks.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm border border-border">
          <p className="text-muted-foreground">아직 기록이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {checks.map((check, i) => {
            const level = getScoreLevel(check.total_score);
            return (
              <motion.button
                key={check.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedCheck(check)}
                className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm border border-border transition-colors hover:bg-muted touch-target"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground ${levelBg[level]}`}>
                  {check.total_score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {format(new Date(check.date), 'M월 d일 (EEE)', { locale: ko })}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{check.summary_text}</div>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
