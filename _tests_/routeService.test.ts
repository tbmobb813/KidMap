import { fetchRoutes } from '@/services/routeService';

// Simple mock types – relying on existing type declarations via tsconfig paths
const origin = { id: 'o1', name: 'Origin', address: '', category: 'other', coordinates: { latitude: 0, longitude: 0 } } as any;
const destination = { id: 'd1', name: 'Destination', address: '', category: 'other', coordinates: { latitude: 1, longitude: 1 } } as any;
const baseOptions = { travelMode: 'transit', avoidTolls: false, avoidHighways: false, accessibilityMode: false } as any;

// Allow shorter test time by mocking setTimeout? We keep default small latency.
jest.setTimeout(5000);

describe('routeService.fetchRoutes', () => {
    it('transforms walking routes with increased duration', async () => {
        const routes = await fetchRoutes({ origin, destination, mode: 'walking', options: baseOptions });
        expect(routes.length).toBeGreaterThan(0);
        // Each route id should be prefixed
        routes.forEach(r => {
            expect(r.id.startsWith('walk_')).toBe(true);
            expect(r.steps[0].type).toBe('walk');
        });
    });

    it('transforms driving routes with decreased duration', async () => {
        const routes = await fetchRoutes({ origin, destination, mode: 'driving', options: baseOptions });
        expect(routes.length).toBeGreaterThan(0);
        routes.forEach(r => {
            expect(r.id.startsWith('drive_')).toBe(true);
            expect(r.steps[0].type).toBe('car');
        });
    });
});
