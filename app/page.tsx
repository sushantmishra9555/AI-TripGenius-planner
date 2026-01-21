'use client';

import { useState, useEffect } from 'react';
import TripForm from './components/TripForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import type { TripFormData } from './types/trip';
import { Plane, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tripParams, setTripParams] = useState<TripFormData | null>(null);
    const [initialFormData, setInitialFormData] = useState<Partial<TripFormData> | undefined>(undefined);
    const [darkMode, setDarkMode] = useState(false);

    // Initial Theme Check
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDark = localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
            setDarkMode(isDark);
            if (isDark) document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Handle shared links
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const destination = params.get('destination');

            if (destination) {
                const sharedData: Partial<TripFormData> = {
                    destination,
                    days: Number(params.get('days')) || 3,
                    budget: Number(params.get('budget')) || 1000,
                    // @ts-ignore
                    currency: params.get('currency') || 'USD',
                    // @ts-ignore
                    travel_style: params.get('travel_style') || 'Solo',
                    starting_location: params.get('starting_location') || '',
                    // @ts-ignore
                    dietary_preference: params.get('dietary_preference') || 'no-preference',
                    month: params.get('month') || 'January',
                };
                setInitialFormData(sharedData);
            }
        }
    }, []);

    const handleSubmit = async (formData: TripFormData) => {
        setIsLoading(true);
        setError(null);
        setItinerary(null);
        setTripParams(formData);

        try {
            // 🧠 SMART LOGIC - Optimize parameters before calling AI
            let constraints = {
                budgetLevel: 'normal',
                distanceLimit: false,
                walkingIntensity: 'normal'
            };

            // Budget-based adjustments
            if (formData.budget < 15000) {
                constraints.budgetLevel = 'budget';
                console.log('💰 Budget mode activated: Prioritizing free/low-cost activities');
            } else if (formData.budget > 50000) {
                constraints.budgetLevel = 'premium';
                console.log('💎 Premium mode activated: Including luxury options');
            }

            // Days-based adjustments
            if (formData.days <= 2) {
                constraints.distanceLimit = true;
                console.log('⏱️ Short trip detected: Limiting to nearby locations');
            }

            // Travel style adjustments
            if (formData.travel_style === 'Family') {
                constraints.walkingIntensity = 'low';
                console.log('👨‍👩‍👧‍👦 Family mode: Reducing walking, adding kid-friendly spots');
            } else if (formData.travel_style === 'Backpacker') {
                constraints.walkingIntensity = 'high';
                console.log('🎒 Backpacker mode: Adding adventurous activities');
            }

            // Call the API route to generate itinerary using OpenAI
            const response = await fetch('/api/itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: formData.destination,
                    days: formData.days,
                    budget: formData.budget,
                    style: formData.travel_style,
                    hotel: formData.starting_location,
                    month: formData.month,
                    constraints: constraints, // Send smart constraints to API
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate itinerary');
            }

            const data = await response.json();

            // Parse the AI response - it might be wrapped in code blocks
            let parsedItinerary: string;

            try {
                // Remove markdown code blocks if present
                const cleaned = data.itinerary
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();

                // Try to parse as JSON to validate it
                const jsonData = JSON.parse(cleaned);

                // Validate it has day data
                const hasValidDays = Object.keys(jsonData).some(key => key.startsWith('day_'));

                if (!hasValidDays) {
                    throw new Error('Invalid itinerary format - no day data found');
                }

                // Store the cleaned JSON string
                parsedItinerary = cleaned;
            } catch (parseError) {
                console.warn('Could not parse as JSON, using raw response:', parseError);
                // If parsing fails, use the original response
                parsedItinerary = data.itinerary;
            }

            setItinerary(parsedItinerary);
        } catch (err) {
            console.error('Error creating itinerary:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate itinerary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setItinerary(null);
        setError(null);
        setTripParams(null);
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
    };

    return (
        <div className="min-h-screen relative overflow-hidden font-sans bg-slate-50">
            {/* Minimal World Map Background using a subtle pattern/gradient for now */}
            <div className="fixed inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_Map_Blank.svg/2560px-World_Map_Blank.svg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%) contrast(100%) brightness(100%)'
                }}
            />

            {/* Top Logo Section */}
            <div className="relative z-10 pt-12 pb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <span className="font-bold text-xl">AI</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800 tracking-tight">TripGenius AI</span>
                </div>
                <p className="text-gray-500 max-w-2xl mx-auto px-4">
                    Experience the future of travel planning. Personalized itineraries, budget<br className="hidden md:block" /> optimization, and curated local gems.
                </p>
            </div>

            <div className="relative z-10 pb-12 px-4 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col items-center justify-center min-h-[80vh]"
                        >
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md border border-white/40">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        <Plane className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                        Crafting Your Journey
                                    </h2>
                                    <p className="text-gray-600 text-center font-medium">
                                        Our AI is designing the perfect travel plan for you...
                                    </p>
                                    <div className="mt-8 space-y-3 text-sm font-medium text-gray-500 w-full">
                                        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                                            <span className="text-xl">✨</span> Analyzing preferences
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                                            <span className="text-xl">🗺️</span> Locating hidden gems
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                                            <span className="text-xl">🍽️</span> Curating culinary spots
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : !itinerary ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center min-h-[85vh]"
                        >
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                            >
                                <TripForm onSubmit={handleSubmit} isLoading={isLoading} initialData={initialFormData} />
                            </motion.div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 p-4 bg-red-100/90 backdrop-blur-md border border-red-400 text-red-800 rounded-xl max-w-2xl font-medium shadow-lg"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="itinerary"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ItineraryDisplay jsonData={itinerary} onReset={handleReset} tripParams={tripParams} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
