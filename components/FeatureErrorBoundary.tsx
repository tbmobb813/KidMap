import React from 'react';

import ErrorBoundary from '@/components/ErrorBoundary';

// Simple wrapper allowing per-feature fallback customization later
const FeatureErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default FeatureErrorBoundary;
