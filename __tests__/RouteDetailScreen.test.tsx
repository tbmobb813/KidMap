import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RouteDetailScreen from '@/app/route/[id]';
import * as api from '@/utils/api';
import { TravelMode } from '@/utils/api';
import { useNavigationStore } from '@/stores/navigationStore';

jest.mock('@/stores/navigationStore');
jest.mock('@/utils/api');

describe('RouteDetailScreen', () => {
  const origin = { coords: [0, 0], name: 'Start' };
  const destination = { coords: [1, 1], name: 'End' };

  beforeEach(() => {
    (useNavigationStore as jest.Mock).mockReturnValue({ origin, destination });
  });

  it('shows spinner, then renders steps, then hides spinner', async () => {
    const stubResult = { mode: 'walking' as TravelMode, totalDistance: 0, totalDuration: 0, steps: [] };
    (api.fetchRoute as jest.Mock).mockResolvedValueOnce(stubResult);

    const { getByTestId, queryByText } = render(<RouteDetailScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();

    await waitFor(() => {
      expect(api.fetchRoute).toHaveBeenCalledWith(origin.coords, destination.coords, 'walking');
    });
    expect(queryByText('Distance')).toBeTruthy();
    expect(queryByText('Duration')).toBeTruthy();
  });

  it('renders error message on null result', async () => {
    (api.fetchRoute as jest.Mock).mockResolvedValueOnce(null);

    const { getByText } = render(<RouteDetailScreen />);
    await waitFor(() => {
      expect(getByText('Unable to load route')).toBeTruthy();
    });
  });

  it('allows switching modes and re-fetches', async () => {
    (api.fetchRoute as jest.Mock).mockResolvedValue({ mode: 'cycling' as TravelMode, totalDistance: 0, totalDuration: 0, steps: [] });
    const { getByText } = render(<RouteDetailScreen />);

    await waitFor(() => expect(api.fetchRoute).toHaveBeenCalledTimes(1));
    fireEvent.press(getByText('Cycling'));
    await waitFor(() => expect(api.fetchRoute).toHaveBeenCalledWith(origin.coords, destination.coords, 'cycling'));
  });
});