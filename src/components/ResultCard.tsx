import { getScoreLevel } from '@/lib/bodycheck';

interface ResultCardProps {
  totalScore: number;
  summaryText: string;
  resetText: string;
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function ResultCard({ totalScore, summaryText, resetText, onEdit, showEditButton }: ResultCardProps) {
  const level = getScoreLevel(totalScore);
  const levelColors = {
    good: 'border-l-score-good',
    mild: 'border-l-score-mild',
    moderate: 'border-l-score-moderate',
    severe: 'border-l-score-severe',
  };

  return (
    <div className={`animate-fade-in rounded-lg bg-card p-5 shadow-sm border border-border border-l-4 ${levelColors[level]}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">오늘의 상태</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {totalScore}/10
        </span>
      </div>

      <p className="mt-2 text-base font-medium text-card-foreground leading-relaxed">
        {summaryText}
      </p>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        💡 {resetText}
      </p>

      {showEditButton && onEdit && (
        <button
          onClick={onEdit}
          className="mt-4 w-full rounded-md bg-secondary py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted touch-target"
        >
          수정하기
        </button>
      )}
    </div>
  );
}
