import { QueryClient } from '@tanstack/react-query';

import { prefetchRouteVariants } from '@/hooks/useRoutePrefetch';
import * as routeService from '@/services/routeService';

it('calls fetchRoutes for other modes (walking,biking,driving)', async () => {
  const client = new QueryClient();
  const spy = jest.spyOn(routeService, 'fetchRoutes').mockImplementation(async () => []);
  const origin = { id: 'o1', name: 'Origin', address: '', category: 'other' as import('@/types/navigation').PlaceCategory, coordinates: { latitude: 0, longitude: 0 } };
  const destination = { id: 'd1', name: 'Dest', address: '', category: 'other' as import('@/types/navigation').PlaceCategory, coordinates: { latitude: 1, longitude: 1 } };
  const excludeMode = 'transit';
  const baseOptions = { travelMode: 'walking' as import('@/types/navigation').TravelMode, avoidHighways: false, avoidTolls: false, accessibilityMode: false };
  await prefetchRouteVariants(client, origin, destination, excludeMode, baseOptions);
  expect(spy).toHaveBeenCalledTimes(3);
});
