import { waitFor } from '@testing-library/react-native';

import React from 'react';

// Mock useDebounce at module load time so components will use the mocked implementation
jest.doMock('@/hooks/useDebounce', () => ({ useDebounce: (v: any) => v }));

// Mock FlatList to render items synchronously in tests (react-native FlatList may not
// render items in the test renderer environment). Preserve other react-native exports.
jest.doMock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const ReactInner = require('react');
  const FlatList = ({ data = [], renderItem, keyExtractor }: any) =>
    ReactInner.createElement(
      RN.View,
      null,
      data.slice(0, 5).map((item: any) =>
        ReactInner.createElement(
          RN.View,
          { key: keyExtractor ? keyExtractor(item) : item.id },
          renderItem({ item })
        )
      )
    );
  return { ...RN, FlatList };
});

import { render, fireEvent } from '../testUtils';

const SearchWithSuggestions = require('@/components/SearchWithSuggestions').default;

describe('SearchWithSuggestions', () => {
  it('shows suggestions when value and suggestions provided and calls onSelectSuggestion', async () => {
    const onChangeText = jest.fn();
    const onSelectSuggestion = jest.fn();

    const suggestions = [
      { id: '1', text: 'One', type: 'recent' },
      { id: '2', text: 'Two', type: 'place' },
    ] as any;

    const { getByText, getByPlaceholderText } = render(
      <SearchWithSuggestions
        value={'One'}
        onChangeText={onChangeText}
        onSelectSuggestion={onSelectSuggestion}
        placeholder={'Search'}
        suggestions={suggestions}
      />
    );

    expect(getByPlaceholderText('Search')).toBeTruthy();
    // Wait for effect to set showSuggestions and render items
    await waitFor(() => expect(getByText('One')).toBeTruthy());

    fireEvent.press(getByText('One'));
    expect(onSelectSuggestion).toHaveBeenCalled();
  });
});
