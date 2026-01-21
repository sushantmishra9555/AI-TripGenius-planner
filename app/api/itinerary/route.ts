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
    constraints?: {
        budgetLevel: string;
        distanceLimit: boolean;
        walkingIntensity: string;
    },
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
- IMPORTANT: Include GPS coordinates (lat, lon) for each place (REQUIRED for map)
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
  "day_1": {
    "places": [
      {
        "name": "Place Name",
        "description": "Description",
        "entry_fee": "Free or ₹amount",
        "lat": 28.6139,
        "lon": 77.2090
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
`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { destination, days, budget, style, hotel, constraints, month } = body;

        // Validate required fields
        if (!destination || !days || !budget || !style || !hotel) {
            return NextResponse.json(
                { error: 'Missing required fields: destination, days, budget, style, hotel' },
                { status: 400 }
            );
        }

        // Validate days is a positive number
        if (typeof days !== 'number' || days <= 0 || days > 30) {
            return NextResponse.json(
                { error: 'Days must be a number between 1 and 30' },
                { status: 400 }
            );
        }

        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not configured');
            return NextResponse.json(
                { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.' },
                { status: 500 }
            );
        }

        const prompt = generatePrompt(destination, days, budget, style, hotel, constraints, month);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        return NextResponse.json({
            itinerary: response.choices[0].message.content,
        });
    } catch (error) {
        console.error('OpenAI API Error:', error);

        // Handle specific OpenAI errors
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return NextResponse.json(
                    { error: 'Invalid OpenAI API key' },
                    { status: 401 }
                );
            }
            if (error.message.includes('quota')) {
                return NextResponse.json(
                    { error: 'OpenAI API quota exceeded' },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to generate itinerary. Please try again.' },
            { status: 500 }
        );
    }
}
