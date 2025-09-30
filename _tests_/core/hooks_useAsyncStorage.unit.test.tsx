import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { Text, Pressable } from 'react-native';

// Mock AsyncStorage default export
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.doMock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: mockRemoveItem,
  }
}));

// Require the module under test after mocking so Jest doesn't hoist the import
const { useAsyncStorage } = require('@/hooks/useAsyncStorage');

function HookHarness({ hookKey, defaultValue }: { hookKey: string; defaultValue?: any }) {
  const hook = useAsyncStorage(hookKey, defaultValue);

  return (
    <>
      <Text testID="data">{JSON.stringify(hook.data)}</Text>
      <Text testID="loading">{String(hook.loading)}</Text>
      <Text testID="error">{hook.error || ''}</Text>
      <Pressable testID="set" onPress={() => hook.setData(defaultValue ? defaultValue : { c: 3 })} />
      <Pressable testID="remove" onPress={() => hook.removeData()} />
      <Pressable testID="refresh" onPress={() => hook.refresh()} />
    </>
  );
}

describe('useAsyncStorage hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads data from AsyncStorage when present', async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ a: 1 }));

    const { getByTestId } = render(<HookHarness hookKey="key1" />);

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));

    expect(getByTestId('error').props.children).toBe('');
    expect(JSON.parse(getByTestId('data').props.children)).toEqual({ a: 1 });
  });

  it('returns defaultValue when AsyncStorage errors', async () => {
    mockGetItem.mockRejectedValueOnce(new Error('fail'));

    const { getByTestId } = render(<HookHarness hookKey="key2" defaultValue={{ b: 2 }} />);

    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));

    expect(getByTestId('error').props.children).toMatch(/Failed to load/);
    expect(JSON.parse(getByTestId('data').props.children)).toEqual({ b: 2 });
  });

  it('setData persists to AsyncStorage and updates state', async () => {
    mockGetItem.mockResolvedValueOnce(null);

    const { getByTestId } = render(<HookHarness hookKey="key3" />);
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));

    await act(async () => {
      fireEvent.press(getByTestId('set'));
    });

    expect(mockSetItem).toHaveBeenCalledWith('key3', JSON.stringify({ c: 3 }));
    expect(JSON.parse(getByTestId('data').props.children)).toEqual({ c: 3 });
  });

  it('removeData clears storage and data state', async () => {
    mockGetItem.mockResolvedValueOnce(JSON.stringify({ d: 4 }));

    const { getByTestId } = render(<HookHarness hookKey="key4" />);
    await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));

    await act(async () => {
      fireEvent.press(getByTestId('remove'));
    });

    expect(mockRemoveItem).toHaveBeenCalledWith('key4');
    expect(getByTestId('data').props.children).toBe('null');
  });
});
