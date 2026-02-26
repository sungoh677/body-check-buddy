// SVG animation guides for each body check item
export const GUIDE_DATA = [
  {
    key: 'neckShoulder',
    guide: '목을 좌우로 한 번 돌리고, 어깨 힘을 툭 풀어보세요.',
    animClass: 'anim-neck',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24 anim-neck" fill="none" stroke="hsl(215, 90%, 56%)" strokeWidth="2.5" strokeLinecap="round">
        {/* Head */}
        <circle cx="60" cy="32" r="16" />
        {/* Neck */}
        <line x1="60" y1="48" x2="60" y2="62" />
        {/* Shoulders */}
        <path d="M60 62 Q60 72, 30 76" />
        <path d="M60 62 Q60 72, 90 76" />
        {/* Arrow hints */}
        <path d="M38 24 L30 28 L36 32" strokeWidth="1.5" opacity="0.5" />
        <path d="M82 24 L90 28 L84 32" strokeWidth="1.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: 'jaw',
    guide: '이를 살짝 벌려보며 턱에 힘이 들어갔는지 느껴보세요.',
    animClass: 'anim-jaw',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="hsl(215, 90%, 56%)" strokeWidth="2.5" strokeLinecap="round">
        {/* Face outline */}
        <ellipse cx="60" cy="50" rx="28" ry="34" />
        {/* Eyes */}
        <circle cx="48" cy="42" r="3" fill="hsl(215, 90%, 56%)" />
        <circle cx="72" cy="42" r="3" fill="hsl(215, 90%, 56%)" />
        {/* Jaw/Mouth */}
        <path d="M48 62 Q60 72 72 62" className="anim-jaw" style={{ transformOrigin: '60px 62px' }} />
      </svg>
    ),
  },
  {
    key: 'breath',
    guide: '코로 들이마실 때 숨이 배까지 내려가는지 확인해보세요.',
    animClass: 'anim-breath',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="hsl(215, 90%, 56%)" strokeWidth="2.5" strokeLinecap="round">
        {/* Torso */}
        <path d="M45 30 Q40 50, 42 80 L78 80 Q80 50, 75 30" />
        {/* Lungs expanding */}
        <ellipse cx="60" cy="55" rx="14" ry="18" className="anim-breath" style={{ transformOrigin: '60px 55px' }} strokeDasharray="4 3" opacity="0.6" />
        {/* Belly */}
        <ellipse cx="60" cy="72" rx="10" ry="6" className="anim-breath" style={{ transformOrigin: '60px 72px' }} />
        {/* Arrow down */}
        <path d="M60 38 L60 48 M56 44 L60 48 L64 44" strokeWidth="1.5" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: 'eyes',
    guide: '먼 곳을 3초 보고, 초점이 쉽게 맞는지 확인해보세요.',
    animClass: 'anim-eye',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="hsl(215, 90%, 56%)" strokeWidth="2.5" strokeLinecap="round">
        {/* Eye shape */}
        <path d="M20 60 Q60 30, 100 60 Q60 90, 20 60" />
        {/* Iris */}
        <circle cx="60" cy="60" r="12" />
        {/* Pupil */}
        <circle cx="60" cy="60" r="5" fill="hsl(215, 90%, 56%)" className="anim-eye" style={{ transformOrigin: '60px 60px' }} />
        {/* Eyelid blink */}
        <path d="M20 60 Q60 30, 100 60" className="anim-eye" style={{ transformOrigin: '60px 45px' }} />
      </svg>
    ),
  },
  {
    key: 'energy',
    guide: "지금 몸이 '가볍다/보통/무겁다' 중 어디에 가까운지 선택하세요.",
    animClass: 'anim-energy',
    svg: (
      <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none" stroke="hsl(215, 90%, 56%)" strokeWidth="2.5" strokeLinecap="round">
        {/* Person silhouette */}
        <circle cx="60" cy="28" r="12" />
        <line x1="60" y1="40" x2="60" y2="72" className="anim-energy" style={{ transformOrigin: '60px 56px' }} />
        {/* Arms */}
        <path d="M60 52 L38 62" className="anim-energy" style={{ transformOrigin: '60px 52px' }} />
        <path d="M60 52 L82 62" className="anim-energy" style={{ transformOrigin: '60px 52px' }} />
        {/* Legs */}
        <path d="M60 72 L44 96" />
        <path d="M60 72 L76 96" />
        {/* Energy waves */}
        <path d="M30 50 Q25 40 30 30" strokeWidth="1.5" opacity="0.3" className="anim-energy" style={{ transformOrigin: '30px 40px' }} />
        <path d="M90 50 Q95 40 90 30" strokeWidth="1.5" opacity="0.3" className="anim-energy" style={{ transformOrigin: '90px 40px' }} />
      </svg>
    ),
  },
];

export function CheckDisclaimer() {
  return (
    <p className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
      의료 진단이 아닌 자기 점검용 기록입니다.
    </p>
  );
}
