import { Bell, AlertTriangle, ExternalLink, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';

import { showDevelopmentBuildRecommendation } from '../utils/notification';

import { useTheme } from '@/constants/theme';
import { tint } from '@/utils/color';


type NotificationStatusCardProps = {
  testId?: string;
};

const NotificationStatusCard: React.FC<NotificationStatusCardProps> = ({ testId }) => {
  const theme = useTheme();
  const themedStyles = React.useMemo(() => createStyles(theme), [theme]);
  const isExpoGo = __DEV__ && Platform.OS !== 'web';
  const isWeb = Platform.OS === 'web';
  
  const getStatusInfo = () => {
    if (isWeb) {
      return {
        icon: <Bell size={20} color={theme.colors.primary} />,
        title: 'Web Notifications Active',
        description: 'Browser notifications are working normally',
        status: 'good' as const,
        showAction: false,
      };
    }
    
    if (isExpoGo) {
      return {
        icon: <AlertTriangle size={20} color={theme.colors.warning} />,
        title: 'Limited Notifications',
        description: 'Running in Expo Go - notifications shown as alerts only',
        status: 'warning' as const,
        showAction: true,
      };
    }
    
    return {
      icon: <CheckCircle size={20} color={theme.colors.success} />,
      title: 'Full Notifications Available',
      description: 'Push notifications are working normally',
      status: 'good' as const,
      showAction: false,
    };
  };
  
  const statusInfo = getStatusInfo();
  
  const handleLearnMore = () => {
    showDevelopmentBuildRecommendation();
  };
  
  return (
  <View style={[themedStyles.card, themedStyles[statusInfo.status]]} testID={testId}>
      <View style={themedStyles.header}>
        <View style={themedStyles.iconContainer}>
          {statusInfo.icon}
        </View>
        <View style={themedStyles.content}>
      <Text style={themedStyles.title}>{statusInfo.title}</Text>
      <Text style={themedStyles.description}>{statusInfo.description}</Text>
        </View>
      </View>
      
      {statusInfo.showAction && (
  <Pressable style={themedStyles.actionButton} onPress={handleLearnMore}>
          <ExternalLink size={16} color={theme.colors.primary} />
          <Text style={themedStyles.actionText}>
            Learn About Development Builds
          </Text>
        </Pressable>
      )}
      
      {isExpoGo && (
        <View style={themedStyles.infoBox}>
          <Text style={themedStyles.infoText}>
            💡 For production apps, use a development build for full notification support
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    padding: 16,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: tint(theme.colors.primary),
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  content: { flex: 1 },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    marginTop: 12,
    padding: 12,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  good: {},
  warning: {},
});


export default NotificationStatusCard;
