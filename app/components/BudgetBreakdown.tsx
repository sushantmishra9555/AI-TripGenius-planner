'use client';

import { Wallet, PieChart } from 'lucide-react';
import type { TravelStyle } from '../types/trip';

interface BudgetBreakdownProps {
    travelStyle: TravelStyle;
    totalBudget: number;
    currency: string;
}

type Category = 'Food' | 'Travel' | 'Stay' | 'Tickets' | 'Misc';

interface BudgetCategory {
    label: Category;
    percent: number;
    color: string;
    bgColor: string;
    icon: string;
}

const BUDGET_MAPPING: Record<TravelStyle, BudgetCategory[]> = {
    Solo: [
        { label: 'Stay', percent: 35, color: 'bg-purple-500', bgColor: 'bg-purple-100', icon: '🏨' },
        { label: 'Food', percent: 25, color: 'bg-orange-500', bgColor: 'bg-orange-100', icon: '🍽️' },
        { label: 'Travel', percent: 25, color: 'bg-blue-500', bgColor: 'bg-blue-100', icon: '🚕' },
        { label: 'Tickets', percent: 15, color: 'bg-teal-500', bgColor: 'bg-teal-100', icon: '🎟️' },
    ],
    Family: [
        { label: 'Stay', percent: 40, color: 'bg-purple-500', bgColor: 'bg-purple-100', icon: '🏨' },
        { label: 'Food', percent: 30, color: 'bg-orange-500', bgColor: 'bg-orange-100', icon: '🍽️' },
        { label: 'Travel', percent: 20, color: 'bg-blue-500', bgColor: 'bg-blue-100', icon: '🚕' },
        { label: 'Tickets', percent: 10, color: 'bg-teal-500', bgColor: 'bg-teal-100', icon: '🎟️' },
    ],
    Backpacker: [
        { label: 'Travel', percent: 40, color: 'bg-blue-500', bgColor: 'bg-blue-100', icon: '🚕' },
        { label: 'Food', percent: 30, color: 'bg-orange-500', bgColor: 'bg-orange-100', icon: '🍽️' },
        { label: 'Stay', percent: 20, color: 'bg-purple-500', bgColor: 'bg-purple-100', icon: '🏨' },
        { label: 'Tickets', percent: 10, color: 'bg-teal-500', bgColor: 'bg-teal-100', icon: '🎟️' },
    ],
};

export default function BudgetBreakdown({ travelStyle, totalBudget, currency }: BudgetBreakdownProps) {
    // Fallback to Solo if style matches nothing (safety)
    const distribution = BUDGET_MAPPING[travelStyle] || BUDGET_MAPPING['Solo'];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 rounded-xl">
                    <PieChart className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Estimated Budget Split</h3>
                    <p className="text-sm text-gray-500">Based on {travelStyle} travel style</p>
                </div>
            </div>

            <div className="space-y-4">
                {distribution.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-gray-700">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-normal">
                                    {formatCurrency(totalBudget * (item.percent / 100))}
                                </span>
                                <span className="text-gray-900 font-bold">{item.percent}%</span>
                            </div>
                        </div>
                        {/* Progress Bar Background */}
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            {/* Progress Bar Fill */}
                            <div
                                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${item.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-800">
                    <strong>Pro Tip:</strong> Keep 10% extra as emergency fund ({formatCurrency(totalBudget * 0.10)}).
                </p>
            </div>
        </div>
    );
}
