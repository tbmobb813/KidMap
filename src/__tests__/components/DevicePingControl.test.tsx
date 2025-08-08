import { render, fireEvent, waitFor } from '@testing-library/react-native'

describe('DevicePingControl Component', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
  }

  it('renders correctly when visible', () => {
    const { getByText } = render(<DevicePingControl {...defaultProps} />)
    expect(getByText('Device Control')).toBeTruthy()
    expect(getByText('Quick Actions')).toBeTruthy()
  })

  it('renders all quick action buttons', () => {
    const { getByText } = render(<DevicePingControl {...defaultProps} />)
    expect(getByText('Ring Device')).toBeTruthy()
    expect(getByText('Get Location')).toBeTruthy()
    expect(getByText('Check-in')).toBeTruthy()
    expect(getByText('Emergency')).toBeTruthy()
  })

  it('handles ring device button press', async () => {
    const { getByText } = render(<DevicePingControl {...defaultProps} />)
    const ringButton = getByText('Ring Device')

    fireEvent.press(ringButton)

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Ping Sent',
        "Your ring request has been sent to your child's device.",
        expect.any(Array),
      )
    })
  })

  it('displays empty state when no pending requests', () => {
    const { getByText } = render(<DevicePingControl {...defaultProps} />)
    expect(getByText('No pending requests')).toBeTruthy()
    expect(getByText('Your child has responded to all pings')).toBeTruthy()
  })
})
