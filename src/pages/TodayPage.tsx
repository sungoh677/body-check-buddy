import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateTotalScore, getSummaryText, getResetText, CheckData } from '@/lib/bodycheck';
import AppLayout from '@/components/AppLayout';
import BodyCheckForm from '@/components/BodyCheckForm';
import ResultCard from '@/components/ResultCard';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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
  const [todayCheck, setTodayCheck] = useState<DailyCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const handleSubmit = async (checkData: CheckData) => {
    if (!user) return;
    setSaving(true);

    const totalScore = calculateTotalScore(checkData);
    const summaryText = getSummaryText(checkData, totalScore);
    const resetText = getResetText(checkData, totalScore);

    const record = {
      user_id: user.id,
      date: today,
      neck_shoulder: checkData.neckShoulder,
      jaw: checkData.jaw,
      breath: checkData.breath,
      eyes: checkData.eyes,
      energy: checkData.energy,
      total_score: totalScore,
      summary_text: summaryText,
      reset_text: resetText,
    };

    if (todayCheck) {
      // Update
      const { data } = await supabase
        .from('daily_checks')
        .update(record)
        .eq('id', todayCheck.id)
        .select()
        .single();
      if (data) setTodayCheck(data);
    } else {
      // Insert
      const { data } = await supabase
        .from('daily_checks')
        .insert(record)
        .select()
        .single();
      if (data) setTodayCheck(data);
    }

    setEditing(false);
    setSaving(false);
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

  // Show result if today's check exists and not editing
  if (todayCheck && !editing) {
    return (
      <AppLayout>
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-foreground">오늘의 체크 완료</h1>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>

        <ResultCard
          totalScore={todayCheck.total_score}
          summaryText={todayCheck.summary_text}
          resetText={todayCheck.reset_text}
          showEditButton
          onEdit={() => setEditing(true)}
        />

        <Link
          to="/patterns"
          className="mt-4 block text-center text-sm text-primary hover:underline"
        >
          패턴 보기 →
        </Link>
      </AppLayout>
    );
  }

  // Show form
  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-foreground">
          {editing ? '오늘 기록 수정' : '15초 점검 시작'}
        </h1>
        <p className="text-xs text-muted-foreground">
          {editing ? '값을 변경하고 수정하기를 눌러주세요' : '지금 몸 상태를 가볍게 체크해보세요'}
        </p>
      </div>

      <BodyCheckForm
        initialValues={
          todayCheck
            ? {
                neckShoulder: todayCheck.neck_shoulder,
                jaw: todayCheck.jaw,
                breath: todayCheck.breath,
                eyes: todayCheck.eyes,
                energy: todayCheck.energy,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        loading={saving}
        isEdit={editing}
      />

      {editing && (
        <button
          onClick={() => setEditing(false)}
          className="mt-2 w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
        >
          취소
        </button>
      )}
    </AppLayout>
  );
}
