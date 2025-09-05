import jest from 'jest-mock';

export default {
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
};