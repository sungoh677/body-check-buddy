import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateTotalScore, getSummaryText, getResetText, getScoreLevel, getAiCoachingMessage, CHECK_ITEMS, CheckData } from '@/lib/bodycheck';
import AppLayout from '@/components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Edit3 } from 'lucide-react';

interface DailyCheck {
  id: string;
  neck_shoulder: number;
  jaw: number;
  breath: number;
  eyes: number;
  energy: number;
  total_score: number;
  summary_text: string;
  reset_text: string;
}

export default function TodayPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayCheck, setTodayCheck] = useState<DailyCheck | null>(null);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) fetchToday();
  }, [user]);

  const fetchToday = async () => {
    const { data } = await supabase
      .from('daily_checks')
      .select('*')
      .eq('user_id', user!.id)
      .eq('date', today)
      .maybeSingle();
    setTodayCheck(data);
    setLoading(false);
  };

  const startCheck = () => navigate('/check');
  const editCheck = () => {
    if (!todayCheck) return;
    navigate('/check', {
      state: {
        initialValues: {
          neckShoulder: todayCheck.neck_shoulder,
          jaw: todayCheck.jaw,
          breath: todayCheck.breath,
          eyes: todayCheck.eyes,
          energy: todayCheck.energy,
        },
        existingId: todayCheck.id,
      },
    });
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

  const levelLabel: Record<string, string> = {
    good: '안정',
    mild: '경미',
    moderate: '주의',
    severe: '높음',
  };

  const levelRingColor: Record<string, string> = {
    good: 'text-score-good',
    mild: 'text-score-mild',
    moderate: 'text-score-moderate',
    severe: 'text-score-severe',
  };

  // No check today
  if (!todayCheck) {
    return (
      <AppLayout>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">{format(new Date(), 'M월 d일 (EEEE)', { locale: ko })}</p>
          <h1 className="text-xl font-bold text-foreground mt-1">오늘의 신체 신호</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-8 shadow-sm border border-border text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">아직 기록이 없어요</h2>
          <p className="text-sm text-muted-foreground mb-6">20초면 충분합니다. 지금 체크해보세요.</p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startCheck}
            className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-md touch-target"
          >
            20초 점검 시작
          </motion.button>
        </motion.div>
      </AppLayout>
    );
  }

  // Has today's check
  const level = getScoreLevel(todayCheck.total_score);
  const fields = [
    { key: 'neck_shoulder', value: todayCheck.neck_shoulder },
    { key: 'jaw', value: todayCheck.jaw },
    { key: 'breath', value: todayCheck.breath },
    { key: 'eyes', value: todayCheck.eyes },
    { key: 'energy', value: todayCheck.energy },
  ];

  const chipColors = ['text-score-good', 'text-score-mild', 'text-score-severe'];

  const aiMessage = getAiCoachingMessage({
    neckShoulder: todayCheck.neck_shoulder,
    jaw: todayCheck.jaw,
    breath: todayCheck.breath,
    eyes: todayCheck.eyes,
    energy: todayCheck.energy
  });

  return (
    <AppLayout>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">{format(new Date(), 'M월 d일 (EEEE)', { locale: ko })}</p>
        <h1 className="text-xl font-bold text-foreground mt-1">오늘의 신체 신호</h1>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card p-6 shadow-sm border border-border mb-4"
      >
        <div className="flex items-center gap-5">
          {/* Score ring */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(todayCheck.total_score / 10) * 213.6} 213.6`}
                transform="rotate(-90 40 40)"
                className={levelRingColor[level]}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">{todayCheck.total_score}</span>
              <span className="text-[10px] text-muted-foreground">/10</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mb-1 ${level === 'good' ? 'bg-score-good/15 text-score-good' :
                level === 'mild' ? 'bg-score-mild/15 text-score-mild' :
                  level === 'moderate' ? 'bg-score-moderate/15 text-score-moderate' :
                    'bg-score-severe/15 text-score-severe'
              }`}>
              {levelLabel[level]}
            </span>
            <p className="text-sm font-medium text-foreground leading-relaxed">{todayCheck.summary_text}</p>

            <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">AI 코칭</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{aiMessage}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metric chips */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {fields.map((field, i) => {
          const info = CHECK_ITEMS[i];
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card border border-border p-2 text-center shadow-sm"
            >
              <span className="text-lg block">{info.icon}</span>
              <span className={`text-xs font-medium block mt-0.5 ${chipColors[field.value]}`}>
                {info.options[field.value].label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={editCheck}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-medium text-secondary-foreground touch-target"
        >
          <Edit3 className="h-4 w-4" /> 수정하기
        </button>
        <button
          onClick={() => navigate('/patterns')}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary/10 py-3 text-sm font-medium text-primary touch-target"
        >
          패턴 보기 <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AppLayout>
  );
}
