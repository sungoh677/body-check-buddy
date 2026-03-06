import { describe, it, expect } from 'vitest';
import { calculateTotalScore, getAiCoachingMessage, CheckData } from './bodycheck';

const createBaseData = (): CheckData => ({ neckShoulder: 0, jaw: 0, breath: 0, eyes: 0, energy: 0 });

describe('bodycheck logic', () => {
    describe('calculateTotalScore', () => {
        it('should return a total score of 0 when all items are 0', () => {
            const data = createBaseData();
            expect(calculateTotalScore(data)).toBe(0);
        });

        it('should return a total score of 10 when all items are 2', () => {
            const data: CheckData = { neckShoulder: 2, jaw: 2, breath: 2, eyes: 2, energy: 2 };
            expect(calculateTotalScore(data)).toBe(10);
        });
    });

    describe('getAiCoachingMessage', () => {
        it('should include specific keywords in AI coaching message when jaw and breath are 2', () => {
            const data = { ...createBaseData(), jaw: 2, breath: 2 };
            const message = getAiCoachingMessage(data);
            expect(message).toContain('스트레스');
            expect(message).toContain('이완');
        });

        it('[Edge Case] should prioritize the first matched single symptom if multiple 2s exist without a combo pattern', () => {
            // eyes=2 and neckShoulder=2 have no specific combo pattern.
            // In getAiCoachingMessage, eyes is checked before neckShoulder.
            const data = { ...createBaseData(), eyes: 2, neckShoulder: 2 };
            const message = getAiCoachingMessage(data);
            expect(message).toContain('눈 주변 근육이 굳어있습니다');
        });
    });
});
