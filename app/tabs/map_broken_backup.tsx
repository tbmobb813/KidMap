import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import KidMap from '@/components/KidMap';
import RouteCard from '@/components/RouteCard';
import { useNavigationStore } from '@/stores/navigationStore';
import { Route } from '@/types/navigation';
import { fetchRoute, TravelMode, RouteResult } from '@/utils/api';
import { getNearbyTransitStations, TransitStation } from '@/utils/transitApi';
import { Navigation, MapPin, Search } from 'lucide-react-native';
import useLocation from '@/hooks/useLocation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const { location } = useLocation();

  const {
    origin,
    destination,
    selectedRoute,
    setOrigin,
    setDestination,
    selectRoute,
    clearRoute,
  } = useNavigationStore();

  const [travelMode, setTravelMode] = useState<TravelMode>('transit');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);
  const [nearbyStations, setNearbyStations] = useState<TransitStation[]>([]);
  const [loadingStations, setLoadingStati]()
