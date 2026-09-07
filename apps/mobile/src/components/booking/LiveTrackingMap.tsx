import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { GeoLocation } from "@/types";
import { MapPin, Navigation } from "lucide-react-native";

interface LiveTrackingMapProps {
  customerCoords: { latitude: number; longitude: number };
  providerCoords: GeoLocation | null;
  isLoading?: boolean;
}

export default function LiveTrackingMap({
  customerCoords,
  providerCoords,
  isLoading = false,
}: LiveTrackingMapProps) {
  const [mapReady, setMapReady] = useState(false);

  // Region configuration for centering map between customer & provider
  const getMapRegion = () => {
    const lat1 = customerCoords.latitude;
    const lon1 = customerCoords.longitude;
    const lat2 = providerCoords?.latitude ?? (customerCoords.latitude - 0.005);
    const lon2 = providerCoords?.longitude ?? (customerCoords.longitude - 0.005);

    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;

    const deltaLat = Math.abs(lat1 - lat2) * 1.5 || 0.01;
    const deltaLon = Math.abs(lon1 - lon2) * 1.5 || 0.01;

    return {
      latitude: midLat,
      longitude: midLon,
      latitudeDelta: Math.max(deltaLat, 0.015),
      longitudeDelta: Math.max(deltaLon, 0.015),
    };
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark-900 items-center justify-center rounded-3xl border border-dark-800">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-dark-400 text-sm mt-3 font-semibold">Initializing live map coordinates...</Text>
      </View>
    );
  }

  const providerLat = providerCoords?.latitude;
  const providerLon = providerCoords?.longitude;

  return (
    <View className="flex-1 overflow-hidden rounded-3xl border border-dark-800 bg-dark-900">
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={getMapRegion()}
        onMapReady={() => setMapReady(true)}
        customMapStyle={darkMapStyle}
      >
        {/* Customer Location Marker */}
        <Marker
          coordinate={customerCoords}
          title="Your Location"
          description="Service delivery address"
        >
          <View className="w-10 h-10 bg-primary-950/80 border border-primary-500 rounded-full items-center justify-center shadow-lg shadow-primary-500/55">
            <MapPin size={18} color="#8b5cf6" />
          </View>
        </Marker>

        {/* Provider Live Moving Marker */}
        {providerCoords && (
          <Marker
            coordinate={{
              latitude: providerCoords.latitude,
              longitude: providerCoords.longitude,
            }}
            title="Service Professional"
            description="En route to your location"
            flat
          >
            <View 
              style={{
                transform: [{ rotate: `${providerCoords.heading || 0}deg` }]
              }}
              className="w-10 h-10 bg-secondary-950/80 border border-secondary-500 rounded-full items-center justify-center shadow-lg shadow-secondary-500/55"
            >
              <Navigation size={18} color="#14b8a6" />
            </View>
          </Marker>
        )}

        {/* Path Polyline Overlay */}
        {providerCoords && (
          <Polyline
            coordinates={[
              customerCoords,
              {
                latitude: providerCoords.latitude,
                longitude: providerCoords.longitude,
              },
            ]}
            strokeColor="#8b5cf6"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      {/* Map loading placeholder overlay */}
      {!mapReady && (
        <View style={StyleSheet.absoluteFillObject} className="bg-dark-950 items-center justify-center">
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text className="text-dark-400 text-sm mt-3 font-semibold">Loading Map View...</Text>
        </View>
      )}
    </View>
  );
}

// Sleek Custom Dark Map Styling for premium Glassmorphism look
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#0f172a" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#475569" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#0f172a" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#0f172a" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#334155" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#020617" }]
  }
];
