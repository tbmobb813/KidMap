describe('DevicePingManager', () => {
    it('should initialize properly', async () => {
      await devicePingManager.initialize();
      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });

    it('should send a ring ping', async () => {
      const pingId = await devicePingManager.ringChild('Test ring message');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should send a location request', async () => {
      const pingId = await devicePingManager.requestLocation('Where are you?');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should send a check-in request', async () => {
      const pingId = await devicePingManager.requestCheckIn('How are you doing?');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should send an emergency ping', async () => {
      const pingId = await devicePingManager.sendEmergencyPing('Emergency! Respond now!');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should track pending requests', async () => {
      await devicePingManager.ringChild('Test ping');
      const pendingRequests = devicePingManager.getPendingRequests();
      expect(pendingRequests.length).toBeGreaterThan(0);
      expect(pendingRequests[0].type).toBe('ring');
    });

    it('should maintain ping history', async () => {
      await devicePingManager.requestCheckIn('Test check-in');
      const history = devicePingManager.getPingHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle location permission denied gracefully', async () => {
      // Mock permission denied
      const mockLocation = require('expo-location');
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      
      await devicePingManager.initialize();
      
      // Should not throw error, but log warning
      expect(true).toBe(true);
    });
  });
});