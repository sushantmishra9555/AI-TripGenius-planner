// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Estimate travel time based on distance (in minutes)
export function estimateTravelTime(distanceKm: number, mode: 'walking' | 'driving' | 'public' = 'driving'): number {
    const speeds = {
        walking: 5, // km/h
        driving: 40, // km/h in city
        public: 25, // km/h public transport
    };

    const timeHours = distanceKm / speeds[mode];
    return Math.round(timeHours * 60); // Convert to minutes
}

// Sort places by distance from a starting point
export function sortPlacesByDistance(
    places: Array<{ name: string; lat?: number; lon?: number;[key: string]: any }>,
    startLat: number,
    startLon: number
): Array<{ distance: number; travelTime: number;[key: string]: any }> {
    return places
        .map((place) => {
            if (!place.lat || !place.lon) {
                return { ...place, distance: 0, travelTime: 0 };
            }

            const distance = calculateDistance(startLat, startLon, place.lat, place.lon);
            const travelTime = estimateTravelTime(distance);

            return {
                ...place,
                distance,
                travelTime,
            };
        })
        .sort((a, b) => a.distance - b.distance);
}

// Format distance for display
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km}km`;
}

// Format travel time for display
export function formatTravelTime(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
