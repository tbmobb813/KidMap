import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kidmap.navigation.v1';
const VERSION = 1;

export interface PersistedState {
    version: number;
    favorites: any[];
    recentSearches: any[];
    accessibilitySettings: any;
    photoCheckIns: any[];
    selectedTravelMode: string;
    routeOptions: any;
}

export async function loadPersistedState(): Promise<PersistedState | null> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        if (parsed.version !== VERSION) return null; // simple migration gate
        return parsed as PersistedState;
    } catch {
        return null;
    }
}

export async function savePersistedState(partial: Omit<PersistedState, 'version'>) {
    try {
        const outbound: PersistedState = { version: VERSION, ...partial } as PersistedState;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(outbound));
    } catch {
        // swallow for now; could add error logging later
    }
}
