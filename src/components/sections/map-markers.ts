import type { DottedMapProps } from "@/components/ui/dotted-map"

// Markers for the hero map (Tashkent and San Francisco)
export const heroMarkers: NonNullable<DottedMapProps["markers"]> = [
  { lat: 41.2995, lng: 69.2401, size: 0.4 }, // Tashkent, Uzbekistan
  { lat: 37.7749, lng: -122.4194, size: 0.4 }, // San Francisco, USA
  { lat: 39.3279, lng: -120.1833, size: 0.4 }, // Truckee, CA, USA
  { lat: 38.5449, lng: -121.7405, size: 0.4 }, // Davis, CA, USA
  { lat: 37.5665, lng: 126.978, size: 0.4 }, // Seoul, South Korea
  { lat: 41.0082, lng: 28.9784, size: 0.4 }, // Istanbul, Turkey
  { lat: 52.52, lng: 13.405, size: 0.4 }, // Berlin, Germany
  { lat: 51.0504, lng: 13.7373, size: 0.4 }, // Dresden, Germany
  { lat: 55.7558, lng: 37.6173, size: 0.4 }, // Moscow, Russia
  { lat: 40.7128, lng: -74.006, size: 0.4 }, // New York, NY, USA
  { lat: 42.62, lng: -73.12, size: 0.4 }, // New Ashford, MA, USA (approx)
  { lat: 36.0544, lng: -112.1401, size: 0.4 }, // Grand Canyon, AZ, USA (Village)
  { lat: 47.6062, lng: -122.3321, size: 0.4 }, // Seattle, WA, USA
  { lat: 32.7157, lng: -117.1611, size: 0.4 }, // San Diego, CA, USA
  { lat: 34.0522, lng: -118.2437, size: 0.4 }, // Los Angeles, CA, USA
  { lat: 37.4419, lng: -122.143, size: 0.4 }, // Palo Alto, CA, USA
  { lat: 45.5152, lng: -122.6784, size: 0.4 }, // Portland, OR, USA
  { lat: -8.3405, lng: 115.092, size: 0.4 }, // Bali (Denpasar), Indonesia
]
