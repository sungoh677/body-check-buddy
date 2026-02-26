import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import AppLayout from '@/components/AppLayout';
import { getScoreLevel, CHECK_ITEMS } from '@/lib/bodycheck';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface DailyCheck {
  date: string;
  neck_shoulder: number;
  jaw: number;
  breath: number;
  eyes: number;
  energy: number;
  total_score: number;
}

export default function PatternsPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<DailyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('daily_checks')
      .select('date, neck_shoulder, jaw, breath, eyes, energy, total_score')
      .eq('user_id', user!.id)
      .gte('date', weekAgo)
      .order('date', { ascending: true });

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

  if (checks.length === 0) {
    return (
      <AppLayout>
        <h1 className="mb-4 text-lg font-semibold text-foreground">패턴</h1>
        <div className="rounded-lg bg-card p-8 text-center shadow-sm border border-border">
          <p className="text-muted-foreground">데이터가 부족합니다. 기록을 쌓아보세요!</p>
        </div>
      </AppLayout>
    );
  }

  // Chart data
  const chartData = checks.map((c) => ({
    date: format(new Date(c.date), 'M/d', { locale: ko }),
    score: c.total_score,
    level: getScoreLevel(c.total_score),
  }));

  const levelBarColors: Record<string, string> = {
    good: 'hsl(150, 50%, 45%)',
    mild: 'hsl(38, 70%, 55%)',
    moderate: 'hsl(20, 80%, 55%)',
    severe: 'hsl(0, 65%, 55%)',
  };

  // Average
  const avgScore = (checks.reduce((s, c) => s + c.total_score, 0) / checks.length).toFixed(1);

  // Most frequent "2" item
  const fieldKeys = ['neck_shoulder', 'jaw', 'breath', 'eyes', 'energy'] as const;
  const twoCounts = fieldKeys.map((key) => ({
    key,
    count: checks.filter((c) => c[key] === 2).length,
  }));
  const topItem = twoCounts.sort((a, b) => b.count - a.count)[0];
  const topItemInfo = CHECK_ITEMS[fieldKeys.indexOf(topItem.key)];

  const summaryLine = topItem.count > 0
    ? `최근 7일 동안 '${topItemInfo.label}' 신호가 가장 두드러집니다.`
    : '최근 7일 동안 특별한 긴장 패턴이 감지되지 않았습니다.';

  return (
    <AppLayout>
      <h1 className="mb-4 text-lg font-semibold text-foreground">패턴</h1>

      {/* Chart */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border mb-3 animate-fade-in">
        <h2 className="mb-3 text-sm font-medium text-card-foreground">최근 7일 추이</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={24} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={levelBarColors[entry.level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg bg-card p-4 shadow-sm border border-border text-center">
          <div className="text-2xl font-bold text-foreground">{avgScore}</div>
          <div className="text-xs text-muted-foreground">7일 평균</div>
        </div>
        <div className="rounded-lg bg-card p-4 shadow-sm border border-border text-center">
          <div className="text-2xl">{topItem.count > 0 ? topItemInfo.icon : '✨'}</div>
          <div className="text-xs text-muted-foreground">
            {topItem.count > 0 ? `${topItemInfo.label} (${topItem.count}회)` : '양호'}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border">
        <p className="text-sm text-card-foreground">{summaryLine}</p>
      </div>
    </AppLayout>
  );
}
