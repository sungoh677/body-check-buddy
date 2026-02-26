import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

const adminTabs = [
  { path: '/admin', label: '대시보드' },
  { path: '/admin/users', label: '유저' },
  { path: '/admin/records', label: '기록' },
  { path: '/admin/rules', label: '룰' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-foreground">관리자</h1>
            <Link to="/" className="text-sm text-primary hover:underline">← 앱으로</Link>
          </div>
          <nav className="flex gap-1">
            {adminTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState({ todayCount: 0, activeUsers: 0, avgScore: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const [todayRes, weekRes] = await Promise.all([
      supabase.from('daily_checks').select('id', { count: 'exact' }).eq('date', today),
      supabase.from('daily_checks').select('user_id, total_score').gte('date', weekAgo),
    ]);

    const todayCount = todayRes.count ?? 0;
    const weekData = weekRes.data ?? [];
    const activeUsers = new Set(weekData.map((d) => d.user_id)).size;
    const avgScore = weekData.length > 0
      ? (weekData.reduce((s, d) => s + d.total_score, 0) / weekData.length).toFixed(1)
      : '0';

    setStats({ todayCount, activeUsers, avgScore });
    setLoading(false);
  };

  if (loading) return <p className="text-muted-foreground">로딩 중...</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-3 animate-fade-in">
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border text-center">
        <div className="text-3xl font-bold text-foreground">{stats.todayCount}</div>
        <div className="text-xs text-muted-foreground">오늘 기록 수</div>
      </div>
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border text-center">
        <div className="text-3xl font-bold text-foreground">{stats.activeUsers}</div>
        <div className="text-xs text-muted-foreground">7일 활성 유저</div>
      </div>
      <div className="rounded-lg bg-card p-4 shadow-sm border border-border text-center">
        <div className="text-3xl font-bold text-foreground">{stats.avgScore}</div>
        <div className="text-xs text-muted-foreground">7일 평균 점수</div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userChecks, setUserChecks] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });

    if (profiles) {
      // Get last check dates
      const enriched = await Promise.all(
        profiles.map(async (p) => {
          const { data } = await supabase
            .from('daily_checks')
            .select('date')
            .eq('user_id', p.id)
            .order('date', { ascending: false })
            .limit(1);
          return { ...p, lastCheck: data?.[0]?.date ?? null };
        })
      );
      setUsers(enriched);
    }
    setLoading(false);
  };

  const viewUser = async (userId: string) => {
    setSelectedUser(userId);
    const { data } = await supabase
      .from('daily_checks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7);
    setUserChecks(data ?? []);
  };

  if (loading) return <p className="text-muted-foreground">로딩 중...</p>;

  if (selectedUser) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedUser(null)} className="mb-4 text-sm text-primary hover:underline">
          ← 목록으로
        </button>
        <h2 className="mb-3 text-base font-medium text-foreground">
          {users.find((u) => u.id === selectedUser)?.email} 최근 기록
        </h2>
        <div className="space-y-2">
          {userChecks.map((c) => (
            <div key={c.id} className="rounded-lg bg-card p-3 shadow-sm border border-border text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-card-foreground">{c.date}</span>
                <span className="text-muted-foreground">{c.total_score}/10</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.summary_text}</p>
            </div>
          ))}
          {userChecks.length === 0 && <p className="text-sm text-muted-foreground">기록 없음</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-3 text-base font-medium text-foreground">유저 목록 ({users.length})</h2>
      <div className="space-y-2">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => viewUser(u.id)}
            className="flex w-full items-center justify-between rounded-lg bg-card p-3 shadow-sm border border-border text-left hover:bg-muted touch-target"
          >
            <div>
              <div className="text-sm font-medium text-card-foreground">{u.email}</div>
              <div className="text-xs text-muted-foreground">
                가입: {format(new Date(u.created_at), 'yyyy.MM.dd')}
                {u.lastCheck && ` · 마지막: ${u.lastCheck}`}
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [emailSearch, setEmailSearch] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [dateFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    let query = supabase
      .from('daily_checks')
      .select('*, profiles!daily_checks_user_id_fkey(email)')
      .eq('date', dateFilter)
      .order('created_at', { ascending: false });

    const { data } = await query;
    setRecords(data ?? []);
    setLoading(false);
  };

  const filtered = emailSearch
    ? records.filter((r) => (r.profiles as any)?.email?.includes(emailSearch))
    : records;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="이메일 검색"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">로딩 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">해당 날짜의 기록이 없습니다</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-lg bg-card p-3 shadow-sm border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-card-foreground">{(r.profiles as any)?.email}</span>
                <span className="text-muted-foreground">{r.total_score}/10</span>
              </div>
              <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                <span>목:{r.neck_shoulder}</span>
                <span>턱:{r.jaw}</span>
                <span>숨:{r.breath}</span>
                <span>눈:{r.eyes}</span>
                <span>에너지:{r.energy}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.summary_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminRules() {
  const rules = [
    { condition: 'jaw==2 AND breath==2', summary: '압박 상황에 반응하는 신호가 보입니다.', reset: '10초만 천천히 숨을 내쉬어보세요.' },
    { condition: 'eyes==2 AND energy==2', summary: '피로 누적 신호가 감지됩니다.', reset: '먼 곳을 5초만 바라보세요.' },
    { condition: 'neckShoulder==2 AND jaw==2', summary: '상체 긴장이 집중되어 있습니다.', reset: '어깨를 천천히 한 번 내려보세요.' },
    { condition: 'neckShoulder==2 AND breath==2', summary: '긴장으로 호흡이 얕아진 상태로 보입니다.', reset: '숨을 조금 더 길게 내쉬어보세요.' },
    { condition: 'score 0-2', summary: '전반적으로 안정된 신체 상태입니다.', reset: '오늘은 이 상태를 유지해도 좋겠습니다.' },
    { condition: 'score 3-5', summary: '가벼운 긴장 신호가 보입니다.', reset: '지금 자세를 한 번만 가볍게 정리해보세요.' },
    { condition: 'score 6-8', summary: '긴장과 피로 신호가 누적된 상태로 보입니다.', reset: '지금 자세를 한 번만 가볍게 정리해보세요.' },
    { condition: 'score 9-10', summary: '신체 전반에 강한 긴장 신호가 감지됩니다.', reset: '지금 자세를 한 번만 가볍게 정리해보세요.' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="mb-3 text-base font-medium text-foreground">해석 규칙 (읽기 전용)</h2>
      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div key={i} className="rounded-lg bg-card p-3 shadow-sm border border-border">
            <div className="text-xs font-mono text-muted-foreground mb-1">{rule.condition}</div>
            <div className="text-sm text-card-foreground">{rule.summary}</div>
            <div className="text-xs text-muted-foreground mt-0.5">💡 {rule.reset}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
