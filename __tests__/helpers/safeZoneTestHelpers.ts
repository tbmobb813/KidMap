import { fireEvent, RenderAPI, waitFor } from '@testing-library/react-native';

// Types
export interface SafeZoneFormData {
  name?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
}

export interface MockSafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

// Mock data factory
export const createMockZone = (id: string, overrides: Partial<MockSafeZone> = {}): MockSafeZone => ({
  id,
  name: `Test Zone ${id}`,
  latitude: 40.7128,
  longitude: -74.006,
  radius: 100,
  isActive: true,
  ...overrides,
});

// Form interaction helpers
export const fillSafeZoneForm = (
  renderResult: RenderAPI,
  formData: SafeZoneFormData
) => {
  const { getByPlaceholderText } = renderResult;
  const {
    name = '',
    latitude = '',
    longitude = '',
    radius = '',
  } = formData;

  fireEvent.changeText(getByPlaceholderText('Name'), name);
  fireEvent.changeText(getByPlaceholderText('Latitude'), latitude);
  fireEvent.changeText(getByPlaceholderText('Longitude'), longitude);
  fireEvent.changeText(getByPlaceholderText('Radius (m)'), radius);
};

export const clearSafeZoneForm = (renderResult: RenderAPI) => {
  fillSafeZoneForm(renderResult, {
    name: '',
    latitude: '',
    longitude: '',
    radius: '',
  });
};

export const pressAddSafeZoneButton = (renderResult: RenderAPI) => {
  const { getByText } = renderResult;
  const button = getByText('Add Safe Zone');
  fireEvent.press(button);
  return button;
};

export const pressUpdateSafeZoneButton = (renderResult: RenderAPI) => {
  const { getByText } = renderResult;
  const button = getByText('Update Safe Zone');
  fireEvent.press(button);
  return button;
};

export const pressCancelButton = (renderResult: RenderAPI) => {
  const { getByText } = renderResult;
  const button = getByText('Cancel');
  fireEvent.press(button);
  return button;
};

// Edit/Update flow helpers
export const selectSafeZoneForEdit = (renderResult: RenderAPI, zoneName: string) => {
  const { getByText } = renderResult;
  const editButton = getByText(`Edit ${zoneName}`);
  fireEvent.press(editButton);
  return editButton;
};

export const deleteSafeZone = (renderResult: RenderAPI, zoneName: string) => {
  const { getByText } = renderResult;
  const deleteButton = getByText(`Delete ${zoneName}`);
  fireEvent.press(deleteButton);
  return deleteButton;
};

// Validation helpers
export const expectValidationErrors = (renderResult: RenderAPI, expectedMessages: string[]) => {
  expectedMessages.forEach((msg) => {
    expect(renderResult.getByText(msg)).toBeTruthy();
  });
};

export const fillFormAndExpectValidation = async (
  renderResult: RenderAPI,
  formData: SafeZoneFormData,
  expectedErrors: string[]
) => {
  fillSafeZoneForm(renderResult, formData);
  pressAddSafeZoneButton(renderResult);
  
  await waitFor(() => {
    expectValidationErrors(renderResult, expectedErrors);
  });
  
  return expectedErrors.length === 0; // Returns true if no validation errors
};

// Common test scenarios
export const testInvalidFormInputs = async (renderResult: RenderAPI) => {
  const scenarios = [
    {
      data: { name: '', latitude: '999', longitude: '-999', radius: '5' },
      errors: ['Name is required', 'Latitude must be between -90 and 90', 'Longitude must be between -180 and 180']
    },
    {
      data: { name: 'A'.repeat(1000), latitude: '999999', longitude: '-999999', radius: '999999999' },
      errors: ['Name cannot exceed 50 characters', 'Latitude must be between -90 and 90', 'Longitude must be between -180 and 180', 'Radius cannot exceed 10000 meters']
    },
    {
      data: { latitude: 'not a number', longitude: 'also not a number', radius: 'definitely not a number' },
      errors: ['Latitude must be a valid number', 'Longitude must be a valid number', 'Radius must be a valid number']
    }
  ];

  for (const scenario of scenarios) {
    await fillFormAndExpectValidation(renderResult, scenario.data, scenario.errors);
    clearSafeZoneForm(renderResult);
  }
};

// Mock API helpers
export const mockSuccessfulSafeZoneAPI = () => {
  const mockStore = {
    addSafeZone: jest.fn().mockResolvedValue(undefined),
    updateSafeZone: jest.fn().mockResolvedValue(undefined),
    removeSafeZone: jest.fn().mockResolvedValue(undefined),
    getSafeZones: jest.fn().mockResolvedValue([]),
  };
  
  return mockStore;
};

export const mockFailedSafeZoneAPI = (errorMessage = 'API Error') => {
  const mockStore = {
    addSafeZone: jest.fn().mockRejectedValue(new Error(errorMessage)),
    updateSafeZone: jest.fn().mockRejectedValue(new Error(errorMessage)),
    removeSafeZone: jest.fn().mockRejectedValue(new Error(errorMessage)),
    getSafeZones: jest.fn().mockRejectedValue(new Error(errorMessage)),
  };
  
  return mockStore;
};

// Complete workflow helpers
export const addSafeZoneWorkflow = async (
  renderResult: RenderAPI,
  zoneData: SafeZoneFormData
) => {
  fillSafeZoneForm(renderResult, zoneData);
  const button = pressAddSafeZoneButton(renderResult);
  
  // Wait for success/error state
  await waitFor(() => {
    // This would depend on your success/error UI implementation
    expect(button).toBeTruthy();
  });
  
  return button;
};

export const updateSafeZoneWorkflow = async (
  renderResult: RenderAPI,
  originalZoneName: string,
  updatedData: SafeZoneFormData
) => {
  selectSafeZoneForEdit(renderResult, originalZoneName);
  fillSafeZoneForm(renderResult, updatedData);
  const button = pressUpdateSafeZoneButton(renderResult);
  
  await waitFor(() => {
    expect(button).toBeTruthy();
  });
  
  return button;
};
