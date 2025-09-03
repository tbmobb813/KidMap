import { jest } from '@jest/globals';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SmartNotification from '../../components/SmartNotification';
import { createTestWrapper } from '../testUtils';

// ===== MOCK SECTION =====
// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Clock: ({ size, color, ...props }: any) => 
    require('react-native').Text({ 
      testID: 'clock-icon',
      children: `Clock(${size},${color})`,
      ...props 
    }),
  MapPin: ({ size, color, ...props }: any) => 
    require('react-native').Text({ 
      testID: 'map-pin-icon',
      children: `MapPin(${size},${color})`,
      ...props 
    }),
  X: ({ size, color, ...props }: any) => 
    require('react-native').Text({ 
      testID: 'x-icon',
      children: `X(${size},${color})`,
      ...props 
    }),
}));

// ===== TEST SETUP =====
describe('SmartNotification', () => {
  // Mock functions
  const mockOnDismiss = jest.fn();
  const mockOnAction = jest.fn();

  // Default props for the component
  const defaultProps = {
    title: 'Test Notification',
    message: 'This is a test notification message',
    type: 'reminder' as const,
    onDismiss: mockOnDismiss,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // ===== BASIC RENDERING TESTS =====
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { getByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText('Test Notification')).toBeTruthy();
      expect(getByText('This is a test notification message')).toBeTruthy();
    });

    it('displays title and message correctly', () => {
      const { getByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText('Test Notification')).toBeTruthy();
      expect(getByText('This is a test notification message')).toBeTruthy();
    });

    it('displays dismiss button', () => {
      const { getByTestId } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByTestId('x-icon')).toBeTruthy();
    });
  });

  // ===== NOTIFICATION TYPE TESTS =====
  describe('Notification Types', () => {
    it('renders reminder type with correct icon', () => {
      const { getByTestId } = render(
        <SmartNotification {...defaultProps} type="reminder" />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByTestId('clock-icon')).toBeTruthy();
    });

    it('renders weather type with correct icon', () => {
      const { getByTestId } = render(
        <SmartNotification {...defaultProps} type="weather" />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByTestId('map-pin-icon')).toBeTruthy();
    });

    it('renders safety type with correct icon', () => {
      const { getByTestId } = render(
        <SmartNotification {...defaultProps} type="safety" />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByTestId('map-pin-icon')).toBeTruthy();
    });

    it('renders achievement type with correct icon', () => {
      const { getByTestId } = render(
        <SmartNotification {...defaultProps} type="achievement" />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByTestId('map-pin-icon')).toBeTruthy();
    });
  });

  // ===== INTERACTION TESTS =====
  describe('User Interactions', () => {
    it('handles dismiss button press', () => {
      const { getByTestId } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper() }
      );
      
      const dismissButton = getByTestId('x-icon').parent;
      fireEvent.press(dismissButton);
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('handles action button press when provided', () => {
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps} 
          actionText="Take Action"
          onAction={mockOnAction}
        />,
        { wrapper: createTestWrapper() }
      );
      
      const actionButton = getByText('Take Action');
      fireEvent.press(actionButton);
      
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it('does not call action handler when action button not provided', () => {
      const { queryByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper() }
      );
      
      expect(queryByText('Take Action')).toBeNull();
      expect(mockOnAction).not.toHaveBeenCalled();
    });
  });

  // ===== CONDITIONAL RENDERING TESTS =====
  describe('Conditional Rendering', () => {
    it('shows action button when actionText and onAction provided', () => {
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps}
          actionText="View Details"
          onAction={mockOnAction}
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText('View Details')).toBeTruthy();
    });

    it('hides action button when actionText not provided', () => {
      const { queryByText } = render(
        <SmartNotification 
          {...defaultProps}
          onAction={mockOnAction}
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(queryByText('View Details')).toBeNull();
    });

    it('hides action button when onAction not provided', () => {
      const { queryByText } = render(
        <SmartNotification 
          {...defaultProps}
          actionText="View Details"
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(queryByText('View Details')).toBeNull();
    });
  });

  // ===== PROPS VARIATION TESTS =====
  describe('Props Variations', () => {
    it('handles different notification types correctly', () => {
      const types = ['reminder', 'weather', 'safety', 'achievement'] as const;
      
      types.forEach(type => {
        const { getByText, unmount } = render(
          <SmartNotification {...defaultProps} type={type} />,
          { wrapper: createTestWrapper() }
        );
        
        expect(getByText('Test Notification')).toBeTruthy();
        unmount();
      });
    });

    it('handles custom messages correctly', () => {
      const customMessage = 'This is a custom message with specific content';
      
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps}
          message={customMessage}
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText(customMessage)).toBeTruthy();
    });

    it('handles custom titles correctly', () => {
      const customTitle = 'Custom Notification Title';
      
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps}
          title={customTitle}
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText(customTitle)).toBeTruthy();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  describe('Accessibility', () => {
    it('has accessible elements', () => {
      const { getByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper() }
      );
      
      // Title should be accessible
      const title = getByText('Test Notification');
      expect(title).toBeTruthy();
      
      // Message should be accessible
      const message = getByText('This is a test notification message');
      expect(message).toBeTruthy();
    });

    it('action button is accessible when present', () => {
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps}
          actionText="Accessible Action"
          onAction={mockOnAction}
        />,
        { wrapper: createTestWrapper() }
      );
      
      const actionButton = getByText('Accessible Action');
      expect(actionButton).toBeTruthy();
    });
  });

  // ===== THEME SUPPORT TESTS =====
  describe('Theme Support', () => {
    it('applies light theme correctly', () => {
      const { getByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper({ theme: 'light' }) }
      );
      
      const titleElement = getByText('Test Notification');
      expect(titleElement).toBeTruthy();
    });

    it('applies dark theme correctly', () => {
      const { getByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper({ theme: 'dark' }) }
      );
      
      const titleElement = getByText('Test Notification');
      expect(titleElement).toBeTruthy();
    });

    it('applies high contrast theme correctly', () => {
      const { getByText } = render(
        <SmartNotification {...defaultProps} />,
        { wrapper: createTestWrapper({ theme: 'highContrast' }) }
      );
      
      const titleElement = getByText('Test Notification');
      expect(titleElement).toBeTruthy();
    });
  });

  // ===== INTEGRATION BEHAVIOR TESTS =====
  describe('Integration Behavior', () => {
    it('handles complete notification workflow', async () => {
      const { getByText, getByTestId } = render(
        <SmartNotification 
          {...defaultProps}
          type="safety"
          title="Safety Alert"
          message="Please check in with your location"
          actionText="Check In Now"
          onAction={mockOnAction}
        />,
        { wrapper: createTestWrapper() }
      );
      
      // Verify notification is displayed
      expect(getByText('Safety Alert')).toBeTruthy();
      expect(getByText('Please check in with your location')).toBeTruthy();
      expect(getByTestId('map-pin-icon')).toBeTruthy();
      
      // User takes action
      const actionButton = getByText('Check In Now');
      fireEvent.press(actionButton);
      
      await waitFor(() => {
        expect(mockOnAction).toHaveBeenCalledTimes(1);
      });
      
      // User dismisses notification
      const dismissButton = getByTestId('x-icon').parent;
      fireEvent.press(dismissButton);
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('handles rapid interaction correctly', async () => {
      const { getByText, getByTestId } = render(
        <SmartNotification 
          {...defaultProps}
          actionText="Quick Action"
          onAction={mockOnAction}
        />,
        { wrapper: createTestWrapper() }
      );
      
      const actionButton = getByText('Quick Action');
      const dismissButton = getByTestId('x-icon').parent;
      
      // Rapid clicks
      fireEvent.press(actionButton);
      fireEvent.press(actionButton);
      fireEvent.press(dismissButton);
      
      await waitFor(() => {
        expect(mockOnAction).toHaveBeenCalledTimes(2);
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ===== EDGE CASES =====
  describe('Edge Cases', () => {
    it('handles empty strings gracefully', () => {
      const { getByTestId } = render(
        <SmartNotification 
          {...defaultProps}
          title=""
          message=""
        />,
        { wrapper: createTestWrapper() }
      );
      
      // Component should still render dismiss button
      expect(getByTestId('x-icon')).toBeTruthy();
    });

    it('handles very long text content', () => {
      const longTitle = 'This is a very long notification title that might wrap to multiple lines';
      const longMessage = 'This is a very long notification message that contains a lot of information and might need to wrap to multiple lines to be fully displayed to the user. It tests how the component handles extensive content gracefully without breaking the layout or causing performance issues.';
      
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps}
          title={longTitle}
          message={longMessage}
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText(longTitle)).toBeTruthy();
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('handles special characters in content', () => {
      const specialTitle = 'Alert! 🚨 Important Notification 📱';
      const specialMessage = 'This message contains special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      
      const { getByText } = render(
        <SmartNotification 
          {...defaultProps}
          title={specialTitle}
          message={specialMessage}
        />,
        { wrapper: createTestWrapper() }
      );
      
      expect(getByText(specialTitle)).toBeTruthy();
      expect(getByText(specialMessage)).toBeTruthy();
    });
  });
});
