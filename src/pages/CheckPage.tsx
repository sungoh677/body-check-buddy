import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CHECK_ITEMS, CheckData, calculateTotalScore, getSummaryText, getResetText } from '@/lib/bodycheck';
import { GUIDE_DATA, CheckDisclaimer } from '@/components/BodyCheckGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';

interface CheckPageProps {
  initialValues?: CheckData;
  existingId?: string;
}

export default function CheckPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<CheckData>(() => {
    // Check for prefill from navigation state
    const state = window.history.state?.usr;
    if (state?.initialValues) return state.initialValues;
    return { neckShoulder: -1, jaw: -1, breath: -1, eyes: -1, energy: -1 };
  });
  const [saving, setSaving] = useState(false);
  const existingId = window.history.state?.usr?.existingId;

  const today = format(new Date(), 'yyyy-MM-dd');
  const item = CHECK_ITEMS[step];
  const guide = GUIDE_DATA[step];

  const handleSelect = useCallback(async (value: number) => {
    const newValues = { ...values, [item.key]: value };
    setValues(newValues);

    if (step < 4) {
      setDirection(1);
      setTimeout(() => setStep(step + 1), 200);
    } else {
      // Last step — save
      setSaving(true);
      const totalScore = calculateTotalScore(newValues);
      const summaryText = getSummaryText(newValues, totalScore);
      const resetText = getResetText(newValues, totalScore);

      const record = {
        user_id: user!.id,
        date: today,
        neck_shoulder: newValues.neckShoulder,
        jaw: newValues.jaw,
        breath: newValues.breath,
        eyes: newValues.eyes,
        energy: newValues.energy,
        total_score: totalScore,
        summary_text: summaryText,
        reset_text: resetText,
      };

      if (existingId) {
        await supabase.from('daily_checks').update(record).eq('id', existingId);
      } else {
        await supabase.from('daily_checks').insert(record);
      }
      navigate('/', { replace: true });
    }
  }, [values, step, user, today, existingId, navigate]);

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const selectedValue = values[item.key];
  const scoreColors = [
    'bg-score-good text-success-foreground',
    'bg-score-mild text-warning-foreground',
    'bg-score-severe text-destructive-foreground',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button onClick={goBack} className="touch-target flex items-center justify-center">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-muted-foreground">{step + 1} / 5</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-6 mb-4">
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((step + 1) / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            {/* SVG Guide */}
            <div className="mb-4">
              {guide.svg}
            </div>

            {/* Label */}
            <h2 className="text-xl font-semibold text-foreground mb-1">{item.label}</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed max-w-xs">
              {guide.guide}
            </p>

            {/* 3 Option Buttons */}
            <div className="w-full space-y-3">
              {item.options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(option.value)}
                    disabled={saving}
                    className={`w-full rounded-2xl py-4 text-base font-medium transition-all touch-target border-2 ${
                      isSelected
                        ? `${scoreColors[option.value]} border-transparent shadow-md`
                        : 'bg-card text-card-foreground border-border hover:border-primary/30'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                );
              })}
            </div>

            <CheckDisclaimer />
          </motion.div>
        </AnimatePresence>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <p className="text-foreground font-medium">저장 중...</p>
        </div>
      )}
    </div>
  );
}
