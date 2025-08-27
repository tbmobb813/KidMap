import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import SmartNotification from '@/components/SmartNotification';
import Colors from '@/constants/colors';
import { addInAppBannerListener } from '@/utils/notifications';

type Banner = {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'weather' | 'safety' | 'achievement';
};

const InAppNotificationHost: React.FC<{ testId?: string }> = ({ testId }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const unsub = addInAppBannerListener((b) => {
      setBanners((prev) => [b, ...prev].slice(0, 3));
    });
    return unsub;
  }, []);

  const handleDismiss = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper} testID={testId ?? 'inapp-banner-host'}>
      {banners.map((b) => (
        <SmartNotification
          key={b.id}
          title={b.title}
          message={b.message}
          type={b.type}
          onDismiss={() => handleDismiss(b.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
});

export default InAppNotificationHost;
