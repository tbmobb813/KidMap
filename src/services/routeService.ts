import { Route, TravelMode } from '@/types/navigation';
import { sampleRoutes } from '@/mocks/transit';
import { Place, RouteOptions } from '@/types/navigation';

export type FetchRoutesParams = {
  origin: Place;
  destination: Place;
  mode: TravelMode;
  options: RouteOptions;
};

// Simulated latency to mimic network; adjustable for tests.
const DEFAULT_LATENCY_MS = 120;

export async function fetchRoutes({ origin, destination, mode, options }: FetchRoutesParams): Promise<Route[]> {
  // Simple artificial delay
  await new Promise(res => setTimeout(res, DEFAULT_LATENCY_MS));

  let base = sampleRoutes;

  if (mode === 'walking') {
    return base.map(r => ({
      ...r,
      id: `walk_${r.id}`,
      steps: [{ id: 'walk_step', type: 'walk', from: origin.name, to: destination.name, duration: Math.ceil(r.totalDuration * 1.5) }],
      totalDuration: Math.ceil(r.totalDuration * 1.5),
    }));
  }
  if (mode === 'biking') {
    return base.map(r => ({
      ...r,
      id: `bike_${r.id}`,
      steps: [{ id: 'bike_step', type: 'bike', from: origin.name, to: destination.name, duration: Math.ceil(r.totalDuration * 0.7) }],
      totalDuration: Math.ceil(r.totalDuration * 0.7),
    }));
  }
  if (mode === 'driving') {
    return base.map(r => ({
      ...r,
      id: `drive_${r.id}`,
      steps: [{ id: 'drive_step', type: 'car', from: origin.name, to: destination.name, duration: Math.ceil(r.totalDuration * 0.4) }],
      totalDuration: Math.ceil(r.totalDuration * 0.4),
    }));
  }

  return base;
}
