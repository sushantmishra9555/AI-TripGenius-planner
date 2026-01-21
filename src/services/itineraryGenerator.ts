import type { TripFormData, TimeSlot, ItemCategory } from '../types/trip';
import {
  getFoodRecommendations,
  getAttractionRecommendations,
  getCulturalPlaceRecommendations,
} from './placeRecommendationService';
import { getDestinationData } from '../data/placeData';

interface ItineraryItemInput {
  day_number: number;
  time_slot: TimeSlot;
  category: ItemCategory;
  name: string;
  description: string;
  estimated_cost: number;
  estimated_duration: number;
  order_index: number;
  place_category?: string;
  dietary_type?: string;
  is_hidden_gem?: boolean;
  tags?: string[];
}

export function generateItinerary(tripData: TripFormData): ItineraryItemInput[] {
  const items: ItineraryItemInput[] = [];
  const destData = getDestinationData(tripData.destination);
  const dailyBudget = (tripData.budget / tripData.days) * destData.budgetMultiplier;

  // Budget allocation based on travel style
  const budgetPercentages = {
    Solo: { places: 0.5, food: 0.35, travel: 0.15 },
    Family: { places: 0.45, food: 0.40, travel: 0.15 },
    Backpacker: { places: 0.40, food: 0.35, travel: 0.25 },
  };

  const percentages = budgetPercentages[tripData.travel_style];

  // Get recommended places for the entire trip
  const attractions = getAttractionRecommendations(
    tripData.destination,
    tripData.travel_style,
    tripData.budget,
    tripData.days * 2 // 2 attractions per day
  );

  const culturalPlaces = getCulturalPlaceRecommendations(
    tripData.destination,
    Math.min(tripData.days, 5) // Max 5 cultural places
  );

  // Combine and prepare place rotation
  const allPlaces = [...attractions, ...culturalPlaces];
  let placeIndex = 0;

  for (let day = 1; day <= tripData.days; day++) {
    const timeSlots: TimeSlot[] = ['Morning', 'Afternoon', 'Evening'];
    let orderIndex = 0;

    timeSlots.forEach((slot, slotIndex) => {
      // First day morning: Check-in
      if (slotIndex === 0 && day === 1) {
        items.push({
          day_number: day,
          time_slot: slot,
          category: 'travel',
          name: `Check-in at ${tripData.starting_location}`,
          description: 'Arrive and settle into accommodation',
          estimated_cost: 0,
          estimated_duration: 60,
          order_index: orderIndex++,
        });
      }

      // Add place visit for Morning and Afternoon
      if (slot !== 'Evening' && allPlaces.length > 0) {
        const place = allPlaces[placeIndex % allPlaces.length];
        placeIndex++;

        const placeCost = (dailyBudget * percentages.places) / 2;
        const adjustedCost = Math.min(
          placeCost,
          (place.costRange.min + place.costRange.max) / 2
        );

        items.push({
          day_number: day,
          time_slot: slot,
          category: 'place',
          name: place.name,
          description: place.description,
          estimated_cost: Math.round(adjustedCost * 100) / 100,
          estimated_duration: place.estimatedDuration,
          order_index: orderIndex++,
          place_category: place.category,
          is_hidden_gem: place.isHiddenGem,
          tags: place.tags,
        });

        // Add local transport
        items.push({
          day_number: day,
          time_slot: slot,
          category: 'travel',
          name: 'Local Transport',
          description: slot === 'Morning'
            ? `From ${tripData.starting_location} to ${place.name}`
            : `Travel to ${place.name}`,
          estimated_cost: Math.round((dailyBudget * percentages.travel / 3) * 100) / 100,
          estimated_duration: 30,
          order_index: orderIndex++,
        });
      }

      // Add food recommendations
      const foodPlaces = getFoodRecommendations(
        tripData.destination,
        slot,
        tripData.dietary_preference,
        tripData.budget
      );

      if (foodPlaces.length > 0) {
        // Use modulo to cycle through available food places
        const foodIndex = ((day - 1) * 3 + slotIndex) % foodPlaces.length;
        const foodPlace = foodPlaces[foodIndex];
        const mealType = slot === 'Morning' ? 'Breakfast' : slot === 'Afternoon' ? 'Lunch' : 'Dinner';
        const mealCost = (dailyBudget * percentages.food) / 3;

        const adjustedFoodCost = Math.min(
          mealCost,
          (foodPlace.costRange.min + foodPlace.costRange.max) / 2
        );

        items.push({
          day_number: day,
          time_slot: slot,
          category: 'food',
          name: `${mealType} at ${foodPlace.name}`,
          description: foodPlace.description,
          estimated_cost: Math.round(adjustedFoodCost * 100) / 100,
          estimated_duration: slot === 'Evening' ? 90 : 60,
          order_index: orderIndex++,
          place_category: foodPlace.category,
          dietary_type: foodPlace.dietaryType,
          tags: foodPlace.tags,
        });
      } else {
        // Fallback to generic food if no recommendations available
        const mealType = slot === 'Morning' ? 'Breakfast' : slot === 'Afternoon' ? 'Lunch' : 'Dinner';
        const mealCost = (dailyBudget * percentages.food) / 3;

        items.push({
          day_number: day,
          time_slot: slot,
          category: 'food',
          name: `${mealType} at Local Restaurant`,
          description: 'Enjoy local cuisine',
          estimated_cost: Math.round(mealCost * 100) / 100,
          estimated_duration: slot === 'Evening' ? 90 : 60,
          order_index: orderIndex++,
          dietary_type: tripData.dietary_preference === 'vegetarian' ? 'veg' : 'both',
        });
      }
    });
  }

  return items;
}

export function calculateTotalCost(items: ItineraryItemInput[]): number {
  return items.reduce((total, item) => total + item.estimated_cost, 0);
}

export function calculateTotalDuration(items: ItineraryItemInput[]): number {
  return items.reduce((total, item) => total + item.estimated_duration, 0);
}

