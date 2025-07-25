
import React, { useState } from 'react';
import ParentDashboard from '../components/ParentDashboard';
import ParentLockScreen from '../components/ParentLockScreen';

const ParentDashboardScreen = () => {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? (
    <ParentDashboard />
  ) : (
    <ParentLockScreen onUnlock={() => setUnlocked(true)} />
  );
};

export default ParentDashboardScreen;
