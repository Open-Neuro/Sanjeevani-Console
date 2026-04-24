import { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, Clock, MoreVertical, Loader2 } from 'lucide-react';
import { fetchDashboardOverview, fetchExpiryRisk } from '../services/api';
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
                const [overview, expiry] = await Promise.all([
                    fetchDashboardOverview(),
                    fetchExpiryRisk(),
                ]);
                const expiringSoon = (expiry?.data || []).filter((item: any) => {
                    const days = item.days_until_expiry;
                    return typeof days === 'number' && days >= 0 && days <= 30;
                }).length;
                setStats({ ...(overview.data || {}), expiring_soon: expiringSoon });
            } catch (err) {
                console.error('Error loading dashboard stats:', err);
                setStats({ total_products: 0, low_stock_items: 0, expiry_risk_items: 0, expiring_soon: 0 });
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const statCards: StatCard[] = [
        {
            title: 'Total Products',
            value: stats?.total_products?.toLocaleString() || '0',
            icon: <Package size={20} className="text-gray-700" />,
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-700',
        },
        {
            title: 'Low Stock Items',
            value: stats?.low_stock_items ?? '0',
            icon: <AlertTriangle size={20} className="text-yellow-500" />,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-500',
        },
        {
            title: 'Out of Stock',
            value: stats?.expiry_risk_items ?? '0',
            icon: <XCircle size={20} className="text-red-500" />,
            bgColor: 'bg-red-50',
            textColor: 'text-red-500',
        },
        {
            title: 'Expiring Soon (30d)',
            value: stats?.expiring_soon ?? '0',
            icon: <Clock size={20} className="text-orange-500" />,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-500',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-300" size={24} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
