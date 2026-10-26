import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { GeoLocation } from "../../types";
import { MapPin, Navigation, Locate, Bike } from "lucide-react-native";
import { LocationService } from "../../services/location.service";

interface LiveTrackingMapProps {
  customerCoords: { latitude: number; longitude: number };
  providerCoords: GeoLocation | null;
  isLoading?: boolean;
  statusText?: string;
  vehicleNumber?: string;
}

export default function LiveTrackingMap({
  customerCoords,
  providerCoords,
  isLoading = false,
  statusText = "Partner is en route",
  vehicleNumber = "DL 01 AB 8842",
}: LiveTrackingMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  // Calculate live distance & ETA using LocationService
  const distanceKm = providerCoords
    ? LocationService.calculateDistanceKm(
        customerCoords.latitude,
        customerCoords.longitude,
        providerCoords.latitude,
        providerCoords.longitude
      )
    : 1.2;

  const distanceFormatted = LocationService.formatDistance(distanceKm);
  const etaMins = LocationService.calculateEtaMinutes(distanceKm);

  // Auto-center coordinates
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const coords = [customerCoords];
    if (providerCoords) {
      coords.push({
        latitude: providerCoords.latitude,
        longitude: providerCoords.longitude,
      });
    }

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 90, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  };

  useEffect(() => {
    if (mapReady && providerCoords) {
      handleRecenter();
    }
  }, [mapReady, providerCoords?.latitude, providerCoords?.longitude]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Initializing live GPS coordinates...</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: (customerCoords.latitude + (providerCoords?.latitude || customerCoords.latitude - 0.005)) / 2,
    longitude: (customerCoords.longitude + (providerCoords?.longitude || customerCoords.longitude - 0.005)) / 2,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        onMapReady={() => setMapReady(true)}
        showsCompass={false}
        showsTraffic={false}
      >
        {/* Customer Home Marker */}
        <Marker
          coordinate={customerCoords}
          title="Your Service Location"
          description="Doorstep delivery point"
        >
          <View style={styles.customerMarkerContainer}>
            <View style={styles.customerMarkerPin}>
              <MapPin size={22} color="#ef4444" />
            </View>
            <View style={styles.customerMarkerLabel}>
              <Text style={styles.customerMarkerText}>YOU</Text>
            </View>
          </View>
        </Marker>

        {/* Partner Live Moving Marker */}
        {providerCoords && (
          <Marker
            coordinate={{
              latitude: providerCoords.latitude,
              longitude: providerCoords.longitude,
            }}
            title="Service Partner"
            description={`Technician • ${vehicleNumber}`}
            flat
          >
            <View style={styles.partnerMarkerContainer}>
              <View
                style={[
                  styles.partnerMarkerVehicle,
                  {
                    transform: [{ rotate: `${providerCoords.heading || 45}deg` }],
                  },
                ]}
              >
                <Navigation size={22} color="#ffffff" />
              </View>
              <View style={styles.partnerMarkerBadge}>
                <Text style={styles.partnerMarkerText}>PARTNER</Text>
              </View>
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
            strokeColor="#ef4444"
            strokeWidth={4}
            lineDashPattern={[6, 6]}
          />
        )}
      </MapView>

      {/* Top Floating Live ETA & Distance HUD Card */}
      <View style={styles.hudCard}>
        <View style={styles.hudLeft}>
          <View style={styles.hudIconBox}>
            <Bike size={20} color="#ef4444" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.hudDistanceRow}>
              <Text style={styles.hudDistanceText}>{distanceFormatted}</Text>
              <View style={styles.etaPill}>
                <Text style={styles.etaPillText}>
                  {distanceKm < 0.05 ? "Arrived" : `${etaMins} Min ETA`}
                </Text>
              </View>
            </View>
            <Text style={styles.hudStatusText} numberOfLines={1}>
              {statusText}
            </Text>
          </View>
        </View>

        {/* Recenter Button */}
        <TouchableOpacity
          onPress={handleRecenter}
          style={styles.recenterBtn}
          activeOpacity={0.75}
        >
          <Locate size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Map loading placeholder overlay */}
      {!mapReady && (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholderOverlay]}>
          <ActivityIndicator size="large" color="#ef4444" />
          <Text style={styles.placeholderText}>Connecting to Google Maps GPS...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  customerMarkerContainer: {
    alignItems: "center",
  },
  customerMarkerPin: {
    width: 46,
    height: 46,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#ef4444",
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  customerMarkerLabel: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  customerMarkerText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  partnerMarkerContainer: {
    alignItems: "center",
  },
  partnerMarkerVehicle: {
    width: 46,
    height: 46,
    backgroundColor: "#ef4444",
    borderWidth: 3,
    borderColor: "#ffffff",
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  partnerMarkerBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  partnerMarkerText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  hudCard: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  hudLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  hudIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  hudDistanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hudDistanceText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginRight: 6,
  },
  etaPill: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  etaPillText: {
    color: "#16a34a",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  hudStatusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  recenterBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderOverlay: {
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
});
