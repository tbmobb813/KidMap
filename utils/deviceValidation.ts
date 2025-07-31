import * as Device from 'expo-device'
import * as Location from 'expo-location'

export async function isMockLocation(): Promise<boolean> {
  if (Device.osName !== 'Android') return false
  try {
    const { mock } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    })
    return !!mock
  } catch {
    return false
  }
}

export function getDeviceInfo() {
  return {
    brand: Device.brand,
    modelName: Device.modelName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    deviceType: Device.deviceType,
    manufacturer: Device.manufacturer,
    deviceName: Device.deviceName,
    totalMemory: Device.totalMemory,
    yearClass: Device.yearClass,
    deviceId: Device.osBuildId || Device.deviceName || '',
  }
}
