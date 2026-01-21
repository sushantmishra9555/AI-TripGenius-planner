import { useState } from 'react';
import { z } from 'zod';
import { MapPin, Calendar, DollarSign, Users, Hotel, Utensils } from 'lucide-react';
import type { TripFormData } from '../types/trip';

const tripSchema = z.object({
  destination: z.string().min(2, 'Destination must be at least 2 characters'),
  days: z.number().min(1, 'Trip must be at least 1 day').max(30, 'Trip cannot exceed 30 days'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  currency: z.string().min(3, 'Currency is required'),
  travel_style: z.enum(['Solo', 'Family', 'Backpacker']),
  starting_location: z.string().min(2, 'Starting location must be at least 2 characters'),
});

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    days: 3,
    budget: 1000,
    currency: 'USD',
    travel_style: 'Solo',
    starting_location: '',
    dietary_preference: 'no-preference',
  });

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
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Plan Your Perfect Trip</h1>
        <p className="text-gray-600">Create a realistic, optimized itinerary tailored to your style</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Destination
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => handleChange('destination', e.target.value)}
            placeholder="e.g., Paris, France or Tokyo"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.destination ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Number of Days
          </label>
          <input
            type="number"
            value={formData.days}
            onChange={(e) => handleChange('days', parseInt(e.target.value) || 1)}
            min="1"
            max="30"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.days ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.days && <p className="text-red-500 text-sm mt-1">{errors.days}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Budget
          </label>
          <div className="flex gap-2">
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
            />
          </div>
          {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            Travel Style
          </label>
          <select
            value={formData.travel_style}
            onChange={(e) => handleChange('travel_style', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Solo">Solo</option>
            <option value="Family">Family</option>
            <option value="Backpacker">Backpacker</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Utensils className="w-4 h-4 text-blue-600" />
            Dietary Preference
          </label>
          <select
            value={formData.dietary_preference}
            onChange={(e) => handleChange('dietary_preference', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="no-preference">No Preference</option>
            <option value="vegetarian">Vegetarian 🥬</option>
            <option value="non-vegetarian">Non-Vegetarian 🍖</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Hotel className="w-4 h-4 text-blue-600" />
            Starting Location
          </label>
          <input
            type="text"
            value={formData.starting_location}
            onChange={(e) => handleChange('starting_location', e.target.value)}
            placeholder="e.g., Marriott Downtown"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${errors.starting_location ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.starting_location && <p className="text-red-500 text-sm mt-1">{errors.starting_location}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isLoading ? 'Generating Itinerary...' : 'Generate Itinerary'}
      </button>
    </form>
  );
}
