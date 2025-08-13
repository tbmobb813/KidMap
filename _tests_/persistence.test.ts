import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';

import { useNavigationStore } from '@/stores/navigationStore';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

function flush(ms = 0) { return new Promise(r => setTimeout(r, ms)); }

describe('navigationStore persistence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('persists favorites and hydrates them', async () => {
        const place: any = { id: 'favx', name: 'Fav X' };
        await act(async () => {
            useNavigationStore.getState().addToFavorites(place);
            await flush(350);
        });
        expect(AsyncStorage.setItem).toHaveBeenCalled();
        const stored = (AsyncStorage.setItem as any).mock.calls.pop()[1];
        expect(stored).toContain('favx');

        // simulate reload
        const saved = stored;
        (AsyncStorage.getItem as any).mockResolvedValueOnce(saved);
        await act(async () => { await useNavigationStore.getState().hydrate(); });
        expect(useNavigationStore.getState().favorites.find(f => f.id === 'favx')).toBeTruthy();
    });
});
