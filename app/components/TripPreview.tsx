'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Wallet, Users, Utensils, Sparkles, Zap, Route, Brain } from 'lucide-react';

interface TripPreviewProps {
    destination: string;
    month: string;
    days: string;
    currency: string;
    budget: string;
    travelType: string;
    foodPreference: string;
}

const travelTypeLabels: Record<string, { label: string; icon: string }> = {
    solo: { label: 'Solo Traveler', icon: '👤' },
    family: { label: 'Family Trip', icon: '👨👩👧' },
    backpacker: { label: 'Backpacker', icon: '🎒' },
};

const foodLabels: Record<string, { label: string; icon: string }> = {
    anything: { label: 'All cuisines', icon: '🍽' },
    vegetarian: { label: 'Vegetarian', icon: '🥬' },
    'non-veg': { label: 'Non-Vegetarian', icon: '🍗' },
};

const monthNames: Record<string, string> = {
    january: 'January', february: 'February', march: 'March', april: 'April',
    may: 'May', june: 'June', july: 'July', august: 'August',
    september: 'September', october: 'October', november: 'November', december: 'December',
};

const TripPreview: React.FC<TripPreviewProps> = ({
    destination, month, days, currency, budget, travelType, foodPreference,
}) => {
    const travelInfo = travelTypeLabels[travelType] || travelTypeLabels.solo;
    const foodInfo = foodLabels[foodPreference] || foodLabels.anything;

    return (
        <div className="preview-card rounded-2xl p-6 md:p-8 shadow-glass animate-fade-in-up animation-delay-200 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">Trip Preview</h3>
                    <p className="text-sm text-muted-foreground">Live summary of your trip</p>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50 transition-all duration-300">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Destination</p>
                        <p className="font-medium text-foreground truncate">
                            {destination || <span className="text-muted-foreground/60 italic">Not selected</span>}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                        <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Month</p>
                            <p className="font-medium text-foreground truncate">
                                {monthNames[month] || <span className="text-muted-foreground/60 italic">—</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                        <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Duration</p>
                            <p className="font-medium text-foreground">
                                {days ? `${days} days` : <span className="text-muted-foreground/60 italic">—</span>}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                    <Wallet className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Budget / Person</p>
                        <p className="font-medium text-foreground">
                            {budget ? `${currency} ${parseInt(budget).toLocaleString()}` : <span className="text-muted-foreground/60 italic">Not set</span>}
                        </p>
                        {budget && days && parseInt(days) > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                ~{currency} {Math.round(parseInt(budget) / parseInt(days)).toLocaleString()} per day
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                        <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Travel Style</p>
                            <p className="font-medium text-foreground flex items-center gap-1.5">
                                <span>{travelInfo.icon}</span>
                                <span className="truncate">{travelInfo.label}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                        <Utensils className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Food</p>
                            <p className="font-medium text-foreground flex items-center gap-1.5">
                                <span>{foodInfo.icon}</span>
                                <span className="truncate">{foodInfo.label}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">AI will optimize</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 px-3 py-2 rounded-lg">
                        <Route className="w-3.5 h-3.5 text-accent" />
                        <span>Routes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 px-3 py-2 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Time</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 px-3 py-2 rounded-lg">
                        <Wallet className="w-3.5 h-3.5 text-accent" />
                        <span>Budget</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                    <Zap className="w-3 h-3 inline mr-1 text-accent" />
                    Powered by AI for smarter travel planning
                </p>
            </div>
        </div>
    );
};

export default TripPreview;
