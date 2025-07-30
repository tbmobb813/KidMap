import { act } from 'react-test-renderer';
import { useSafeZoneStore } from '@/stores/safeZoneStore';
import { SafeZone } from '@/components/SafeZoneManager';

describe('SafeZone Store', () => {
  const mockZone: SafeZone = {
    id: 'zone-1',
    name: 'Test Zone',
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 100,
    isActive: true,
  };

  beforeEach(() => {
    const { resetStore } = useSafeZoneStore.getState();
    if (resetStore) resetStore();
    else useSafeZoneStore.setState({ safeZones: [] });
  });

  it('should add a safe zone', async () => {
    const { addSafeZone } = useSafeZoneStore.getState();

    await act(async () => {
      await addSafeZone(mockZone);
    });

    const zones = useSafeZoneStore.getState().safeZones;
    expect(zones).toHaveLength(1);
    expect(zones[0].id).toBe('zone-1');
  });

  it('should remove a safe zone by ID', async () => {
    const { addSafeZone, removeSafeZone } = useSafeZoneStore.getState();

    await act(async () => {
      await addSafeZone(mockZone);
      await removeSafeZone('zone-1');
    });

    const zones = useSafeZoneStore.getState().safeZones;
    expect(zones).toHaveLength(0);
  });

  it('should update a safe zone by ID', async () => {
    const { addSafeZone, updateSafeZone, getSafeZoneById } = useSafeZoneStore.getState();

    const updatedZone: SafeZone = { ...mockZone, name: 'Updated Zone' };

    await act(async () => {
      await addSafeZone(mockZone);
      await updateSafeZone(updatedZone);
    });

    const zone = getSafeZoneById('zone-1');
    expect(zone?.name).toBe('Updated Zone');
  });

  it('should get a zone by ID', async () => {
    const { addSafeZone, getSafeZoneById } = useSafeZoneStore.getState();

    await act(async () => {
      await addSafeZone(mockZone);
    });

    const zone = getSafeZoneById('zone-1');
    expect(zone).toBeDefined();
    expect(zone?.id).toBe('zone-1');
  });
});
