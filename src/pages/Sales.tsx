import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { TrendingUp, DollarSign, Activity, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchDashboardOverview, fetchTimeSeries, fetchDashboardProducts } from '../services/api';

const Sales = () => {
    const [overview, setOverview] = useState<any>(null);
    const [timeSeries, setTimeSeries] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ovRes, tsRes, tpRes] = await Promise.all([
                fetchDashboardOverview(),
                fetchTimeSeries('revenue', '7d'),
                fetchDashboardProducts()
            ]);
            setOverview(ovRes.data);
            setTimeSeries(tsRes.data || []);
            setTopProducts(tpRes.data?.top_medicines_by_orders || []);
        } catch (err) {
            console.error('Error loading sales data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const chartData = timeSeries.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        actual: d.value,
        predicted: d.value * 1.1 // Mocking AI prediction as 10% more for now
    }));

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-screen">
                <Loader2 className="animate-spin text-[#0a2e2a]" size={40} />
                <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-400">Syncing BI Core...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
            <Header title="Sales & BI (Business Intelligence)" />

            <div className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <StatCard 
                        icon={<DollarSign size={20} className="text-green-600" />} 
                        title="Total Revenue" 
                        value={`₹${overview?.total_revenue?.toLocaleString() || '0'}`} 
                        subtext="All time processed" 
                        bg="bg-green-50" 
                    />
                    <StatCard 
                        icon={<Activity size={20} className="text-blue-600" />} 
                        title="Monthly Revenue" 
                        value={`₹${overview?.monthly_revenue?.toLocaleString() || '0'}`} 
                        subtext="Current month" 
                        bg="bg-blue-50" 
                    />
                    <StatCard 
                        icon={<TrendingUp size={20} className="text-purple-600" />} 
                        title="Active Alerts" 
                        value={String(overview?.active_alerts || 0)} 
                        subtext="Requiring attention" 
                        bg="bg-purple-50" 
                    />
                    <StatCard 
                        icon={<DollarSign size={20} className="text-[#0a2e2a]" />} 
                        title="Low Stock" 
                        value={String(overview?.low_stock_items || 0)} 
                        subtext="Items to reorder" 
                        bg="bg-[#bbed3b]/30" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" /> Revenue Trend (Last 7 Days)
                        </h3>
                        <div className="flex-1 w-full min-h-0 relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px', textTransform: 'uppercase' }} />
                                    <Bar dataKey="actual" name="Actual Revenue" fill="#0a2e2a" radius={[6, 6, 0, 0]} barSize={24} />
                                    <Bar dataKey="predicted" name="AI Target" fill="#bbed3b" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-gray-800 mb-6 uppercase tracking-widest text-[10px]">Top Selling Medicines</h3>
                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-4">
                            {topProducts.length > 0 ? topProducts.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-50 hover:border-[#bbed3b] transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-[#0a2e2a] text-[10px] shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0a2e2a] text-xs">{item.medicine}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.orders} Orders</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-gray-800">₹{item.revenue.toLocaleString()}</p>
                                        <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">TOP</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest">No sales data yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtext, bg = "bg-white" }: { icon: React.ReactNode, title: string, value: string, subtext: string, bg?: string }) => (
    <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow`}>
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${bg}`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        </div>
        <div>
            <p className="text-3xl font-black text-[#0a2e2a] leading-none mb-2">{value}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{subtext}</p>
        </div>
    </div>
);

export default Sales;
