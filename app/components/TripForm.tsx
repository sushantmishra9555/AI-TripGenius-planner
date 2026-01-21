'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { MapPin, Calendar, DollarSign, Users, Hotel, Utensils, Plane, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TripFormData } from '../types/trip';

const tripSchema = z.object({
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  days: z.number().min(1, 'Trip must be at least 1 day').max(30, 'Trip cannot exceed 30 days'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  currency: z.string().min(3, 'Currency is required'),
  travel_style: z.enum(['Solo', 'Family', 'Backpacker']),
  starting_location: z.string().min(2, 'Starting location must be at least 2 characters'),
  month: z.string().min(3, 'Travel month is required'),
});

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
  initialData?: Partial<TripFormData>;
}

export default function TripForm({ onSubmit, isLoading, initialData }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    days: 3,
    budget: 1000,
    currency: 'USD',
    travel_style: 'Solo',
    starting_location: '',
    dietary_preference: 'no-preference',
    month: 'January',
    ...initialData
  });

  // Update form if initialData changes (e.g. from URL params)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = tripSchema.parse(formData);
      setErrors({});
      onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        // In Zod v4, validation errors are in the 'issues' property
        if (error.issues && Array.isArray(error.issues)) {
          error.issues.forEach((issue) => {
            if (issue.path && issue.path.length > 0) {
              newErrors[issue.path[0] as string] = issue.message;
            }
          });
        }
        setErrors(newErrors);
      } else {
        // Handle non-Zod errors
        console.error('Form validation error:', error);
      }
    }
  };

  const handleChange = (field: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-2xl w-full border border-gray-100 relative overflow-hidden">

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Plane className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Plan Your Adventure
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          Let AI craft your perfect itinerary
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Destination */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
            <MapPin className="w-4 h-4 text-blue-500" />
            Where to?
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="e.g. Paris, Tokyo, Bali..."
              className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none text-lg text-gray-800 placeholder-gray-400 ${errors.destination ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-blue-200'}`}
            />
          </div>
          {errors.destination && <p className="text-red-500 text-sm ml-1 font-medium flex items-center gap-1">⚠️ {errors.destination}</p>}
        </div>

        {/* Month & Days Grid */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            When?
          </label>
          <div className="relative">
            <select
              value={formData.month}
              onChange={(e) => handleChange('month', e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none appearance-none hover:border-blue-200 cursor-pointer text-gray-800 font-medium"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
            <Clock className="w-4 h-4 text-blue-500" />
            How long?
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.days}
              onChange={(e) => handleChange('days', parseInt(e.target.value) || 1)}
              min="1"
              max="30"
              className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none text-gray-800 ${errors.days ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-blue-200'}`}
            />
            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Days</span>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
            </div>
          </div>
          {errors.days && <p className="text-red-500 text-sm ml-1 font-medium">{errors.days}</p>}
        </div>

        {/* Budget */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
            <DollarSign className="w-4 h-4 text-blue-500" />
            Budget (per person)
          </label>
          <div className="flex gap-3">
            <div className="relative w-32">
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none appearance-none cursor-pointer hover:border-blue-200 font-bold text-center text-gray-700"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                min="1"
                className={`w-full pl-5 pr-4 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none text-lg font-bold text-gray-800 ${errors.budget ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-blue-200'}`}
              />
            </div>
          </div>
          {errors.budget && <p className="text-red-500 text-sm ml-1 font-medium">{errors.budget}</p>}
        </div>

        {/* Travel Style - Visual Selection */}
        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'Solo', icon: '👤', label: 'Solo' },
              { id: 'Family', icon: '👨‍👩‍👧‍👦', label: 'Family' },
              { id: 'Backpacker', icon: '🎒', label: 'Backpacker' }
            ].map((style) => (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                key={style.id}
                type="button"
                onClick={() => handleChange('travel_style', style.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${formData.travel_style === style.id
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 border-transparent'
                  : 'bg-white text-gray-600 border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200'
                  }`}
              >
                <span className="text-3xl mb-2 filter drop-shadow-sm">{style.icon}</span>
                <span className="font-bold text-sm tracking-wide">{style.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dietary Preference - Chips */}
        <div className="md:col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
            <Utensils className="w-4 h-4 text-blue-500" />
            Food Preferences
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'no-preference', label: 'Anything 🍽️' },
              { id: 'vegetarian', label: 'Vegetarian 🥬' },
              { id: 'non-vegetarian', label: 'Non-Veg 🍖' }
            ].map((diet) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={diet.id}
                type="button"
                onClick={() => handleChange('dietary_preference', diet.id)}
                className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${formData.dietary_preference === diet.id
                  ? 'bg-white text-gray-800 border-gray-200 shadow-sm ring-2 ring-blue-500 ring-offset-2'
                  : 'bg-gray-50 text-gray-500 border-transparent hover:bg-white hover:shadow-sm'
                  }`}
              >
                {diet.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Starting Location */}
        <div className="md:col-span-2 space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
            <Hotel className="w-4 h-4 text-blue-500" />
            Starting Point (Hotel/Location)
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.starting_location}
              onChange={(e) => handleChange('starting_location', e.target.value)}
              placeholder="e.g. Marriott Downtown or City Center"
              className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none text-gray-800 placeholder-gray-400 ${errors.starting_location ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-blue-200'}`}
            />
          </div>
          {errors.starting_location && <p className="text-red-500 text-sm ml-1 font-medium">{errors.starting_location}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-5 px-6 rounded-2xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl shadow-blue-500/20 hover:-translate-y-0.5 transform active:scale-98 text-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>Generating Your Dream Trip...</>
        ) : (
          <>
            Generate Itinerary <Plane className="w-5 h-5 fill-current" />
          </>
        )}
      </button>
    </form>
  );
}
