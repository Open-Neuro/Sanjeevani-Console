
import { MoreVertical, Pill, Droplet, Check, Zap, Target, HeartPulse, Sparkles, Activity } from 'lucide-react';

const CategoryCards = () => {
    const categories = [
        {
            name: 'Antibiotics',
            count: '120',
            change: '+2%',
            trend: 'up',
            icon: Pill,
            active: true,
        },
        {
            name: 'Pain Relievers',
            count: '95',
            change: '+0.6%',
            trend: 'down',
            icon: Droplet,
            active: false,
        },
        {
            name: 'Vitamins & Supplements',
            count: '75',
            change: '+2%',
            trend: 'up',
            icon: Check,
            active: false,
        },
        {
            name: 'Antiviral Drugs',
            count: '50',
            change: '+0.2%',
            trend: 'down',
            icon: Zap,
            active: false,
        },
        {
            name: 'Diabetes Care',
            count: '65',
            change: '+0.1%',
            trend: 'down',
            icon: Target,
            active: false,
        },
        {
            name: 'Cardiovascular',
            count: '80',
            change: '+8%',
            trend: 'up',
            icon: HeartPulse,
            active: false,
        },
        {
            name: 'Allergy Medication',
            count: '40',
            change: '+5%',
            trend: 'up',
            icon: Sparkles,
            active: false,
        },
        {
            name: 'Respiratory Medicines',
            count: '55',
            change: '+2.6%',
            trend: 'up',
            icon: Activity,
            active: false,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-8 mb-6">
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
