'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { MapPin, Calendar, DollarSign, Utensils, Hotel, Plane, Clock } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6 relative max-w-3xl w-full">
      {/* Dark Card Container */}
      <div className="relative bg-[#252a3d] p-10 rounded-3xl shadow-2xl border border-[#2d3447]">

        {/* Header Section */}
        <div className="text-center mb-10 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#d4fc3c] rounded-2xl">
              <Plane className="w-10 h-10 text-[#1a1d2e]" />
            </div>
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight text-white">
            Plan Your Adventure
          </h1>
          <p className="text-[#a1a8b8] font-medium text-lg">
            Let AI craft your perfect itinerary ✨
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {/* Destination */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white ml-1">
              <MapPin className="w-5 h-5 text-[#d4fc3c]" />
              Where to?
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="e.g. Paris, Tokyo, Bali..."
              className={`w-full px-5 py-4 bg-[#1a1d2e] border-2 rounded-2xl focus:ring-2 focus:ring-[#d4fc3c] focus:border-[#d4fc3c] transition-all outline-none text-lg text-white placeholder-[#a1a8b8] font-medium ${errors.destination ? 'border-red-400' : 'border-[#2d3447] hover:border-gray-600'}`}
            />
            {errors.destination && <p className="text-red-400 text-sm ml-1 font-medium flex items-center gap-1">⚠️ {errors.destination}</p>}
          </div>

          {/* Month & Days Grid */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white ml-1">
              <Calendar className="w-5 h-5 text-[#d4fc3c]" />
              When?
            </label>
            <div className="relative">
              <select
                value={formData.month}
                onChange={(e) => handleChange('month', e.target.value)}
                className="w-full px-5 py-4 bg-[#1a1d2e] border-2 border-[#2d3447] rounded-2xl focus:ring-2 focus:ring-[#d4fc3c] focus:border-[#d4fc3c] transition-all outline-none appearance-none hover:border-gray-600 cursor-pointer text-white font-medium"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#d4fc3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white ml-1">
              <Clock className="w-5 h-5 text-[#d4fc3c]" />
              How long?
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.days}
                onChange={(e) => handleChange('days', parseInt(e.target.value) || 1)}
                min="1"
                max="30"
                className={`w-full px-5 py-4 bg-[#1a1d2e] border-2 rounded-2xl focus:ring-2 focus:ring-[#d4fc3c] focus:border-[#d4fc3c] transition-all outline-none text-white font-medium ${errors.days ? 'border-red-400' : 'border-[#2d3447] hover:border-gray-600'}`}
              />
              <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[#a1a8b8] text-sm font-medium">Days</span>
            </div>
            {errors.days && <p className="text-red-400 text-sm ml-1 font-medium">{errors.days}</p>}
          </div>

          {/* Budget */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white ml-1">
              <DollarSign className="w-5 h-5 text-[#d4fc3c]" />
              Budget (per person)
            </label>
            <div className="flex gap-3">
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-32 px-4 py-4 bg-[#1a1d2e] border-2 border-[#2d3447] rounded-2xl focus:ring-2 focus:ring-[#d4fc3c] focus:border-[#d4fc3c] transition-all outline-none appearance-none cursor-pointer hover:border-gray-600 font-bold text-center text-white"
              >
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                min="1"
                className={`flex-1 px-5 py-4 bg-[#1a1d2e] border-2 rounded-2xl focus:ring-2 focus:ring-[#d4fc3c] focus:border-[#d4fc3c] transition-all outline-none text-lg font-bold text-white ${errors.budget ? 'border-red-400' : 'border-[#2d3447] hover:border-gray-600'}`}
              />
            </div>
            {errors.budget && <p className="text-red-400 text-sm ml-1 font-medium">{errors.budget}</p>}
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
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-200 ${formData.travel_style === style.id
                    ? 'bg-[#d4fc3c] text-[#1a1d2e] border-[#d4fc3c]'
                    : 'bg-[#1a1d2e] text-white border-[#2d3447] hover:border-gray-600'
                    }`}
                >
                  <span className="text-3xl mb-2">{style.icon}</span>
                  <span className="font-bold text-sm">{style.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Dietary Preference - Chips */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white ml-1">
              <Utensils className="w-5 h-5 text-[#d4fc3c]" />
              Food Preferences
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'no-preference', label: 'Anything 🍽️' },
                { id: 'vegetarian', label: 'Vegetarian 🥬' },
                { id: 'non-vegetarian', label: 'Non-Veg 🍖' }
              ].map((diet) => (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => handleChange('dietary_preference', diet.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.dietary_preference === diet.id
                    ? 'bg-[#d4fc3c] text-[#1a1d2e] border-[#d4fc3c]'
                    : 'bg-[#1a1d2e] text-white border-[#2d3447] hover:border-gray-600'
                    }`}
                >
                  {diet.label}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Location */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-white ml-1">
              <Hotel className="w-5 h-5 text-[#d4fc3c]" />
              Starting Point (Hotel/Location)
            </label>
            <input
              type="text"
              value={formData.starting_location}
              onChange={(e) => handleChange('starting_location', e.target.value)}
              placeholder="e.g. Marriott Downtown or City Center"
              className={`w-full px-5 py-4 bg-[#1a1d2e] border-2 rounded-2xl focus:ring-2 focus:ring-[#d4fc3c] focus:border-[#d4fc3c] transition-all outline-none text-white placeholder-[#a1a8b8] font-medium ${errors.starting_location ? 'border-red-400' : 'border-[#2d3447] hover:border-gray-600'}`}
            />
            {errors.starting_location && <p className="text-red-400 text-sm ml-1 font-medium">{errors.starting_location}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#d4fc3c] hover:bg-[#c4ec2c] text-[#1a1d2e] font-black py-5 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3 mt-8 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span>Generating Your Dream Trip...</span>
          ) : (
            <>
              <span>Generate Itinerary</span>
              <Plane className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
