import { mark, measure, getMarks, clearMarks } from '@/utils/performanceMarks';

describe('performanceMarks utility', () => {
    beforeEach(() => clearMarks());

    it('records mark and measure in non-production env', () => {
        mark('start');
        mark('end');
        measure('duration', 'start', 'end');
        const { marks, measures } = getMarks();
        expect(marks.find(m => m.name === 'start')).toBeTruthy();
        expect(marks.find(m => m.name === 'end')).toBeTruthy();
        expect(measures.find(m => m.name === 'duration')?.duration).toBeGreaterThanOrEqual(0);
    });

    it('no-ops in production env', () => {
        const prev = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        clearMarks();
        mark('start');
        mark('end');
        measure('duration', 'start', 'end');
        const { marks, measures } = getMarks();
        expect(marks.length).toBe(0);
        expect(measures.length).toBe(0);
        process.env.NODE_ENV = prev;
    });
});
