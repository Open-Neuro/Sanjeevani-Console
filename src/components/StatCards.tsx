import { useState, useEffect } from 'react';
import { Package, AlertTriangle, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import { fetchDashboardOverview } from '../services/api';

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

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4 px-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
                        <Loader2 className="animate-spin text-gray-300" size={24} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4 px-8">
            {/* Total Products */}
            <div className="bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 text-gray-700 rounded-full">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-medium">Total Products</p>
                        <h2 className="text-2xl font-bold text-gray-900">{stats?.total_products?.toLocaleString() || '0'}</h2>
                    </div>
                </div>
                <button className="text-gray-400 self-start hover:text-gray-600 transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-50 text-yellow-500 rounded-full">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-medium">Low Stock Items</p>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                            {stats?.low_stock_items ?? '0'}
                        </h2>
                    </div>
                </div>
                <button className="text-gray-400 self-start hover:text-gray-600 transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Out of Stock */}
            <div className="bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 text-red-500 rounded-full">
                        <XCircle size={20} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-0.5 font-medium">Out of Stock</p>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                            {stats?.expiry_risk_items ?? '0'}
                        </h2>
                    </div>
                </div>
                <button className="text-gray-400 self-start hover:text-gray-600 transition-colors">
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
};

export default StatCards;
