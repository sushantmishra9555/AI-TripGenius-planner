'use client';

import { Zap, Coffee, Scale } from 'lucide-react';

interface TravelPaceProps {
    totalPlaces: number;
    days: number;
}

export default function TravelPace({ totalPlaces, days }: TravelPaceProps) {
    const avgPlacesPerDay = totalPlaces / days;

    let pace = {
        label: 'Balanced',
        icon: <Scale className="w-6 h-6 text-blue-600" />,
        color: 'bg-blue-100 text-blue-800',
        description: 'Perfect mix of activity and rest.',
        percentage: 50,
        barColor: 'bg-blue-500',
    };

    if (avgPlacesPerDay < 3) {
        pace = {
            label: 'Relaxed',
            icon: <Coffee className="w-6 h-6 text-green-600" />,
            color: 'bg-green-100 text-green-800',
            description: 'Leisurely pace to soak in the vibes.',
            percentage: 25,
            barColor: 'bg-green-500',
        };
    } else if (avgPlacesPerDay > 4.5) {
        pace = {
            label: 'Fast-Paced',
            icon: <Zap className="w-6 h-6 text-orange-600" />,
            color: 'bg-orange-100 text-orange-800',
            description: 'Action-packed itinerary for maximum coverage.',
            percentage: 90,
            barColor: 'bg-orange-500',
        };
    }

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${pace.color.split(' ')[0]}`}>
                    {pace.icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Travel Pace</h3>
                    <p className="text-sm text-gray-500">{avgPlacesPerDay.toFixed(1)} places / day</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${pace.color}`}>
                        {pace.label}
                    </span>
                </div>

                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-0 w-1/3 border-r border-white/50 bg-green-200/20"></div>
                    <div className="absolute top-0 bottom-0 left-1/3 w-1/3 border-r border-white/50 bg-blue-200/20"></div>
                    <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-orange-200/20"></div>

                    {/* Indicator */}
                    <div
                        className={`h-full ${pace.barColor} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                        style={{ width: `${pace.percentage}%` }}
                    />
                </div>

                <p className="text-sm text-gray-600 leading-relaxed pt-1">
                    {pace.description}
                </p>
            </div>
        </div>
    );
}
