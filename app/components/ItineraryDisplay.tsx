'use client';

import { MapPin, Utensils, Clock, Route, Lightbulb, Calendar, ArrowRight, Navigation, Download, Share2, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { formatDistance, formatTravelTime, calculateDistance } from '../utils/distance';
import RouteMap from './RouteMap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Place {
  name: string;
  description: string;
  entry_fee?: string;
  lat?: number;
  lon?: number;
}

interface Food {
  name: string;
  description: string;
}

interface DayItinerary {
  places: Place[];
  food: Food[];
  travel_time?: string;
  notes?: string;
}

interface SeasonalWarning {
  title: string | null;
  description: string;
  severity: 'high' | 'moderate' | 'info' | 'none';
}

interface ItineraryData {
  seasonal_warning?: SeasonalWarning;
  hotel_coordinates?: {
    lat: number;
    lon: number;
  };
  [key: string]: DayItinerary | SeasonalWarning | { lat: number; lon: number } | undefined;
}

interface ItineraryDisplayProps {
  jsonData: string;
  onReset: () => void;
  tripParams?: any;
}

// Pexels API helper
const fetchPexelsImage = async (query: string): Promise<string | null> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' landmark travel')}&per_page=1`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Pexels image:', error);
    return null;
  }
};

// Place Card Component with Pexels Integration and Distance Calculation
const PlaceCard = ({
  place,
  idx,
  startLat,
  startLon
}: {
  place: Place;
  idx: number;
  startLat?: number;
  startLon?: number;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      const url = await fetchPexelsImage(place.name);
      if (url) {
        setImageUrl(url);
      } else {
        setImageError(true);
      }
      setImageLoading(false);
    };
    loadImage();
  }, [place.name]);

  // Calculate distance and travel time
  let distance: number | null = null;
  let travelTime: number | null = null;

  if (startLat && startLon && place.lat && place.lon) {
    distance = calculateDistance(startLat, startLon, place.lat, place.lon);
    // Estimate 40 km/h average speed in city
    travelTime = Math.round((distance / 40) * 60); // minutes
  }

  // Gradient and emoji fallback
  const gradients = [
    'from-blue-400 via-blue-500 to-indigo-600',
    'from-purple-400 via-purple-500 to-pink-600',
    'from-green-400 via-teal-500 to-cyan-600',
    'from-orange-400 via-red-500 to-pink-600',
  ];
  const gradient = gradients[idx % gradients.length];
  const placeEmojis = ['🏛️', '🗼', '🏰', '⛩️', '🕌', '🎡'];
  const emoji = placeEmojis[idx % placeEmojis.length];

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-xl border border-white/40 hover:border-blue-300 transition-all hover:scale-[1.02] shadow-md hover:shadow-xl overflow-hidden">
      {/* Image or Gradient Header */}
      <div className="relative h-48 overflow-hidden">
        {imageLoading ? (
          // Loading skeleton
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        ) : imageUrl && !imageError ? (
          // Real Pexels image
          <>
            <img
              src={imageUrl}
              alt={place.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        ) : (
          // Fallback to gradient with emoji
          <div className={`relative h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <div className="text-8xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-2xl">
              {emoji}
            </div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
            </div>
          </div>
        )}

        {/* Number badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg z-10">
          {idx + 1}
        </div>

        {/* Entry fee badge */}
        {place.entry_fee && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 backdrop-blur-sm">
            {place.entry_fee}
          </div>
        )}

        {/* Distance badge */}
        {distance !== null && (
          <div className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* Place Info */}
      <div className="p-5">
        <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition">
          {place.name}
        </h4>

        {/* Distance and Travel Time */}
        {distance !== null && travelTime !== null && (
          <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Navigation className="w-4 h-4 text-blue-600" />
              {formatDistance(distance)} away
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-600" />
              ~{formatTravelTime(travelTime)}
            </span>
          </div>
        )}

        <p className="text-gray-700 text-sm leading-relaxed">
          {place.description}
        </p>
      </div>
    </div>
  );
};

