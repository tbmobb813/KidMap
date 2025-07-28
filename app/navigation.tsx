// app/navigation.tsx - Active navigation for kids
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { RouteOption } from '@/utils/routePlanner';
import KidMap from '@/components/KidMap';
import { MapPin, Navigation, Phone, Home, AlertTriangle, Pause, Play } from 'lucide-react-native';
import AccessibleButton from '@/components/AccessibleButton';
import useLocation from '@/hooks/useLocation';
import { useNavigationStore } from '@/stores/navigationStore';
import { useGamificationStore } from '@/stores/gamificationStore';

const { height: screenHeight } = Dimensions.get('window');

export default function NavigationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { location } = useLocation();
  const { activeRoute, clearActiveRoute } = useNavigationStore();
  const { safetyContacts, completeTrip } = useGamificationStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const [startTime] = useState(new Date());

  // Parse route from params if not in store
  const route: RouteOption | null = activeRoute || 
    (params.route ? JSON.parse(params.route as string) : null);

  const currentStep = route?.steps[currentStepIndex];
  const isLastStep = currentStepIndex === (route?.steps.length || 0) - 1;

  useEffect(() => {
    // Auto-advance steps based on location (simplified for demo)
    const interval = setInterval(() => {
      if (!isPaused && route && currentStepIndex < route.steps.length - 1) {
        // In a real app, this would be based on GPS proximity to step completion
        if (Math.random() > 0.9) { // Simulate step completion
          setCurrentStepIndex(prev => prev + 1);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, currentStepIndex, route]);

  const handleStepComplete = () => {
    if (isLastStep) {
      handleTripComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleTripComplete = () => {
    const tripDuration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
    
    completeTrip({
      destination: 'destination', // Would get from route
      duration: tripDuration,
      mode: route?.mode === 'bicycling' ? 'walking' : (route?.mode || 'walking') as 'walking' | 'transit' | 'combined',
      safety: route?.safety || 3,
    });

    Alert.alert(
      '🎉 Great Job!',
      `You made it safely! Trip took ${tripDuration} minutes.`,
      [
        {
          text: 'Awesome!',
          onPress: () => {
            clearActiveRoute();
            router.replace('/tabs/');
          },
        },
      ]
    );
  };

  const handleEmergency = () => {
    setShowEmergencyOptions(!showEmergencyOptions);
  };

  const callEmergencyContact = (contact: any) => {
    Alert.alert(
      'Call Emergency Contact',
      `Call ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            // In a real app, would initiate phone call
            Alert.alert('Calling...', `Calling ${contact.name} at ${contact.phone}`);
          }
        },
      ]
    );
  };

  if (!route) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active route</Text>
        <AccessibleButton
          title="Go Home"
          onPress={() => router.replace('/tabs/')}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <KidMap
          userLocation={location ? {
            latitude: location.latitude,
            longitude: location.longitude,
          } : undefined}
          route={route.route}
          showUserLocation={true}
          followUserLocation={true}
        />
        
        {/* Emergency Button Overlay */}
        <Pressable
          style={styles.emergencyButton}
          onPress={handleEmergency}
        >
          <AlertTriangle size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Navigation Instructions */}
      <View style={styles.instructionsContainer}>
        {/* Current Step */}
        <View style={styles.currentStep}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepCounter}>
              Step {currentStepIndex + 1} of {route.steps.length}
            </Text>
            <Pressable
              style={styles.pauseButton}
              onPress={() => setIsPaused(!isPaused)}
            >
              {isPaused ? 
                <Play size={16} color={Colors.primary} /> :
                <Pause size={16} color={Colors.primary} />
              }
            </Pressable>
          </View>
          
          <Text style={styles.instruction}>
            {currentStep?.instruction || 'Loading...'}
          </Text>
          
          <View style={styles.stepDetails}>
            <Text style={styles.stepDuration}>
              {currentStep?.duration} minutes
            </Text>
            {currentStep?.distance && (
              <Text style={styles.stepDistance}>
                {currentStep.distance}m
              </Text>
            )}
            {currentStep?.transitLine && (
              <View style={styles.transitBadge}>
                <Text style={styles.transitText}>
                  {currentStep.transitLine}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStepIndex + 1) / route.steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(((currentStepIndex + 1) / route.steps.length) * 100)}% Complete
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <AccessibleButton
            title={isLastStep ? "I'm Here!" : "Next Step"}
            onPress={handleStepComplete}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </View>

      {/* Emergency Options Modal */}
      {showEmergencyOptions && (
        <View style={styles.emergencyModal}>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency Options</Text>
            
            <View style={styles.emergencyButtons}>
              <AccessibleButton
                title="Call Home"
                onPress={() => callEmergencyContact({ name: 'Home', phone: '000-000-0000' })}
                variant="outline"
              />
              
              {safetyContacts.slice(0, 2).map((contact, index) => (
                <AccessibleButton
                  key={index}
                  title={`Call ${contact.name}`}
                  onPress={() => callEmergencyContact(contact)}
                  variant="outline"
                />
              ))}
              
              <AccessibleButton
                title="Cancel Trip"
                onPress={() => {
                  Alert.alert(
                    'Cancel Trip?',
                    'Are you sure you want to cancel navigation?',
                    [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Yes', 
                        style: 'destructive',
                        onPress: () => {
                          clearActiveRoute();
                          router.replace('/tabs/');
                        }
                      },
                    ]
                  );
                }}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
            
            <AccessibleButton
              title="Close"
              onPress={() => setShowEmergencyOptions(false)}
              variant="primary"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 2,
    position: 'relative',
  },
  emergencyButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  instructionsContainer: {
    flex: 1,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    minHeight: screenHeight * 0.3,
  },
  currentStep: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  pauseButton: {
    padding: 4,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  stepDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDuration: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stepDistance: {
    fontSize: 14,
    color: Colors.textLight,
  },
  transitBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  transitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  nextButton: {
    flex: 1,
  },
  emergencyModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emergencyContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  emergencyButtons: {
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    margin: 20,
  },
});
