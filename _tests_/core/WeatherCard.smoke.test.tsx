import React from 'react';

import { render } from '../testUtils';

import WeatherCard from '@/components/WeatherCard';

const sampleWeather = {
  condition: 'Sunny',
  temperature: 22,
  recommendation: 'Wear sunscreen',
};

describe('WeatherCard', () => {
  it('renders minimal weather info without crashing', () => {
    const { getByTestId, getByText } = render(<WeatherCard weather={sampleWeather} />);

    expect(getByTestId('weather-card')).toBeTruthy();
    expect(getByText(/22°C/)).toBeTruthy();
    expect(getByText(/Wear sunscreen/)).toBeTruthy();
  });
});
