import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { tint } from '@/utils/color/color';

type SystemHealthMonitorProps = {
  testId?: string;
};

type HealthCheck = {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: number;
};

const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({ testId }) => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const { isConnected } = useNetworkStatus();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const runHealthChecks = useCallback(async () => {
    setIsRunningChecks(true);
    const checks: HealthCheck[] = [];
    const now = Date.now();

    // Network connectivity check
    checks.push({
      id: 'network',
      name: 'Network Connection',
      status: isConnected ? 'healthy' : 'error',
      message: isConnected ? 'Connected to internet' : 'No internet connection',
      lastChecked: now,
    });

    // Platform compatibility check
    const platformStatus = Platform.OS === 'web' ? 'warning' : 'healthy';
    checks.push({
      id: 'platform',
      name: 'Platform Compatibility',
      status: platformStatus,
      message: Platform.OS === 'web' 
        ? 'Running on web - some features limited' 
        : `Running on ${Platform.OS} - full features available`,
      lastChecked: now,
    });

    // Storage availability check
    try {
      if (Platform.OS !== 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('health_check', 'test');
        await AsyncStorage.removeItem('health_check');
        checks.push({
          id: 'storage',
          name: 'Local Storage',
          status: 'healthy',
          message: 'AsyncStorage working normally',
          lastChecked: now,
        });
      } else {
        localStorage.setItem('health_check', 'test');
        localStorage.removeItem('health_check');
        checks.push({
          id: 'storage',
          name: 'Local Storage',
          status: 'healthy',
          message: 'LocalStorage working normally',
          lastChecked: now,
        });
      }
    } catch {
      checks.push({
        id: 'storage',
        name: 'Local Storage',
        status: 'error',
        message: 'Storage access failed',
        lastChecked: now,
      });
    }

    // Location services check
    try {
      if (Platform.OS !== 'web') {
        const Location = require('expo-location');
        const { status } = await Location.getForegroundPermissionsAsync();
        checks.push({
          id: 'location',
          name: 'Location Services',
          status: status === 'granted' ? 'healthy' : 'warning',
          message: status === 'granted' 
            ? 'Location permissions granted' 
            : 'Location permissions needed for full functionality',
          lastChecked: now,
        });
      } else {
        const hasGeolocation = 'geolocation' in navigator;
        checks.push({
          id: 'location',
          name: 'Location Services',
          status: hasGeolocation ? 'healthy' : 'error',
          message: hasGeolocation 
            ? 'Geolocation API available' 
            : 'Geolocation not supported',
          lastChecked: now,
        });
      }
    } catch {
      checks.push({
        id: 'location',
        name: 'Location Services',
        status: 'error',
        message: 'Location services check failed',
        lastChecked: now,
      });
    }

    // Memory usage check (basic)
    const memoryStatus = Platform.OS === 'web' && (performance as any).memory 
      ? ((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) > 0.8 
        ? 'warning' 
        : 'healthy'
      : 'healthy';
    
    checks.push({
      id: 'memory',
      name: 'Memory Usage',
      status: memoryStatus,
      message: memoryStatus === 'warning' 
        ? 'High memory usage detected' 
        : 'Memory usage normal',
      lastChecked: now,
    });

    setHealthChecks(checks);
    setIsRunningChecks(false);
  }, [isConnected]);

  useEffect(() => {
    runHealthChecks();
    
    // Run health checks every 5 minutes
    const interval = setInterval(runHealthChecks, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isConnected, runHealthChecks]);

  const getOverallStatus = (): 'healthy' | 'warning' | 'error' => {
    if (healthChecks.some(check => check.status === 'error')) return 'error';
    if (healthChecks.some(check => check.status === 'warning')) return 'warning';
    return 'healthy';
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={16} color={theme.colors.success} />;
      case 'warning':
        return <AlertTriangle size={16} color={theme.colors.warning} />;
      case 'error':
        return <AlertTriangle size={16} color={theme.colors.error} />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
    }
  };

  const overallStatus = getOverallStatus();
  const errorCount = healthChecks.filter(check => check.status === 'error').length;
  const warningCount = healthChecks.filter(check => check.status === 'warning').length;

  return (
    <View style={styles.container} testID={testId}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          {getStatusIcon(overallStatus)}
          <Text style={[styles.statusText, { color: getStatusColor(overallStatus) }]}>
            System {overallStatus === 'healthy' ? 'Healthy' : overallStatus === 'warning' ? 'Issues Detected' : 'Errors Found'}
          </Text>
        </View>
        
        <Pressable 
          style={[styles.refreshButton, isRunningChecks && styles.refreshButtonDisabled]}
          onPress={runHealthChecks}
          disabled={isRunningChecks}
        >
          <RefreshCw 
            size={16} 
            color={isRunningChecks ? theme.colors.textSecondary : theme.colors.primary} 
            style={isRunningChecks ? styles.spinning : undefined}
          />
        </Pressable>
      </View>

      {(errorCount > 0 || warningCount > 0) && (
        <View style={styles.summary}>
          {errorCount > 0 && (
            <Text style={styles.errorSummary}>
              {errorCount} error{errorCount > 1 ? 's' : ''} found
            </Text>
          )}
          {warningCount > 0 && (
            <Text style={styles.warningSummary}>
              {warningCount} warning{warningCount > 1 ? 's' : ''} found
            </Text>
          )}
        </View>
      )}

      <View style={styles.checksList}>
        {healthChecks.map((check) => (
          <View key={check.id} style={styles.checkItem}>
            <View style={styles.checkHeader}>
              {getStatusIcon(check.status)}
              <Text style={styles.checkName}>{check.name}</Text>
            </View>
            <Text style={styles.checkMessage}>{check.message}</Text>
            <Text style={styles.checkTime}>
              Last checked: {new Date(check.lastChecked).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>

      {overallStatus === 'error' && (
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Recommended Actions:</Text>
          <Text style={styles.actionText}>
            • Check your internet connection{'\n'}
            • Restart the app if issues persist{'\n'}
            • Contact support if problems continue
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  actionSection: {
    backgroundColor: tint(theme.colors.error),
    borderColor: theme.colors.error + '30',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actionTitle: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  checkHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  checkItem: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    padding: 12,
  },
  checkMessage: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  checkName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  checkTime: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  checksList: {
    gap: 8,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
  },
  errorSummary: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    padding: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  spinning: {
    // Note: CSS animation would be needed for web, this is just a placeholder
  },
  statusIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    marginBottom: 12,
    padding: 8,
  },
  warningSummary: {
    color: theme.colors.warning,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SystemHealthMonitor;
