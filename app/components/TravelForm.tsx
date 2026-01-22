'use client';

import React, { useState } from 'react';
import { Plane, Calendar, Clock, Wallet, Users, Utensils, MapPin, Sparkles } from 'lucide-react';

interface TravelFormData {
    destination: string;
    month: string;
    days: string;
    currency: string;
    budget: string;
    travelType: string;
    foodPreference: string;
    startingPoint: string;
}

interface TravelFormProps {
    onFormChange?: (data: TravelFormData) => void;
    onSubmit?: (data: TravelFormData) => void;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'];

const travelTypes = [
    { id: 'solo', label: 'Solo', icon: '👤' },
    { id: 'family', label: 'Family', icon: '👨👩👧' },
    { id: 'backpacker', label: 'Backpacker', icon: '🎒' },
];

const foodPreferences = [
    { id: 'anything', label: 'Anything', icon: '🍽' },
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'non-veg', label: 'Non-Veg', icon: '🍗' },
];

const TravelForm: React.FC<TravelFormProps> = ({ onFormChange, onSubmit }) => {
    const [formData, setFormData] = useState<TravelFormData>({
        destination: '',
        month: '',
        days: '',
        currency: 'USD',
        budget: '',
        travelType: 'solo',
        foodPreference: 'anything',
        startingPoint: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof TravelFormData, value: string) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onFormChange?.(newData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        onSubmit?.(formData);
    };

    return (
        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-glass-lg animate-fade-in-up">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                    <Plane className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Plan Your Adventure
                </h2>
                <p className="text-muted-foreground text-sm md:text-base">
                    Let AI craft your perfect itinerary
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-4" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        Where to?
                    </label>
                    <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={(e) => handleChange('destination', e.target.value)}
                        placeholder="e.g., Tokyo, Japan"
                        className="form-input-travel"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            When?
                        </label>
                        <select
                            id="month"
                            name="month"
                            value={formData.month}
                            onChange={(e) => handleChange('month', e.target.value)}
                            className="form-input-travel appearance-none cursor-pointer"
                        >
                            <option value="">Select month</option>
                            {months.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            How long?
                        </label>
                        <input
                            type="number"
                            id="days"
                            name="days"
                            min="1"
                            max="30"
                            value={formData.days}
                            onChange={(e) => handleChange('days', e.target.value)}
                            placeholder="e.g. 3"
                            className="form-input-travel"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Wallet className="w-4 h-4 text-primary" />
                        Budget per person
                    </label>
                    <div className="grid grid-cols-[100px_1fr] gap-3">
                        <select
                            id="currency"
                            name="currency"
                            value={formData.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className="form-input-travel appearance-none cursor-pointer"
                        >
                            {currencies.map((curr) => (
                                <option key={curr} value={curr}>{curr}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            min="0"
                            value={formData.budget}
                            onChange={(e) => handleChange('budget', e.target.value)}
                            placeholder="Enter amount"
                            className="form-input-travel"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        Travel type
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {travelTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                id={`travel-type-${type.id}`}
                                name="travelType"
                                onClick={() => handleChange('travelType', type.id)}
                                className={`pill-button flex items-center gap-2 ${formData.travelType === type.id ? 'pill-button-active' : 'pill-button-inactive'
                                    }`}
                            >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Utensils className="w-4 h-4 text-primary" />
                        Food preference
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {foodPreferences.map((pref) => (
                            <button
                                key={pref.id}
                                type="button"
                                id={`food-${pref.id}`}
                                name="foodPreference"
                                onClick={() => handleChange('foodPreference', pref.id)}
                                className={`pill-button flex items-center gap-2 ${formData.foodPreference === pref.id ? 'pill-button-active' : 'pill-button-inactive'
                                    }`}
                            >
                                <span>{pref.icon}</span>
                                <span>{pref.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        Starting point
                    </label>
                    <input
                        type="text"
                        id="startingPoint"
                        name="startingPoint"
                        value={formData.startingPoint}
                        onChange={(e) => handleChange('startingPoint', e.target.value)}
                        placeholder="Your hotel or starting location"
                        className="form-input-travel"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`
            w-full py-4 px-6 rounded-xl font-semibold text-base
            cta-gradient text-primary-foreground
            transition-all duration-300 transform
            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-cta-hover cta-glow animate-pulse-glow'}
            flex items-center justify-center gap-3
          `}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Smart Itinerary</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default TravelForm;
