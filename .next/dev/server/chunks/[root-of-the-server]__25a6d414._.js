module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/itinerary/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
;
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
function generatePrompt(destination, days, budget, style, hotel, constraints, month) {
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
async function POST(req) {
    try {
        const body = await req.json();
        const { destination, days, budget, style, hotel, constraints, month } = body;
        // Validate required fields
        if (!destination || !days || !budget || !style || !hotel) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields: destination, days, budget, style, hotel'
            }, {
                status: 400
            });
        }
        // Validate days is a positive number
        if (typeof days !== 'number' || days <= 0 || days > 30) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Days must be a number between 1 and 30'
            }, {
                status: 400
            });
        }
        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not configured');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.'
            }, {
                status: 500
            });
        }
        const prompt = generatePrompt(destination, days, budget, style, hotel, constraints, month);
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            itinerary: response.choices[0].message.content
        });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        // Handle specific OpenAI errors
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid OpenAI API key'
                }, {
                    status: 401
                });
            }
            if (error.message.includes('quota')) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'OpenAI API quota exceeded'
                }, {
                    status: 429
                });
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to generate itinerary. Please try again.'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__25a6d414._.js.map