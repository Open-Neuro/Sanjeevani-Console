import { useState, useEffect } from 'react';
import { MoreVertical, Pill, Droplet, Check, Zap, Target, HeartPulse, Sparkles, Activity, Box } from 'lucide-react';
import { fetchDashboardProducts } from '../services/api';

const CategoryCards = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const iconMap: Record<string, any> = {
        'Antibiotics': Pill,
        'Pain Relievers': Droplet,
        'Vitamins & Supplements': Check,
        'Vitamins': Check,
        'Antiviral Drugs': Zap,
        'Diabetes Care': Target,
        'Cardiovascular': HeartPulse,
        'Allergy Medication': Sparkles,
        'Respiratory Medicines': Activity,
    };

    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            try {
                const res = await fetchDashboardProducts();
                if (res?.data?.category_breakdown && res.data.category_breakdown.length > 0) {
                    const dynamicCats = res.data.category_breakdown.map((item: any, idx: number) => ({
                        name: item.category || 'Unknown',
                        count: item.count.toString(),
                        change: item.change || '+0%', 
                        trend: item.trend || 'up',
                        icon: iconMap[item.category] || Pill,
                        active: idx === 0,
                    }));
                    setCategories(dynamicCats.slice(0, 8));
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Failed to load category products:", error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse p-4">
                        <div className="flex justify-between mb-4">
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                            <div className="h-3 w-3 bg-gray-100 rounded" />
                        </div>
                        <div className="h-8 w-12 bg-gray-100 rounded mb-4" />
                        <div className="flex justify-between items-center">
                            <div className="h-3 w-24 bg-gray-100 rounded" />
                            <div className="h-8 w-8 bg-gray-50 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Box size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No Inventory Data Yet</h3>
                    <p className="text-xs text-gray-500 max-w-xs mt-1">
                        Connect your inventory or add products to see real-time category distribution here.
                    </p>
                </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {categories.map((cat, i) => (
                <div
                    key={i}
                    className={`relative p-4 rounded-xl border ${cat.active
                        ? 'bg-[#0a2e2a] text-white border-transparent'
                        : 'bg-white text-gray-900 border-gray-100'
                        } shadow-sm hover:shadow-md transition-shadow`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-xs font-medium ${cat.active ? 'text-gray-200' : 'text-gray-600'}`}>
                            {cat.name}
                        </h3>
                        <button className={`${cat.active ? 'text-gray-400' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
                            <MoreVertical size={14} />
                        </button>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{cat.count}</h2>
                            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium">
                                <span className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${cat.trend === 'up'
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-red-500 bg-red-50'
                                    }`}>
                                    {cat.trend === 'up' ? (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                                    ) : (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                                    )}
                                    {cat.change}
                                </span>
                                <span className={`${cat.active ? 'text-gray-300' : 'text-gray-400'} whitespace-nowrap`}>Since last week</span>
                            </div>
                        </div>

                        <div className={`p-2 rounded-full flex items-center justify-center ${cat.active ? 'bg-[#bbed3b] text-[#0a2e2a]' : 'bg-gray-50 text-gray-500'}`}>
                            <cat.icon size={16} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryCards;

