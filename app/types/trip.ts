export type TravelStyle = 'Solo' | 'Family' | 'Backpacker';

export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening';

export type ItemCategory = 'place' | 'food' | 'travel';

export type PlaceCategory =
  | 'famous_attraction'
  | 'hidden_gem'
  | 'cultural_place'
  | 'food_spot'
  | 'temple'
  | 'fort'
  | 'market'
  | 'museum'
  | 'viewpoint'
  | 'park';

export type DietaryType = 'veg' | 'non-veg' | 'both' | 'vegan';

export type DietaryPreference = 'vegetarian' | 'non-vegetarian' | 'no-preference' | 'vegan' | 'halal';


export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  subcategory?: string;
  dietaryType?: DietaryType; // For food spots
  estimatedDuration: number; // in minutes
  costRange: {
    min: number;
    max: number;
    currency: string;
  };
  bestTimeToVisit?: TimeSlot[];
  tags: string[]; // ['historical', 'photography', 'family-friendly', etc.]
  isHiddenGem: boolean;
}

export interface DestinationData {
  name: string;
  places: Place[];
  defaultCurrency: string;
  budgetMultiplier: number;
}

export interface Trip {
  id: string;
  destination: string;
  days: number;
  budget: number;
  currency: string;
  travel_style: TravelStyle;
  starting_location: string;
  dietary_preference?: DietaryPreference;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_number: number;
  time_slot: TimeSlot;
  category: ItemCategory;
  name: string;
  description: string;
  estimated_cost: number;
  estimated_duration: number;
  order_index: number;
  place_category?: PlaceCategory;
  dietary_type?: DietaryType;
  is_hidden_gem?: boolean;
  tags?: string[];
  created_at: string;
}

export interface TripFormData {
  destination: string;
  days: number;
  budget: number;
  currency: string;
  travel_style: TravelStyle;
  starting_location: string;
  dietary_preference?: DietaryPreference;
  month?: string;
}

export interface Hotel {
  name: string;
  description: string;
  price_range: string;
  rating: number;
  amenities: string[];
  distance_from_center?: string;
  address?: string;
}

export interface WeatherSnapshot {
  temp: string;
  rain_chance: string;
  climate: string;
}

export interface PracticalTips {
  currency_tips: string;
  tipping: string;
  transport: string;
  safety: string;
}

export interface LocalHighlight {
  title: string;
  description: string;
}

export interface ItineraryResponse {
  seasonal_warning?: {
    title: string | null;
    description: string;
    severity: 'high' | 'moderate' | 'info' | 'none';
  };
  weather?: WeatherSnapshot;
  local_highlight?: LocalHighlight;
  practical_tips?: PracticalTips;
  hotels: Hotel[];
  // Loose typing for the dynamic object structure (day_1, day_2, etc)
  [key: string]: any;
}
