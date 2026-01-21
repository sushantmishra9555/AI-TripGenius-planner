'use client';

import { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';

interface Place {
    name: string;
    lat?: number;
    lon?: number;
    description?: string;
    day?: number;
}

interface RouteMapProps {
    places: Place[];
    startLat?: number;
    startLon?: number;
    startName?: string;
}

// Day-wise colors
const DAY_COLORS = [
    '#3B82F6', // Blue (Day 1)
    '#10B981', // Emerald (Day 2)
    '#8B5CF6', // Purple (Day 3)
    '#F97316', // Orange (Day 4)
    '#EC4899', // Pink (Day 5)
    '#EF4444', // Red (Day 6)
    '#6366F1', // Indigo (Day 7)
];

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if google maps is already loaded
        if (typeof window !== 'undefined' && window.google) {
            resolve();
            return;
        }

        // Check if script is already present in DOM to prevent duplicates
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
};

export default function RouteMap({ places, startLat, startLon, startName = "Hotel" }: RouteMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [routeInfos, setRouteInfos] = useState<Array<{ day: number; distance: string; duration: string; color: string }>>([]);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setError('Google Maps API key not configured');
            setLoading(false);
            return;
        }

        if (!startLat || !startLon || places.length === 0) {
            setError('No route data available');
            setLoading(false);
            return;
        }

        const initMap = async () => {
            try {
                await loadGoogleMapsScript(apiKey);

                if (!mapRef.current) return;

                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: { lat: startLat, lng: startLon },
                    zoom: 12,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                    ],
                });

                // Add Home/Hotel Marker
                new google.maps.Marker({
                    position: { lat: startLat, lng: startLon },
                    map: mapInstance,
                    title: startName,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#1F2937', // Dark Gray
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                    },
                    label: {
                        text: 'H',
                        color: 'white',
                        fontWeight: 'bold',
                    },
                    zIndex: 100,
                });

                const bounds = new google.maps.LatLngBounds();
                bounds.extend({ lat: startLat, lng: startLon });

                // Group places by day
                const placesByDay: { [key: number]: Place[] } = {};
                places.forEach(place => {
                    const day = place.day || 1;
                    if (!placesByDay[day]) placesByDay[day] = [];
                    placesByDay[day].push(place);
                });

                const directionsService = new google.maps.DirectionsService();
                const routePromises: Promise<{ day: number; distance: number; duration: number; color: string; result: any } | null>[] = [];

                // Helper to fetch route logic wrapped in promise
                const fetchRoute = (
                    origin: google.maps.LatLngLiteral,
                    destination: google.maps.LatLngLiteral,
                    waypoints: google.maps.DirectionsWaypoint[],
                    color: string,
                    day: number
                ) => {
                    return new Promise<{ day: number; distance: number; duration: number; color: string; result: any } | null>((resolve) => {
                        directionsService.route(
                            {
                                origin,
                                destination,
                                waypoints,
                                travelMode: google.maps.TravelMode.DRIVING,
                            },
                            (result: any, status: any) => {
                                if (status === 'OK' && result) {
                                    resolve({
                                        day,
                                        color,
                                        distance: result.routes[0].legs.reduce((acc: number, leg: any) => acc + (leg.distance?.value || 0), 0),
                                        duration: result.routes[0].legs.reduce((acc: number, leg: any) => acc + (leg.duration?.value || 0), 0),
                                        result,
                                    });
                                } else {
                                    console.warn(`Directions request failed for day ${day}:`, status);
                                    resolve(null);
                                }
                            }
                        );
                    });
                };

                // Process each day
                for (const [dayStr, dayPlaces] of Object.entries(placesByDay)) {
                    const day = parseInt(dayStr);
                    const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
                    const validPlaces = dayPlaces.filter(p => p.lat && p.lon);

                    if (validPlaces.length === 0) continue;

                    // Add markers for this day
                    validPlaces.forEach((place, idx) => {
                        const marker = new google.maps.Marker({
                            position: { lat: place.lat!, lng: place.lon! },
                            map: mapInstance,
                            title: place.name,
                            label: {
                                text: `${idx + 1}`,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '12px',
                            },
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 10,
                                fillColor: color,
                                fillOpacity: 1,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                            },
                            zIndex: 10 + idx,
                        });

                        const infoWindow = new google.maps.InfoWindow({
                            content: `
                                <div style="padding: 8px; min-width: 150px;">
                                    <strong style="color: ${color}">Day ${day} - ${idx + 1}</strong><br/>
                                    <strong>${place.name}</strong>
                                    ${place.description ? `<br/><small>${place.description}</small>` : ''}
                                </div>
                            `,
                        });

                        marker.addListener('click', () => {
                            infoWindow.open(mapInstance, marker);
                        });

                        bounds.extend({ lat: place.lat!, lng: place.lon! });
                    });

                    // Prepare route request
                    // Route: Hotel -> Place 1 -> ... -> Last Place
                    const waypoints = validPlaces.slice(0, -1).map(p => ({
                        location: { lat: p.lat!, lng: p.lon! },
                        stopover: true,
                    }));
                    const destination = validPlaces[validPlaces.length - 1];

                    // Add to promise queue
                    routePromises.push(
                        fetchRoute(
                            { lat: startLat, lng: startLon },
                            { lat: destination.lat!, lng: destination.lon! },
                            waypoints,
                            color,
                            day
                        )
                    );
                }

                // Execute all route requests
                // Note: Google Maps has rate limiting. If days > 10, this might hit limits.
                // For typical itineraries (3-7 days), it should be fine.
                Promise.all(routePromises).then(results => {
                    const validResults = results.filter(r => r !== null) as NonNullable<typeof results[number]>[];

                    // Render lines
                    validResults.forEach(data => {
                        new google.maps.DirectionsRenderer({
                            map: mapInstance,
                            directions: data.result,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: data.color,
                                strokeWeight: 5,
                                strokeOpacity: 0.8,
                            },
                        });
                    });

                    // Update stats
                    setRouteInfos(
                        validResults
                            .map(data => ({
                                day: data.day,
                                color: data.color,
                                distance: `${(data.distance / 1000).toFixed(1)} km`,
                                duration: `${Math.round(data.duration / 60)} min`,
                            }))
                            .sort((a, b) => a.day - b.day)
                    );
                });

                mapInstance.fitBounds(bounds);
                setLoading(false);
            } catch (err) {
                console.error('Error initializing map:', err);
                setError('Failed to load map.');
                setLoading(false);
            }
        };

        initMap();
    }, [places, startLat, startLon, startName]);

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-semibold">⚠️ {error}</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                ref={mapRef}
                className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200"
            />

            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="font-semibold text-gray-600">Loading Map...</p>
                    </div>
                </div>
            )}

            {/* Legend / Stats overlay */}
            {!loading && routeInfos.length > 0 && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 max-w-xs border border-gray-100 max-h-[400px] overflow-y-auto">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Navigation className="w-4 h-4" /> Trip Routes
                    </h3>
                    <div className="space-y-3">
                        {routeInfos.map((info) => (
                            <div key={info.day} className="flex items-start gap-3 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: info.color }}
                                />
                                <div>
                                    <div className="font-bold text-gray-800">Day {info.day}</div>
                                    <div className="text-gray-500 text-xs flex gap-2 mt-0.5">
                                        <span>{info.distance}</span>
                                        <span>•</span>
                                        <span>{info.duration} drive</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
