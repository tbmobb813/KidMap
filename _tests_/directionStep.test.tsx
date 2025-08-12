import React from 'react';
import { render } from '@testing-library/react-native';
import DirectionStep from '@/components/DirectionStep';
import { TransitStep } from '@/types/navigation';

const baseStep: TransitStep = {
  id: 's1',
  type: 'walk',
  from: 'Origin',
  to: 'Destination',
  duration: 5,
};

describe('DirectionStep nullability safeguards', () => {
  it('renders placeholder when step is null', () => {
    const { getByText } = render(<DirectionStep step={null} isLast />);
    expect(getByText('Step unavailable')).toBeTruthy();
    expect(getByText('Data missing')).toBeTruthy();
  });

  it('renders fallbacks for missing fields', () => {
    // @ts-expect-error intentionally omitting from/to to simulate bad data
    const incomplete: Partial<TransitStep> = { id: 's2', type: 'bus', duration: NaN };
    const { getByText } = render(<DirectionStep step={incomplete as TransitStep} isLast />);
    expect(getByText('Bus')).toBeTruthy();
    expect(getByText('Unknown start')).toBeTruthy();
    expect(getByText('Unknown destination')).toBeTruthy();
    expect(getByText('--')).toBeTruthy();
  });
});
