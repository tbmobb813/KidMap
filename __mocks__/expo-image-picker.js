/**
 * Mock for expo-image-picker module
 * Used in Jest tests to avoid native module dependencies
 */

/* global jest */

export const MediaTypeOptions = {
  All: 'All',
  Videos: 'Videos',
  Images: 'Images',
};

export const ImagePickerErrorCode = {
  UserCancel: 'UserCancel',
  PermissionDenied: 'PermissionDenied',
};

export const launchImageLibraryAsync = jest.fn(() =>
  Promise.resolve({
    canceled: false,
    assets: [
      {
        uri: 'file:///mock/image/path.jpg',
        width: 1920,
        height: 1080,
        type: 'image',
        fileSize: 123456,
      },
    ],
  })
);

export const launchCameraAsync = jest.fn(() =>
  Promise.resolve({
    canceled: false,
    assets: [
      {
        uri: 'file:///mock/camera/path.jpg',
        width: 1920,
        height: 1080,
        type: 'image',
        fileSize: 123456,
      },
    ],
  })
);

export const requestMediaLibraryPermissionsAsync = jest.fn(() =>
  Promise.resolve({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  })
);

export const requestCameraPermissionsAsync = jest.fn(() =>
  Promise.resolve({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  })
);

export const getMediaLibraryPermissionsAsync = jest.fn(() =>
  Promise.resolve({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  })
);

export const getCameraPermissionsAsync = jest.fn(() =>
  Promise.resolve({
    status: 'granted',
    expires: 'never',
    granted: true,
    canAskAgain: true,
  })
);

// Default export for * as ImagePicker imports
export default {
  MediaTypeOptions,
  ImagePickerErrorCode,
  launchImageLibraryAsync,
  launchCameraAsync,
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  getCameraPermissionsAsync,
};
