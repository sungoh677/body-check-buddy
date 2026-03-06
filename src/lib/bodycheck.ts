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

export function getAiCoachingMessage(data: CheckData): string {
  // Pattern-based (highest priority combinations)
  if (data.jaw === 2 && data.breath === 2) {
    return "💡 스트레스가 호흡과 턱 근육에 집중되고 있습니다. 의식적으로 입술을 살짝 떼고 따뜻한 차를 마시며 이완해보세요.";
  }
  if (data.eyes === 2 && data.energy === 2) {
    return "💡 전반적인 피로감이 눈까지 올라온 상태입니다. 3분간 스마트폰을 내려놓고 먼 곳이나 초록색 자연을 바라보세요.";
  }
  if (data.neckShoulder === 2 && data.jaw === 2) {
    return "💡 상체 위주로 긴장이 매우 높습니다. 자리에 기대어 어깨를 귀까지 올렸다가 툭 떨어뜨리는 동작을 3번 반복해보세요.";
  }

  // Single severe symptom
  if (data.eyes === 2) return "💡 눈 주변 근육이 굳어있습니다. 양손을 비벼서 따뜻하게 만든 후 가만히 두 눈 위에 덮어주세요.";
  if (data.neckShoulder === 2) return "💡 승모근에 과도한 힘이 들어가 있습니다. 기지개를 켜듯 양팔을 위로 길게 뻗고 10초간 시원하게 늘려주세요.";
  if (data.breath === 2) return "💡 호흡이 얕고 빠릅니다. 손을 배에 올리고 배가 부풀어 오르는 느낌에 집중하며 5초간 천천히 깊게 마셔보세요.";
  if (data.energy === 2) return "💡 몸의 에너지가 많이 떨어져 있습니다. 가급적 시끄러운 환경을 피하고 조용한 곳에서 잠시 눈을 감고 휴식하세요.";
  if (data.jaw === 2) return "💡 무의식적으로 이를 악물고 있을 수 있습니다. 입 안에 가볍게 공기를 머금고 볼을 빵빵하게 만들어보세요.";

  // Moderate warnings (sum is somewhat high but no specific 2s)
  const total = calculateTotalScore(data);
  if (total > 5) return "💡 가벼운 피로와 긴장이 누적되고 있습니다. 무리한 약속보다는 오늘 하루 일찍 귀가해 따뜻한 물로 샤워하는 것을 추천합니다.";
  if (total > 2) return "💡 무난한 하루지만, 틈틈이 자리에서 일어나 기지개를 켜주면 훨씬 더 가벼운 내일을 맞이할 수 있을 거예요.";

  // Optimal
  return "💡 현재 최상의 컨디션입니다! 지금의 긍정적인 에너지를 유지하시면서 오늘 하루도 활기차게 보내세요.";
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