export default function ItineraryDisplay({ jsonData, onReset, tripParams }: ItineraryDisplayProps) {
  const itineraryRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  let itinerary: ItineraryData;

  try {
    // Try to parse the JSON
    const cleaned = jsonData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    itinerary = JSON.parse(cleaned);
  } catch (error) {
    // If parsing fails, show the raw text
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-8 border border-white/40">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Your AI-Generated Itinerary</h2>
            <button
              onClick={onReset}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Create New Trip
            </button>
          </div>
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed bg-gray-50 p-6 rounded-lg">
              {jsonData}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(itineraryRef.current, {
        // @ts-ignore
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`trip-to-${tripParams?.destination || 'destination'}.pdf`);

      showNotification('PDF Downloaded Successfully! 📄');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      showNotification('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Share Link Handler
  const handleShare = () => {
    if (!tripParams) return;

    // Construct query params
    const params = new URLSearchParams();
    Object.entries(tripParams).forEach(([key, value]) => {
      // @ts-ignore
      if (value) params.append(key, String(value));
    });

    const shareUrl = `${window.location.origin}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    showNotification('Link copied to clipboard! 🔗');
  };

  // Save Trip Handler
  const handleSaveTrip = () => {
    if (!tripParams || !jsonData) return;

    const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
    const newTrip = {
      id: Date.now(),
      params: tripParams,
      itinerary: jsonData,
      date: new Date().toISOString(),
      destination: tripParams.destination
    };

    // Add to beginning, limit to 10
    const updatedTrips = [newTrip, ...savedTrips].slice(0, 10);
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
    showNotification('Trip saved to "My Trips"! 💾');
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Determine warning styles
  const getWarningStyle = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'moderate': return 'bg-orange-50 border-orange-200 text-orange-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative" ref={itineraryRef}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in-down flex items-center gap-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-5xl font-bold mb-3">Your Dream Itinerary ✨</h1>
            <p className="text-blue-100 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {Object.keys(itinerary).filter(k => k.startsWith('day_')).length} Day{Object.keys(itinerary).filter(k => k.startsWith('day_')).length > 1 ? 's' : ''} of Unforgettable Experiences
            </p>
          </div>

          <div className="flex gap-3">
            {/* Action Buttons */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition text-white border border-white/30"
              title="Download PDF"
            >
              <Download className={`w-6 h-6 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition text-white border border-white/30"
              title="Share Trip"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={handleSaveTrip}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition text-white border border-white/30"
              title="Save Trip"
            >
              <Heart className="w-6 h-6" />
            </button>
            <button
              onClick={onReset}
              className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              New Trip
            </button>
          </div>
        </div>
      </div>

      {/* Seasonal Warning Alert */}
      {itinerary.seasonal_warning && itinerary.seasonal_warning.title && itinerary.seasonal_warning.severity !== 'none' && (
        <div className={`mb-8 p-6 rounded-2xl border-2 shadow-sm ${getWarningStyle(itinerary.seasonal_warning.severity)}`}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/50 rounded-full text-2xl">
              {itinerary.seasonal_warning.severity === 'high' ? '⛈️' : itinerary.seasonal_warning.severity === 'moderate' ? '⚠️' : '🎉'}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{itinerary.seasonal_warning.title}</h3>
              <p className="opacity-90 leading-relaxed font-medium">
                {itinerary.seasonal_warning.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      <div className="mb-8">
        <RouteMap
          places={
            Object.entries(itinerary)
              .filter(([key]) => key.startsWith('day_'))
              .flatMap(([day, info]) => {
                const dayNum = parseInt(day.replace('day_', ''));
                const dayInfo = info as DayItinerary;
                return dayInfo.places.map(p => ({ ...p, day: dayNum }));
              })
          }
          startLat={itinerary.hotel_coordinates?.lat}
          startLon={itinerary.hotel_coordinates?.lon}
        />
      </div>


      {/* Day Cards - Zomato/MakeMyTrip Style */}
      <div className="space-y-6">
        {Object.entries(itinerary)
          .filter(([key]) => key.startsWith('day_'))
          .map(([day, info], index) => {
            const dayNumber = day.replace('day_', '');
            const dayInfo = info as DayItinerary;

            // Extract hotel coordinates
            const hotelCoords = itinerary.hotel_coordinates;

            return (
              <div
                key={day}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/40"
              >
                {/* Day Header - MakeMyTrip Style */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-blue-600">{dayNumber}</span>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">DAY {dayNumber}</h2>
                        {dayInfo.travel_time && (
                          <p className="text-blue-100 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            Total Travel Time: {dayInfo.travel_time}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-semibold">
                        Day {index + 1}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Places Section - Zomato Card Style with Images */}
                  {dayInfo.places && dayInfo.places.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Places to Visit ({dayInfo.places.length})
                        </h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {dayInfo.places.map((place, idx) => (
                          <PlaceCard
                            key={idx}
                            place={place}
                            idx={idx}
                            startLat={hotelCoords?.lat}
                            startLon={hotelCoords?.lon}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Food Section - Zomato Style */}
                  {dayInfo.food && dayInfo.food.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Utensils className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Where to Eat ({dayInfo.food.length})
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {dayInfo.food.map((foodItem, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-md group"
                          >
                            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow">
                              🍽️
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition">
                                {foodItem.name}
                              </h4>
                              <p className="text-gray-700 text-sm">
                                {foodItem.description}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {dayInfo.notes && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-500 p-2 rounded-lg flex-shrink-0">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            Pro Tips & Notes
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {dayInfo.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Route Indicator */}
                  {index < Object.keys(itinerary).filter(k => k.startsWith('day_')).length - 1 && (
                    <div className="flex justify-center mt-6">
                      <div className="bg-gray-100 px-6 py-2 rounded-full flex items-center gap-2 text-gray-600">
                        <Route className="w-4 h-4" />
                        <span className="text-sm font-medium">Continue to Day {parseInt(dayNumber) + 1}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/40">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready for Your Adventure? 🎉</h3>
        <p className="text-gray-600 mb-6">
          Your personalized {Object.keys(itinerary).length}-day itinerary is ready. Safe travels!
        </p>
        <button
          onClick={onReset}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Create Another Itinerary
        </button>
      </div>
    </div>
  );
}
