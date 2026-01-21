import { useState } from 'react';
import TripForm from './components/TripForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import { generateItinerary } from './services/itineraryGenerator';
import type { TripFormData, Trip, ItineraryItem } from './types/trip';
import { Plane } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: TripFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create trip object without Supabase - work entirely client-side
      const trip: Trip = {
        id: `trip-${Date.now()}`, // Generate a simple ID
        destination: formData.destination,
        days: formData.days,
        budget: formData.budget,
        currency: formData.currency,
        travel_style: formData.travel_style,
        starting_location: formData.starting_location,
        dietary_preference: formData.dietary_preference,
        created_at: new Date().toISOString(),
      };

      // Generate itinerary items
      const generatedItems = generateItinerary(formData);

      // Map to include IDs and trip reference
      const items: ItineraryItem[] = generatedItems.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        trip_id: trip.id,
        day_number: item.day_number,
        time_slot: item.time_slot,
        category: item.category,
        name: item.name,
        description: item.description,
        estimated_cost: item.estimated_cost,
        estimated_duration: item.estimated_duration,
        order_index: item.order_index,
        place_category: item.place_category as any,
        dietary_type: item.dietary_type as any,
        is_hidden_gem: item.is_hidden_gem,
        tags: item.tags,
        created_at: new Date().toISOString(),
      }));

      setCurrentTrip(trip);
      setItineraryItems(items);
    } catch (err) {
      console.error('Error creating itinerary:', err);
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentTrip(null);
    setItineraryItems([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {!currentTrip ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="mb-8 flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-800">TripGenius</h1>
            </div>
            <TripForm onSubmit={handleSubmit} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-2xl">
                {error}
              </div>
            )}
          </div>
        ) : (
          <ItineraryDisplay
            trip={currentTrip}
            items={itineraryItems}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

export default App;

