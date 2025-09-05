module.exports = {
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
};