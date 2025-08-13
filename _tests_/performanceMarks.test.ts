import { mark, measure, getMarks, clearMarks } from '@/utils/performanceMarks';

describe('performanceMarks utility', () => {
    // Run tests in isolation to avoid cross-contamination
    afterEach(() => {
        clearMarks();
    });

    it('records mark and measure in non-production env', () => {
        // Ensure we start clean
        clearMarks();
        
        mark('start');
        mark('end');
        measure('duration', 'start', 'end');
        const { marks, measures } = getMarks();
        expect(marks.find(m => m.name === 'start')).toBeTruthy();
        expect(marks.find(m => m.name === 'end')).toBeTruthy();
        expect(measures.find(m => m.name === 'duration')?.duration).toBeGreaterThanOrEqual(0);
    });

    it('no-ops in production env', () => {
        const originalEnv = process.env.NODE_ENV;

        try {
            // Start with clean state in non-production
            clearMarks();
            
            // Verify we're clean
            const { marks: preMarks, measures: preMeasures } = getMarks();
            expect(preMarks.length).toBe(0);
            expect(preMeasures.length).toBe(0);

            // Switch to production environment
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'production',
                configurable: true,
                writable: true
            });

            // Try to add marks/measures in production mode - should be no-ops
            mark('prod-start');
            mark('prod-end');
            measure('prod-duration', 'prod-start', 'prod-end');

            // Check results - should still be empty since operations were no-ops
            const { marks, measures } = getMarks();
            expect(marks.length).toBe(0);
            expect(measures.length).toBe(0);
            
        } finally {
            // Restore original environment
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: originalEnv,
                configurable: true,
                writable: true
            });
            // Clean up
            clearMarks();
        }
    });
});
