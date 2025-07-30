import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import Colors from '@/constants/colors';
import SafetyErrorBoundary from './SafetyErrorBoundary';

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive?: boolean;
}

// Input validation utilities
const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  // Check for potentially harmful characters
  if (!/^[a-zA-Z0-9\s\-_'.,()]+$/.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  return { isValid: true };
};

const validateLatitude = (lat: string): { isValid: boolean; error?: string; value?: number } => {
  if (!lat.trim()) {
    return { isValid: false, error: 'Latitude is required' };
  }
  const numLat = parseFloat(lat);
  if (isNaN(numLat)) {
    return { isValid: false, error: 'Latitude must be a valid number' };
  }
  if (numLat < -90 || numLat > 90) {
    return { isValid: false, error: 'Latitude must be between -90 and 90' };
  }
  return { isValid: true, value: numLat };
};

const validateLongitude = (lng: string): { isValid: boolean; error?: string; value?: number } => {
  if (!lng.trim()) {
    return { isValid: false, error: 'Longitude is required' };
  }
  const numLng = parseFloat(lng);
  if (isNaN(numLng)) {
    return { isValid: false, error: 'Longitude must be a valid number' };
  }
  if (numLng < -180 || numLng > 180) {
    return { isValid: false, error: 'Longitude must be between -180 and 180' };
  }
  return { isValid: true, value: numLng };
};

const validateRadius = (radius: string): { isValid: boolean; error?: string; value?: number } => {
  if (!radius.trim()) {
    return { isValid: false, error: 'Radius is required' };
  }
  const numRadius = parseInt(radius, 10);
  if (isNaN(numRadius)) {
    return { isValid: false, error: 'Radius must be a valid number' };
  }
  if (numRadius < 10) {
    return { isValid: false, error: 'Radius must be at least 10 meters' };
  }
  if (numRadius > 10000) {
    return { isValid: false, error: 'Radius must be less than 10,000 meters' };
  }
  return { isValid: true, value: numRadius };
};

export default function SafeZoneManager() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('100');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const clearForm = () => {
    setName('');
    setLatitude('');
    setLongitude('');
    setRadius('100');
    setEditingId(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error!;
    }

    const latValidation = validateLatitude(latitude);
    if (!latValidation.isValid) {
      newErrors.latitude = latValidation.error!;
    }

    const lngValidation = validateLongitude(longitude);
    if (!lngValidation.isValid) {
      newErrors.longitude = lngValidation.error!;
    }

    const radiusValidation = validateRadius(radius);
    if (!radiusValidation.isValid) {
      newErrors.radius = radiusValidation.error!;
    }

    // Check for duplicate names (excluding current editing zone)
    const duplicateName = safeZones.find(zone => 
      zone.name.toLowerCase() === name.trim().toLowerCase() && 
      zone.id !== editingId
    );
    if (duplicateName) {
      newErrors.name = 'A safe zone with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const zone: SafeZone = {
        id: editingId || uuidv4(),
        name: name.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius, 10),
        isActive: true,
      };

      if (editingId) {
        setSafeZones((zones) => zones.map((z) => (z.id === editingId ? zone : z)));
        Alert.alert('Success', 'Safe zone updated successfully');
      } else {
        setSafeZones((zones) => [...zones, zone]);
        Alert.alert('Success', 'Safe zone created successfully');
      }
      
      clearForm();
    } catch (error) {
      console.error('Error saving safe zone:', error);
      Alert.alert('Error', 'Failed to save safe zone. Please try again.');
    }
  };

  const handleEdit = (zone: SafeZone) => {
    setEditingId(zone.id);
    setName(zone.name);
    setLatitude(zone.latitude.toString());
    setLongitude(zone.longitude.toString());
    setRadius(zone.radius.toString());
    setErrors({});
  };

  const handleDelete = (id: string) => {
    const zone = safeZones.find(z => z.id === id);
    Alert.alert(
      'Delete Safe Zone',
      `Are you sure you want to delete "${zone?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            try {
              setSafeZones((zones) => zones.filter((z) => z.id !== id));
              Alert.alert('Success', 'Safe zone deleted successfully');
            } catch (error) {
              console.error('Error deleting safe zone:', error);
              Alert.alert('Error', 'Failed to delete safe zone. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafetyErrorBoundary componentName="Safe Zone Manager">
      <View style={styles.container}>
        <Text style={styles.title}>Safe Zones</Text>
        <View style={styles.inputRow}>
          <TextInput 
            style={[styles.input, errors.name ? styles.inputError : null]} 
            placeholder="Name" 
            value={name} 
            onChangeText={setName} 
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <TextInput
            style={[styles.input, errors.latitude ? styles.inputError : null]}
            placeholder="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
          {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
          
          <TextInput
            style={[styles.input, errors.longitude ? styles.inputError : null]}
            placeholder="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />
          {errors.longitude && <Text style={styles.errorText}>{errors.longitude}</Text>}
          
          <TextInput
            style={[styles.input, errors.radius ? styles.inputError : null]}
            placeholder="Radius (m)"
            value={radius}
            onChangeText={setRadius}
            keyboardType="numeric"
          />
          {errors.radius && <Text style={styles.errorText}>{errors.radius}</Text>}
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {editingId ? 'Save Changes' : 'Add Safe Zone'}
            </Text>
          </TouchableOpacity>
          
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {safeZones.length === 0 ? (
          <Text style={styles.empty}>No safe zones yet.</Text>
        ) : (
          safeZones.map((item) => (
            <View key={item.id} style={styles.zoneRow}>
              <Text style={styles.zoneText}>
                {item.name} ({item.radius}m)
              </Text>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </SafetyErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: Colors.background 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 16,
    color: Colors.text.primary
  },
  inputRow: { 
    flexDirection: 'column', 
    marginBottom: 16 
  },
  input: { 
    borderWidth: 1, 
    borderColor: Colors.border, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8,
    backgroundColor: Colors.card,
    color: Colors.text.primary
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.textLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  zoneRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 8,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  zoneText: { 
    flex: 1, 
    fontSize: 16,
    color: Colors.text.primary
  },
  editButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  editButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  empty: { 
    color: Colors.textLight, 
    textAlign: 'center', 
    marginTop: 32,
    fontSize: 16,
  },
});
