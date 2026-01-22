'use client';

import { useState } from 'react';
import TravelForm from './components/TravelForm';
import TripPreview from './components/TripPreview';
import ItineraryDisplay from './components/ItineraryDisplay';
import type { TripFormData } from './types/trip';
import { Plane, Globe, Sparkles, Star, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
    destination: string;
    month: string;
    days: string;
    currency: string;
    budget: string;
    travelType: string;
    foodPreference: string;
    startingPoint: string;
}

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tripParams, setTripParams] = useState<TripFormData | null>(null);


    const [formData, setFormData] = useState<FormData>({
        destination: '',
        month: 'January',
        days: '3',
        currency: 'USD',
        budget: '1000',
        travelType: 'solo',
        foodPreference: 'anything',
        startingPoint: '',
    });

    const handleFormChange = (data: FormData) => {
        setFormData(data);
    };

    const handleSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);
        setItinerary(null);

        // Convert form data to API format
        const tripData: TripFormData = {
            destination: data.destination,
            days: parseInt(data.days),
            budget: parseFloat(data.budget),
            currency: data.currency,
            travel_style: data.travelType.charAt(0).toUpperCase() + data.travelType.slice(1) as 'Solo' | 'Family' | 'Backpacker',
            starting_location: data.startingPoint,
            dietary_preference: data.foodPreference === 'non-veg' ? 'non-vegetarian' : data.foodPreference as 'no-preference' | 'vegetarian' | 'vegan' | 'halal',
            month: data.month,
        };

        setTripParams(tripData);

        try {
            // Smart Logic - Optimize parameters before calling AI
            let constraints = {
                budgetLevel: 'normal',
                distanceLimit: false,
                walkingIntensity: 'normal'
            };

            if (tripData.budget < 15000) {
                constraints.budgetLevel = 'budget';
                console.log('💰 Budget mode activated');
            } else if (tripData.budget > 50000) {
                constraints.budgetLevel = 'premium';
                console.log('💎 Premium mode activated');
            }

            if (tripData.days <= 2) {
                constraints.distanceLimit = true;
                console.log('⏱️ Short trip detected');
            }

            if (tripData.travel_style === 'Family') {
                constraints.walkingIntensity = 'low';
                console.log('👨‍👩‍👧‍👦 Family mode');
            }

            const response = await fetch('/api/itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: tripData.destination,
                    days: tripData.days,
                    budget: tripData.budget,
                    style: tripData.travel_style,
                    hotel: tripData.starting_location,
                    month: tripData.month,
                    constraints: constraints,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to generate itinerary');
            }

            const responseData = await response.json();

            let parsedItinerary: string;
            try {
                const cleaned = responseData.itinerary
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();

                const jsonData = JSON.parse(cleaned);
                const hasValidDays = Object.keys(jsonData).some(key => key.startsWith('day_'));

                if (!hasValidDays) {
                    throw new Error('Invalid itinerary format');
                }

                parsedItinerary = cleaned;
            } catch (parseError) {
                console.warn('Could not parse as JSON:', parseError);
                parsedItinerary = responseData.itinerary;
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
        window.history.replaceState({}, '', window.location.pathname);
    };

    return (
        <div className="min-h-screen travel-gradient-bg world-map-overlay relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

            <div className="absolute top-32 right-[15%] animate-float opacity-20">
                <Plane className="w-8 h-8 text-primary rotate-45" />
            </div>
            <div className="absolute bottom-40 left-[10%] animate-float animation-delay-1000 opacity-15">
                <Globe className="w-10 h-10 text-accent" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col items-center justify-center min-h-[80vh]"
                        >
                            <div className="glass p-12 max-w-md rounded-3xl shadow-2xl">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <Plane className="w-10 h-10 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800 mt-8 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                        Crafting Your Journey
                                    </h2>
                                    <p className="text-muted-foreground text-center font-medium">
                                        Our AI is designing the perfect travel plan for you...
                                    </p>
                                    <div className="mt-8 space-y-3 text-sm font-medium text-gray-600 w-full">
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
                        >
                            {/* Header */}
                            <header className="text-center mb-10 md:mb-14 animate-fade-in-up">
                                <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-primary text-sm font-medium px-4 py-2 rounded-full mb-6 shadow-sm">
                                    <Sparkles className="w-4 h-4" />
                                    <span>AI-Powered Travel Planning</span>
                                </div>
                                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                                    Your Dream Trip,{' '}
                                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                        Intelligently Planned
                                    </span>
                                </h1>
                                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                                    Let our AI create the perfect itinerary tailored to your preferences,
                                    budget, and travel style.
                                </p>
                            </header>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 md:mb-14 animate-fade-in-up">
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span>Designed for real-world travel planning</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>Secure & Private</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Zap className="w-4 h-4 text-accent" />
                                    <span>Instant Results</span>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid lg:grid-cols-[45fr_55fr] gap-6 lg:gap-8 max-w-7xl mx-auto items-start">
                                <div className="order-1 lg:order-1">
                                    <TravelForm onFormChange={handleFormChange} onSubmit={handleSubmit} />
                                </div>
                                <div className="order-2 lg:order-2">
                                    <TripPreview
                                        destination={formData.destination}
                                        month={formData.month}
                                        days={formData.days}
                                        currency={formData.currency}
                                        budget={formData.budget}
                                        travelType={formData.travelType}
                                        foodPreference={formData.foodPreference}
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 p-4 bg-red-100/90 backdrop-blur-md border border-red-400 text-red-800 rounded-xl max-w-2xl mx-auto font-medium shadow-lg"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Footer */}
                            <footer className="text-center mt-14 md:mt-20 pb-8">
                                <p className="text-sm text-muted-foreground">© 2026 Smart Travel Planner • Demo Project</p>
                            </footer>
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
