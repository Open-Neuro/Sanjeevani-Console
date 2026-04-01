import { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import { fetchDashboardOverview } from '../services/api';
import DataCard from './ui/DataCard';

type StatCard = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
};

const StatCards = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await fetchDashboardOverview();
                setStats(response.data || {});
            } catch (err) {
                console.error("Error loading dashboard stats:", err);
                setStats({
                    total_products: 0,
                    low_stock_items: 0,
                    expiry_risk_items: 0,
                });
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const statCards: StatCard[] = [
        {
            title: "Total Products",
            value: stats?.total_products?.toLocaleString() || '0',
            icon: <Package size={20} className="text-gray-700" />,
            bgColor: "bg-gray-50",
            textColor: "text-gray-700"
        },
        {
            title: "Low Stock Items",
            value: stats?.low_stock_items ?? '0',
            icon: <AlertTriangle size={20} className="text-yellow-500" />,
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-500"
        },
        {
            title: "Out of Stock",
            value: stats?.expiry_risk_items ?? '0',
            icon: <XCircle size={20} className="text-red-500" />,
            bgColor: "bg-red-50",
            textColor: "text-red-500"
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-300" size={24} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((card, i) => (
                <DataCard
                    key={i}
                    title={card.title}
                    value={card.value}
                    icon={(
                        <div className={`p-2.5 ${card.bgColor} ${card.textColor} rounded-full`}>
                            {card.icon}
                        </div>
                    )}
                    className="hover:shadow-md transition-shadow"
                    action={(
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical size={18} />
                        </button>
                    )}
                />
            ))}
        </div>
    );
};

export default StatCards;
