import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { v4 as uuidv4 } from 'uuid';

export type SafeZone = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
};

export default function SafeZoneManager() {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("100");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim() || !latitude || !longitude || !radius) return;
    const zone: SafeZone = {
      id: editingId || uuidv4(),
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseInt(radius, 10),
    };
    if (editingId) {
      setSafeZones(zones => zones.map(z => z.id === editingId ? zone : z));
      setEditingId(null);
    } else {
      setSafeZones(zones => [...zones, zone]);
    }
    setName(""); setLatitude(""); setLongitude(""); setRadius("100");
  };

  const handleEdit = (zone: SafeZone) => {
    setEditingId(zone.id);
    setName(zone.name);
    setLatitude(zone.latitude.toString());
    setLongitude(zone.longitude.toString());
    setRadius(zone.radius.toString());
  };

  const handleDelete = (id: string) => {
    setSafeZones(zones => zones.filter(z => z.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safe Zones</Text>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Radius (m)" value={radius} onChangeText={setRadius} keyboardType="numeric" />
        <Button title={editingId ? "Save Changes" : "Add Safe Zone"} onPress={handleSave} />
      </View>
      <FlatList
        data={safeZones}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.zoneRow}>
            <Text style={styles.zoneText}>{item.name} ({item.radius}m)</Text>
            <Button title="Edit" onPress={() => handleEdit(item)} />
            <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No safe zones yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'column', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  zoneText: { flex: 1, fontSize: 16 },
  empty: { color: '#888', textAlign: 'center', marginTop: 32 },
});
