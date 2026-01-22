'use client';

import { useState, useEffect } from 'react';
import { Hotel as HotelIcon, Star, MapPin, Wifi, Coffee, Dumbbell, UtensilsCrossed } from 'lucide-react';
import type { Hotel } from '../types/trip';

interface HotelRecommendationsProps {
    hotels: Hotel[];
    destination: string;
}

// Pexels API helper (reusing logic from ItineraryDisplay)
// Pexels API helper (reusing logic from ItineraryDisplay)
async function fetchPexelsImage(query: string): Promise<string | null> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

        // Use fallback if key is missing or invalid
        if (!apiKey || apiKey === 'YOUR_PEXELS_KEY_HERE') {
            return `https://loremflickr.com/800/600/${encodeURIComponent(query)},hotel/all`;
        }

        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
            {
                headers: {
                    Authorization: apiKey,
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.photos?.[0]?.src?.large || null;
    } catch (error) {
        console.error('Pexels API error:', error);
        return null;
    }
}

// Amenity icon mapping
const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Free WiFi': Wifi,
    'Gym': Dumbbell,
    'Fitness Center': Dumbbell,
    'Restaurant': UtensilsCrossed,
    'Breakfast': Coffee,
    'Free Breakfast': Coffee,
};

// Hotel Card Component
function HotelCard({ hotel, destination }: { hotel: Hotel; destination: string }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadImage() {
            setImageLoading(true);
            const query = `${destination} ${hotel.name} hotel luxury`;
            const url = await fetchPexelsImage(query);

            if (isMounted) {
                setImageUrl(url);
                setImageLoading(false);
            }
        }

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [hotel.name, destination]);

    return (
        <div className="glass-card rounded-2xl overflow-hidden shadow-glass-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            {/* Hotel Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                {imageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <HotelIcon className="w-16 h-16 opacity-20" />
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-800">{hotel.rating.toFixed(1)}</span>
                </div>
            </div>

            {/* Hotel Info */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{hotel.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{hotel.description}</p>

                {/* Price Range */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-primary">{hotel.price_range}</p>
                </div>

                {/* Distance */}
                {hotel.distance_from_center && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{hotel.distance_from_center}</span>
                    </div>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 4).map((amenity, idx) => {
                            const Icon = amenityIcons[amenity] || Wifi;
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 rounded-lg text-xs text-gray-700"
                                >
                                    <Icon className="w-3.5 h-3.5 text-primary" />
                                    <span>{amenity}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HotelRecommendations({ hotels, destination }: HotelRecommendationsProps) {
    if (!hotels || hotels.length === 0) {
        return null;
    }

    return (
        <div className="mb-12">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HotelIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                        Recommended Hotels
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Hand-picked accommodations for your stay in {destination}
                    </p>
                </div>
            </div>

            {/* Hotel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel, idx) => (
                    <HotelCard key={idx} hotel={hotel} destination={destination} />
                ))}
            </div>
        </div>
    );
}
