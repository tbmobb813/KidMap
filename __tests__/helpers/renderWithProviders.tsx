// __tests__/helpers/renderWithProviders.tsx - Enhanced render utility with all app providers
import React from 'react'
import { render, RenderOptions } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock providers for stores that use Zustand
const MockStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>
}

// Mock navigation container for tests that need navigation
const MockNavigationContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <NavigationContainer>{children}</NavigationContainer>
}

// Default render function with basic providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions,
) => {
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <SafeAreaProvider>
        <MockStoreProvider>{children}</MockStoreProvider>
      </SafeAreaProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Render with navigation for components that use navigation
export const renderWithNavigation = (
  ui: React.ReactElement,
  options?: RenderOptions,
) => {
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <SafeAreaProvider>
        <MockNavigationContainer>
          <MockStoreProvider>{children}</MockStoreProvider>
        </MockNavigationContainer>
      </SafeAreaProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Render with React Query for components that use queries
export const renderWithQuery = (
  ui: React.ReactElement,
  options?: RenderOptions,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Disable garbage collection for tests
      },
    },
  })

  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <MockStoreProvider>{children}</MockStoreProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Full render with all providers for integration tests
export const renderWithAllProviders = (
  ui: React.ReactElement,
  options?: RenderOptions,
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <MockNavigationContainer>
            <MockStoreProvider>{children}</MockStoreProvider>
          </MockNavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Custom render with specific initial state
export const renderWithCustomState = (
  ui: React.ReactElement,
  customState?: any,
  options?: RenderOptions,
) => {
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <SafeAreaProvider>
        <MockStoreProvider>{children}</MockStoreProvider>
      </SafeAreaProvider>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Accessibility testing render
export const renderWithAccessibility = (
  ui: React.ReactElement,
  options?: RenderOptions,
) => {
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return (
      <SafeAreaProvider>
        <MockStoreProvider>{children}</MockStoreProvider>
      </SafeAreaProvider>
    )
  }

  const result = render(ui, { wrapper: AllTheProviders, ...options })
  return result
}

// Export the default render as well
export { render } from '@testing-library/react-native'

// Re-export testing utilities
export * from '@testing-library/react-native'

// Default export for backwards compatibility
export default renderWithProviders
