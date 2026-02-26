// Body check interpretation logic

export interface CheckData {
  neckShoulder: number;
  jaw: number;
  breath: number;
  eyes: number;
  energy: number;
}

export function calculateTotalScore(data: CheckData): number {
  return data.neckShoulder + data.jaw + data.breath + data.eyes + data.energy;
}

export function getSummaryText(data: CheckData, totalScore: number): string {
  // Pattern-based (priority)
  if (data.jaw === 2 && data.breath === 2) return "압박 상황에 반응하는 신호가 보입니다.";
  if (data.eyes === 2 && data.energy === 2) return "피로 누적 신호가 감지됩니다.";
  if (data.neckShoulder === 2 && data.jaw === 2) return "상체 긴장이 집중되어 있습니다.";
  if (data.neckShoulder === 2 && data.breath === 2) return "긴장으로 호흡이 얕아진 상태로 보입니다.";

  // Score-based
  if (totalScore <= 2) return "전반적으로 안정된 신체 상태입니다.";
  if (totalScore <= 5) return "가벼운 긴장 신호가 보입니다.";
  if (totalScore <= 8) return "긴장과 피로 신호가 누적된 상태로 보입니다.";
  return "신체 전반에 강한 긴장 신호가 감지됩니다.";
}

export function getResetText(data: CheckData, totalScore: number): string {
  // Pattern-based (priority)
  if (data.jaw === 2 && data.breath === 2) return "10초만 천천히 숨을 내쉬어보세요.";
  if (data.eyes === 2 && data.energy === 2) return "먼 곳을 5초만 바라보세요.";
  if (data.neckShoulder === 2 && data.jaw === 2) return "어깨를 천천히 한 번 내려보세요.";
  if (data.neckShoulder === 2) return "목과 어깨에 힘을 잠깐 풀어보세요.";
  if (data.breath === 2) return "숨을 조금 더 길게 내쉬어보세요.";
  if (totalScore <= 2) return "오늘은 이 상태를 유지해도 좋겠습니다.";
  return "지금 자세를 한 번만 가볍게 정리해보세요.";
}

export function getScoreLevel(totalScore: number): 'good' | 'mild' | 'moderate' | 'severe' {
  if (totalScore <= 2) return 'good';
  if (totalScore <= 5) return 'mild';
  if (totalScore <= 8) return 'moderate';
  return 'severe';
}

export const CHECK_ITEMS = [
  {
    key: 'neckShoulder' as const,
    label: '목·어깨 긴장',
    icon: '🧘',
    options: [
      { value: 0, label: '편안' },
      { value: 1, label: '약간 뻐근' },
      { value: 2, label: '많이 뻐근' },
    ],
  },
  {
    key: 'jaw' as const,
    label: '턱 힘',
    icon: '😬',
    options: [
      { value: 0, label: '힘 없음' },
      { value: 1, label: '약간 물림' },
      { value: 2, label: '꽉 물림' },
    ],
  },
  {
    key: 'breath' as const,
    label: '호흡 깊이',
    icon: '🌬️',
    options: [
      { value: 0, label: '깊음' },
      { value: 1, label: '보통' },
      { value: 2, label: '얕음' },
    ],
  },
  {
    key: 'eyes' as const,
    label: '눈 피로',
    icon: '👁️',
    options: [
      { value: 0, label: '또렷' },
      { value: 1, label: '피곤' },
      { value: 2, label: '무겁다' },
    ],
  },
  {
    key: 'energy' as const,
    label: '몸 에너지',
    icon: '⚡',
    options: [
      { value: 0, label: '가볍다' },
      { value: 1, label: '보통' },
      { value: 2, label: '무겁다' },
    ],
  },
] as const;
