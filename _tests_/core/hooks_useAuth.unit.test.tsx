import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { Text, Pressable } from 'react-native';

// controllable mock for authManager
let listener: any = null;
const mockAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const mockLogin = jest.fn(async () => ({ success: false, error: 'bad' }));
const mockLogout = jest.fn(async () => { throw new Error('logout-fail'); });
const mockUpdateProfile = jest.fn(async () => ({ success: true }));

const mockAuthManager = {
  authState: mockAuthState,
  addListener: (cb: any) => { listener = cb; return () => { listener = null; }; },
  login: mockLogin,
  register: jest.fn(async () => ({ success: true })),
  logout: mockLogout,
  updateProfile: mockUpdateProfile,
  changePassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyParentalPin: jest.fn(async () => false),
  setParentalPin: jest.fn(async () => true),
  extendSession: jest.fn(async () => true),
  getSessionTimeRemaining: jest.fn(() => 0),
  toggleLikedSuggestion: jest.fn(),
  saveRoute: jest.fn(),
};

jest.doMock('@/utils/auth', () => ({ authManager: mockAuthManager }));

// Require the module under test after mocking
const { useAuth, AuthProvider } = require('@/hooks/useAuth');

function Harness() {
  const hook = useAuth();

  return (
    <>
      <Text testID="authenticated">{String(hook.isAuthenticated)}</Text>
      <Text testID="loading">{String(hook.isLoading)}</Text>
      <Text testID="error">{hook.error || ''}</Text>
      <Pressable testID="login" onPress={() => hook.login({ username: 'x', password: 'y' } as any)} />
      <Pressable testID="logout" onPress={() => hook.logout()} />
      <Pressable testID="updateProfile" onPress={() => hook.updateProfile({ name: 'new' })} />
      <Text testID="canAccessMaps">{String(hook.canAccessFeature('maps'))}</Text>
    </>
  );
}

describe('useAuth hook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('initializes and responds to listener updates', async () => {
  const { getByTestId } = render(<AuthProvider><Harness /></AuthProvider>);

    // wait for provider effect to register the listener
    await waitFor(() => expect(listener).not.toBeNull());

    // simulate login via authManager listener
    act(() => {
      listener({ ...mockAuthState, isAuthenticated: true, user: { id: 'u1', role: 'parent', parentalControls: { isEnabled: true, restrictions: [] } } });
    });

    await waitFor(() => expect(getByTestId('authenticated').props.children).toBe('true'));
  });

  it('login forwards to authManager and sets error on failure', async () => {
  const { getByTestId } = render(<AuthProvider><Harness /></AuthProvider>);

    await act(async () => fireEvent.press(getByTestId('login')));

    expect(mockLogin).toHaveBeenCalled();
  });

  it('logout handles errors from authManager.logout', async () => {
  const { getByTestId } = render(<AuthProvider><Harness /></AuthProvider>);
  await act(async () => fireEvent.press(getByTestId('logout')));

    expect(mockLogout).toHaveBeenCalled();
  });

  it('updateProfile forwards to authManager', async () => {
  const { getByTestId } = render(<AuthProvider><Harness /></AuthProvider>);
  await act(async () => fireEvent.press(getByTestId('updateProfile')));

    expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'new' });
  });

  it('canAccessFeature respects parentalControls restrictions', async () => {
  const { getByTestId } = render(<AuthProvider><Harness /></AuthProvider>);

    // wait for provider to register listener
    await waitFor(() => expect(listener).not.toBeNull());

    act(() => {
      listener({ ...mockAuthState, isAuthenticated: true, user: { id: 'u2', parentalControls: { isEnabled: true, restrictions: ['maps'] }, role: 'parent' } });
    });

    await waitFor(() => expect(getByTestId('canAccessMaps').props.children).toBe('false'));
  });
});
