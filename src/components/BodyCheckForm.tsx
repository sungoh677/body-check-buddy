import { useState } from 'react';
import { CHECK_ITEMS, CheckData } from '@/lib/bodycheck';

interface BodyCheckFormProps {
  initialValues?: CheckData;
  onSubmit: (data: CheckData) => void;
  loading: boolean;
  isEdit?: boolean;
}

export default function BodyCheckForm({ initialValues, onSubmit, loading, isEdit }: BodyCheckFormProps) {
  const [values, setValues] = useState<CheckData>(
    initialValues ?? {
      neckShoulder: -1,
      jaw: -1,
      breath: -1,
      eyes: -1,
      energy: -1,
    }
  );

  const allSelected = CHECK_ITEMS.every((item) => values[item.key] >= 0);

  const handleSelect = (key: keyof CheckData, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (allSelected) onSubmit(values);
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {CHECK_ITEMS.map((item) => (
        <div key={item.key} className="rounded-lg bg-card p-4 shadow-sm border border-border">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium text-card-foreground">{item.label}</span>
          </div>
          <div className="flex gap-2">
            {item.options.map((option) => {
              const isSelected = values[item.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(item.key, option.value)}
                  className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-all touch-target ${
                    isSelected
                      ? option.value === 0
                        ? 'bg-success text-success-foreground shadow-sm'
                        : option.value === 1
                        ? 'bg-warning text-warning-foreground shadow-sm'
                        : 'bg-destructive text-destructive-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allSelected || loading}
        className={`w-full rounded-lg py-3.5 text-base font-semibold transition-all touch-target ${
          allSelected && !loading
            ? 'bg-primary text-primary-foreground shadow-md hover:opacity-90'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        {loading ? '저장 중...' : isEdit ? '수정하기' : '저장하기'}
      </button>
    </div>
  );
}
