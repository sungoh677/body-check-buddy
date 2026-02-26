import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import AppLayout from '@/components/AppLayout';
import { getScoreLevel, CHECK_ITEMS } from '@/lib/bodycheck';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

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
  const [thisWeek, setThisWeek] = useState<DailyCheck[]>([]);
  const [lastWeek, setLastWeek] = useState<DailyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const now = new Date();
    const weekAgo = format(subDays(now, 7), 'yyyy-MM-dd');
    const twoWeeksAgo = format(subDays(now, 14), 'yyyy-MM-dd');

    const [thisRes, lastRes] = await Promise.all([
      supabase
        .from('daily_checks')
        .select('date, neck_shoulder, jaw, breath, eyes, energy, total_score')
        .eq('user_id', user!.id)
        .gte('date', weekAgo)
        .order('date', { ascending: true }),
      supabase
        .from('daily_checks')
        .select('date, neck_shoulder, jaw, breath, eyes, energy, total_score')
        .eq('user_id', user!.id)
        .gte('date', twoWeeksAgo)
        .lt('date', weekAgo)
        .order('date', { ascending: true }),
    ]);

    setThisWeek(thisRes.data ?? []);
    setLastWeek(lastRes.data ?? []);
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

  if (thisWeek.length === 0) {
    return (
      <AppLayout>
        <h1 className="mb-4 text-xl font-bold text-foreground">패턴</h1>
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm border border-border">
          <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">데이터가 부족합니다. 기록을 쌓아보세요!</p>
        </div>
      </AppLayout>
    );
  }

  // KPIs
  const avg = (thisWeek.reduce((s, c) => s + c.total_score, 0) / thisWeek.length).toFixed(1);
  const maxScore = Math.max(...thisWeek.map(c => c.total_score));
  const minScore = Math.min(...thisWeek.map(c => c.total_score));
  const lastAvg = lastWeek.length > 0
    ? (lastWeek.reduce((s, c) => s + c.total_score, 0) / lastWeek.length).toFixed(1)
    : null;

  // Chart data
  const chartData = thisWeek.map(c => ({
    date: format(new Date(c.date), 'M/d', { locale: ko }),
    score: c.total_score,
  }));

  // Item frequency for score=2
  const fieldKeys = ['neck_shoulder', 'jaw', 'breath', 'eyes', 'energy'] as const;
  const itemFreq = fieldKeys.map((key, i) => ({
    name: CHECK_ITEMS[i].label,
    icon: CHECK_ITEMS[i].icon,
    count: thisWeek.filter(c => c[key] === 2).length,
  }));

  const topItem = [...itemFreq].sort((a, b) => b.count - a.count)[0];
  const summaryLine = topItem.count > 0
    ? `최근 7일 동안 '${topItem.name}' 신호가 가장 두드러집니다.`
    : '최근 7일 동안 특별한 긴장 패턴이 감지되지 않았습니다.';

  // Comparison
  const diff = lastAvg ? (parseFloat(avg) - parseFloat(lastAvg)).toFixed(1) : null;

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">패턴</h1>
        <p className="text-sm text-muted-foreground mt-0.5">최근 7일 분석</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: '주간 평균', value: avg },
          { label: '최고점', value: maxScore.toString() },
          { label: '최저점', value: minScore.toString() },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-card p-3 shadow-sm border border-border text-center"
          >
            <div className="text-xl font-bold text-foreground">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-card p-4 shadow-sm border border-border mb-4"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">7일 추이</h2>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={24} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Item frequency bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-card p-4 shadow-sm border border-border mb-4"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">항목별 높음(2) 빈도</h2>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={itemFreq} barCategoryGap="25%">
            <XAxis dataKey="icon" tick={{ fontSize: 16 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={20} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Comparison card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl bg-card p-4 shadow-sm border border-border mb-4"
      >
        <h2 className="text-sm font-semibold text-foreground mb-2">이번 주 vs 지난 주</h2>
        {lastAvg ? (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">이번 주</div>
              <div className="text-lg font-bold text-foreground">{avg}</div>
            </div>
            <div className="flex items-center gap-1">
              {parseFloat(diff!) > 0 ? (
                <TrendingUp className="h-5 w-5 text-score-severe" />
              ) : parseFloat(diff!) < 0 ? (
                <TrendingDown className="h-5 w-5 text-score-good" />
              ) : (
                <Minus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={`text-sm font-bold ${
                parseFloat(diff!) > 0 ? 'text-score-severe' : parseFloat(diff!) < 0 ? 'text-score-good' : 'text-muted-foreground'
              }`}>
                {parseFloat(diff!) > 0 ? '+' : ''}{diff}
              </span>
            </div>
            <div className="flex-1 text-right">
              <div className="text-xs text-muted-foreground">지난 주</div>
              <div className="text-lg font-bold text-foreground">{lastAvg}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">다음 주부터 비교가 제공됩니다.</p>
        )}
      </motion.div>

      {/* Summary */}
      <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
        <p className="text-sm text-foreground">{summaryLine}</p>
      </div>
    </AppLayout>
  );
}
