// Lightweight performance marks utility (dev / test only). Provides mark & measure helpers.
// In production it no-ops to avoid overhead.

type MarkEntry = { name: string; time: number };
type MeasureEntry = { name: string; duration: number; start: number; end: number };

const marks: MarkEntry[] = [];
const measures: MeasureEntry[] = [];

const isActive = () => process.env.NODE_ENV !== 'production';

export function mark(name: string) {
    if (!isActive()) return;
    const time = performance.now();
    marks.push({ name, time });
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === 'development') console.log(`[perf] mark: ${name} @ ${time.toFixed(2)}ms`);
}

export function measure(name: string, startMark: string, endMark: string) {
    if (!isActive()) return;
    const start = [...marks].reverse().find(m => m.name === startMark)?.time;
    const end = [...marks].reverse().find(m => m.name === endMark)?.time;
    if (start != null && end != null && end >= start) {
        const duration = end - start;
        measures.push({ name, duration, start, end });
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV === 'development') console.log(`[perf] measure: ${name} ${duration.toFixed(2)}ms`);
    }
}

export function getMarks() { return { marks: [...marks], measures: [...measures] }; }
export function clearMarks() { marks.length = 0; measures.length = 0; }
