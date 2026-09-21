import * as Location from "expo-location";
import { GeoLocation } from "../types";

export interface UserAddressDetails {
  formattedAddress: string;
  landmark?: string;
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

export class LocationService {
  /**
   * Requests device GPS permission and fetches current real-time GPS coordinates
   * with reverse geocoding into a complete formatted Indian address.
   */
  public static async getCurrentLocation(): Promise<UserAddressDetails> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted, using fallback location");
        return this.getFallbackLocation();
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode coordinates to real address
      let formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      let city = "Gurugram";
      let district = "";
      let region = "Haryana";
      let postalCode = "";
      let landmark = "";

      try {
        const reverseResults = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseResults && reverseResults.length > 0) {
          const res = reverseResults[0];
          const parts = [
            res.name,
            res.street,
            res.district || res.subregion,
            res.city,
            res.region,
            res.postalCode,
          ].filter(Boolean);

          if (parts.length > 0) {
            formattedAddress = parts.join(", ");
          }
          city = res.city || res.subregion || "Delhi NCR";
          district = res.district || res.subregion || "";
          region = res.region || "India";
          postalCode = res.postalCode || "";
          landmark = res.name || res.street || "";
        }
      } catch (geocodeErr) {
        console.warn("Reverse geocode failed:", geocodeErr);
      }

      return {
        formattedAddress,
        latitude,
        longitude,
        city,
        district,
        region,
        postalCode,
        landmark,
      };
    } catch (err) {
      console.error("Error getting live device location:", err);
      return this.getFallbackLocation();
    }
  }

  /**
   * Fallback location (Cyber City, Gurugram)
   */
  public static getFallbackLocation(): UserAddressDetails {
    return {
      formattedAddress: "7A, Cyber City, Phase III, Sector 24, Gurugram, Haryana 122002",
      latitude: 28.4901,
      longitude: 77.0805,
      city: "Gurugram",
      district: "Gurugram",
      region: "Haryana",
      postalCode: "122002",
      landmark: "Cyber City Phase III",
    };
  }

  /**
   * Calculates real distance in kilometers / meters between two GPS coordinates using Haversine formula
   */
  public static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Formats distance into readable string (e.g. "850 m" or "2.4 km")
   */
  public static formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }

  /**
   * Calculates Estimated Time of Arrival (ETA) in minutes assuming average city speed of 25 km/h
   */
  public static calculateEtaMinutes(distanceKm: number, speedKmH = 25): number {
    const hours = distanceKm / Math.max(speedKmH, 10);
    const mins = Math.ceil(hours * 60);
    return Math.max(mins, 1);
  }

  /**
   * Geocodes an address string query into GPS coordinates and formatted details
   */
  public static async geocodeAddress(query: string): Promise<UserAddressDetails> {
    const clean = query.trim();
    if (!clean) {
      return this.getFallbackLocation();
    }

    try {
      const geocodeResults = await Location.geocodeAsync(clean);
      if (geocodeResults && geocodeResults.length > 0) {
        const { latitude, longitude } = geocodeResults[0];

        let formattedAddress = clean;
        let city = clean;
        let district = "";
        let region = "India";
        let postalCode = "";
        let landmark = clean;

        try {
          const reverseResults = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (reverseResults && reverseResults.length > 0) {
            const res = reverseResults[0];
            const parts = [
              res.name,
              res.street,
              res.district || res.subregion,
              res.city,
              res.region,
              res.postalCode,
            ].filter(Boolean);

            if (parts.length > 0) {
              formattedAddress = parts.join(", ");
            }
            city = res.city || res.subregion || clean;
            district = res.district || res.subregion || "";
            region = res.region || "India";
            postalCode = res.postalCode || "";
            landmark = res.name || res.street || clean;
          }
        } catch {
          // Keep query as formatted address
        }

        return {
          formattedAddress,
          latitude,
          longitude,
          city,
          district,
          region,
          postalCode,
          landmark,
        };
      }
    } catch (err) {
      console.warn("Geocode query error:", err);
    }

    // Default coordinate offset based on query
    return {
      formattedAddress: clean,
      latitude: 25.5941,
      longitude: 85.1376,
      city: clean,
      landmark: clean,
      district: "",
      region: "India",
      postalCode: "",
    };
  }

  /**
   * Popular serviceable cities
   */
  public static getPopularCities(): { name: string; state: string; lat: number; lng: number }[] {
    return [
      { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
      { name: "Delhi NCR", state: "Delhi", lat: 28.6139, lng: 77.209 },
      { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
      { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
      { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
      { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
      { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
      { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
      { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
    ];
  }

  /**
   * Calculates heading / bearing angle in degrees between two GPS points
   */
  public static calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
    const x =
      Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
      Math.sin(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.cos((lon2 - lon1) * (Math.PI / 180));
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }
}


