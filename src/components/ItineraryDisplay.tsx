import { MapPin, Utensils, Navigation, Clock, DollarSign, Calendar, Star, Landmark } from 'lucide-react';
import type { Trip, ItineraryItem } from '../types/trip';

interface ItineraryDisplayProps {
  trip: Trip;
  items: ItineraryItem[];
  onReset: () => void;
}

export default function ItineraryDisplay({ trip, items, onReset }: ItineraryDisplayProps) {
  const itemsByDay = items.reduce((acc, item) => {
    if (!acc[item.day_number]) {
      acc[item.day_number] = [];
    }
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  const totalCost = items.reduce((sum, item) => sum + item.estimated_cost, 0);
  const totalDuration = items.reduce((sum, item) => sum + item.estimated_duration, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'place':
        return <MapPin className="w-5 h-5" />;
      case 'food':
        return <Utensils className="w-5 h-5" />;
      case 'travel':
        return <Navigation className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'place':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'food':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'travel':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDietaryIcon = (dietaryType?: string) => {
    switch (dietaryType) {
      case 'veg':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">🥬 Veg</span>;
      case 'non-veg':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 ml-2">🍖 Non-Veg</span>;
      case 'both':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">🍽️ Both</span>;
      case 'vegan':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 ml-2">🌱 Vegan</span>;
      default:
        return null;
    }
  };

  const getPlaceBadge = (item: ItineraryItem) => {
    if (item.category !== 'place') return null;

    const badges = [];

    if (item.is_hidden_gem) {
      badges.push(
        <span key="hidden-gem" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 ml-2">
          <Star className="w-3 h-3 mr-1" />
          Hidden Gem
        </span>
      );
    }

    if (item.place_category === 'fort' || item.place_category === 'temple' || item.place_category === 'cultural_place') {
      badges.push(
        <span key="cultural" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 ml-2">
          <Landmark className="w-3 h-3 mr-1" />
          Cultural
        </span>
      );
    }

    return badges;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your {trip.destination} Itinerary</h1>
            <p className="text-gray-600">
              {trip.days} {trip.days === 1 ? 'day' : 'days'} • {trip.travel_style} travel • Starting from {trip.starting_location}
            </p>
          </div>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
          >
            New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-xl font-bold text-gray-800">
                {trip.currency} {totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Budget: {trip.currency} {trip.budget.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-xl font-bold text-gray-800">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activities</p>
              <p className="text-xl font-bold text-gray-800">{items.length} items</p>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(itemsByDay)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((dayNum) => {
          const dayNumber = parseInt(dayNum);
          const dayItems = itemsByDay[dayNumber].sort((a, b) => a.order_index - b.order_index);
          const dayCost = dayItems.reduce((sum, item) => sum + item.estimated_cost, 0);

          return (
            <div key={dayNumber} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Day {dayNumber}</h2>
                  <p className="text-blue-100">
                    {trip.currency} {dayCost.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-4">
                {['Morning', 'Afternoon', 'Evening'].map((timeSlot) => {
                  const slotItems = dayItems.filter(item => item.time_slot === timeSlot);
                  if (slotItems.length === 0) return null;

                  return (
                    <div key={timeSlot} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        {timeSlot}
                      </h3>
                      {slotItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 transition hover:shadow-md ${getCategoryColor(item.category)}`}
                        >
                          <div className="mt-1">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {item.name}
                              {getDietaryIcon(item.dietary_type)}
                              {getPlaceBadge(item)}
                            </h4>
                            <p className="text-sm opacity-80 mt-1">{item.description}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.estimated_duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {trip.currency} {item.estimated_cost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
}
