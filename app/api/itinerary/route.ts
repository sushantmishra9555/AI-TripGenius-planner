import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function generatePrompt(
    destination: string,
    days: number,
    budget: number,
    style: string,
    hotel: string,
    constraints?: any,
    month?: string
): string {
    // Build smart constraints text
    let smartRules = '';

    if (constraints) {
        if (constraints.budgetLevel === 'budget') {
            smartRules += '\n- BUDGET LOW: Prioritize FREE activities, local markets, and nature spots.';
        } else if (constraints.budgetLevel === 'premium') {
            smartRules += '\n- PREMIUM MODE: Include luxury dining and exclusive experiences.';
        }

        if (constraints.distanceLimit) {
            smartRules += '\n- SHORT TRIP: Skip far places. Keep all locations central to save travel time.\n- Max travel between spots: 20 mins.';
        }

        if (constraints.walkingIntensity === 'low') {
            smartRules += '\n- FAMILY MODE: Reduce walking usage. Suggest places with easy access and seating.\n- Kid-friendly content.';
        } else if (constraints.walkingIntensity === 'high') {
            smartRules += '\n- BACKPACKER MODE: High walking intensity allowed.';
        }
    }

    return `
You are a professional travel planner.

Create a realistic ${days}-day itinerary for ${destination}.
Budget: ₹${budget}
Travel style: ${style}
Starting location: ${hotel}
Travel Month: ${month || 'Not specified'}

RULES:
- Max 4 places per day
- Group nearby locations
- Include food suggestions
- Include travel time estimates
- Make it practical for Indian travelers
- Avoid unrealistic rushing
- **CRITICAL**: Provide REAL GPS coordinates for ALL places. Do NOT return 0,0. verify coordinates.
- Optimize order by distance (nearest places first)
${smartRules}

ROLE:
You are a local guide who knows the best times to visit.
- Check if ${month} is a MONSOON month for ${destination}. If yes, WARN about rain.
- Check if ${month} is PEAK season (crowds).
- Check if any MAJOR FESTIVALS happen in ${month} in ${destination} (e.g. Diwali, Christmas, Cherry Blossoms).

OUTPUT FORMAT (STRICT JSON):
{
  "seasonal_warning": {
      "title": "Warning Title (e.g. 'Monsoon Alert' or 'Diwali Festival') or null",
      "description": "Short explanation of what to expect (rain, crowds, or events).",
      "severity": "high" | "moderate" | "info" | "none"
  },
  "hotel_coordinates": {
    "lat": 28.6139,
    "lon": 77.2090  
  },
  "hotels": [
    {
      "name": "Hotel Name",
      "description": "Brief description",
      "price_range": "Range",
      "rating": 4.5,
      "amenities": ["WiFi"],
      "distance_from_center": "Distance"
    }
  ],
  "day_1": {
    "places": [
      {
        "name": "Gateway of India",
        "description": "Description",
        "entry_fee": "Free or ₹amount",
        "lat": 18.9220,
        "lon": 72.8347
      }
    ],
    "food": [
      {
        "name": "Restaurant Name",
        "description": "Description"
      }
    ],
    "travel_time": "Total time for day",
    "notes": "Tips and suggestions"
  }
}

IMPORTANT: Include 3-5 hotel recommendations based on the budget level.
`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { destination, days, budget, style, hotel, constraints, month } = body;

        // Validate required fields
        if (!destination || !days || !budget || !style || !hotel) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key missing' },
                { status: 500 }
            );
        }

        const prompt = generatePrompt(destination, days, budget, style, hotel, constraints, month);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        // Return the JSON directly (frontend parses it)
        return NextResponse.json({
            itinerary: response.choices[0].message.content,
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate itinerary' },
            { status: 500 }
        );
    }
}
