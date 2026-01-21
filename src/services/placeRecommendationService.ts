import type { Place, DietaryPreference, TimeSlot, TravelStyle } from '../types/trip';
import { getDestinationData } from '../data/placeData';

interface RecommendationFilter {
    destination: string;
    travelStyle: TravelStyle;
    budget: number;
    dietaryPreference?: DietaryPreference;
    timeSlot?: TimeSlot;
    category?: string;
}

/**
 * Get recommended places for a destination based on filters
 */
export function getRecommendedPlaces(filter: RecommendationFilter): Place[] {
    const destData = getDestinationData(filter.destination);
    let places = [...destData.places];

    // Filter by category if specified
    if (filter.category) {
        if (filter.category === 'food') {
            places = places.filter(p => p.category === 'food_spot');
        } else if (filter.category === 'place') {
            places = places.filter(p =>
                p.category !== 'food_spot' &&
                ['famous_attraction', 'hidden_gem', 'cultural_place', 'temple', 'fort', 'museum', 'viewpoint', 'park', 'market'].includes(p.category)
            );
        }
    }

    // Filter food by dietary preference
    if (filter.category === 'food' && filter.dietaryPreference) {
        places = filterByDietaryPreference(places, filter.dietaryPreference);
    }

    // Filter by time slot if specified
    if (filter.timeSlot) {
        places = places.filter(p =>
            !p.bestTimeToVisit || p.bestTimeToVisit.includes(filter.timeSlot!)
        );
    }

    // Filter by budget appropriateness
    const dailyBudget = (filter.budget / 7) * destData.budgetMultiplier; // Assume avg 7 days if not specified
    places = places.filter(p => {
        const avgCost = (p.costRange.min + p.costRange.max) / 2;
        // Allow places that cost less than 30% of daily budget
        return avgCost <= dailyBudget * 0.3;
    });

    // Adjust recommendations based on travel style
    places = sortByTravelStyle(places, filter.travelStyle);

    return places;
}

/**
 * Get food recommendations for a specific meal time
 */
export function getFoodRecommendations(
    destination: string,
    timeSlot: TimeSlot,
    dietaryPreference?: DietaryPreference,
    budget?: number
): Place[] {
    const filter: RecommendationFilter = {
        destination,
        travelStyle: 'Solo', // Default
        budget: budget || 10000,
        dietaryPreference,
        timeSlot,
        category: 'food',
    };

    return getRecommendedPlaces(filter);
}

/**
 * Get attraction recommendations (mix of famous and hidden gems)
 */
export function getAttractionRecommendations(
    destination: string,
    travelStyle: TravelStyle,
    budget: number,
    count: number = 10
): Place[] {
    const filter: RecommendationFilter = {
        destination,
        travelStyle,
        budget,
        category: 'place',
    };

    const places = getRecommendedPlaces(filter);

    // Ensure a good mix of famous attractions and hidden gems
    const famous = places.filter(p => !p.isHiddenGem);
    const gems = places.filter(p => p.isHiddenGem);

    const result: Place[] = [];
    const famousCount = Math.ceil(count * 0.7); // 70% famous
    const gemsCount = count - famousCount; // 30% hidden gems

    result.push(...famous.slice(0, famousCount));
    result.push(...gems.slice(0, gemsCount));

    return result.slice(0, count);
}

/**
 * Get cultural place recommendations (temples, forts, markets, museums)
 */
export function getCulturalPlaceRecommendations(
    destination: string,
    count: number = 5
): Place[] {
    const destData = getDestinationData(destination);
    const culturalPlaces = destData.places.filter(p =>
        ['temple', 'fort', 'market', 'museum', 'cultural_place'].includes(p.category)
    );

    return shuffleArray(culturalPlaces).slice(0, count);
}

/**
 * Filter places by dietary preference
 */
function filterByDietaryPreference(places: Place[], preference: DietaryPreference): Place[] {
    if (preference === 'no-preference') {
        return places;
    }

    return places.filter(place => {
        if (!place.dietaryType) return true;

        if (preference === 'vegetarian') {
            return place.dietaryType === 'veg' || place.dietaryType === 'both' || place.dietaryType === 'vegan';
        } else if (preference === 'non-vegetarian') {
            return place.dietaryType === 'non-veg' || place.dietaryType === 'both';
        }

        return true;
    });
}

/**
 * Sort places based on travel style preferences
 */
function sortByTravelStyle(places: Place[], travelStyle: TravelStyle): Place[] {
    const sorted = [...places];

    sorted.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (travelStyle === 'Family') {
            scoreA += a.tags.includes('family-friendly') ? 10 : 0;
            scoreB += b.tags.includes('family-friendly') ? 10 : 0;
            scoreA -= a.estimatedDuration > 150 ? 5 : 0; // Prefer shorter activities
            scoreB -= b.estimatedDuration > 150 ? 5 : 0;
        } else if (travelStyle === 'Backpacker') {
            scoreA += a.tags.includes('budget-friendly') ? 10 : 0;
            scoreB += b.tags.includes('budget-friendly') ? 10 : 0;
            scoreA += a.tags.includes('free-entry') ? 15 : 0;
            scoreB += b.tags.includes('free-entry') ? 15 : 0;
            scoreA += a.isHiddenGem ? 5 : 0; // Prefer hidden gems for backpackers
            scoreB += b.isHiddenGem ? 5 : 0;
        } else if (travelStyle === 'Solo') {
            scoreA += a.tags.includes('photography') ? 8 : 0;
            scoreB += b.tags.includes('photography') ? 8 : 0;
            scoreA += a.isHiddenGem ? 3 : 0;
            scoreB += b.isHiddenGem ? 3 : 0;
        }

        // Prefer reasonable costs
        const avgCostA = (a.costRange.min + a.costRange.max) / 2;
        const avgCostB = (b.costRange.min + b.costRange.max) / 2;

        if (travelStyle === 'Backpacker') {
            scoreA -= avgCostA / 100; // Lower cost is better
            scoreB -= avgCostB / 100;
        }

        return scoreB - scoreA;
    });

    return sorted;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get a specific place by ID
 */
export function getPlaceById(destination: string, placeId: string): Place | undefined {
    const destData = getDestinationData(destination);
    return destData.places.find(p => p.id === placeId);
}

/**
 * Get random places for variety
 */
export function getRandomPlaces(destination: string, count: number, excludeIds: string[] = []): Place[] {
    const destData = getDestinationData(destination);
    const available = destData.places.filter(p => !excludeIds.includes(p.id));
    return shuffleArray(available).slice(0, count);
}
