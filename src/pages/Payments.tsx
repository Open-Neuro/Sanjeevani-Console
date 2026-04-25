import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { CreditCard, Download, Search, CheckCircle, Clock, Activity, ArrowUpRight, ArrowDownRight, Wallet, Loader2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import { fetchDashboardOverview, fetchRecentOrders, fetchTimeSeries } from '../services/api';

const Payments = () => {
    const [overview, setOverview] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [timeSeries, setTimeSeries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ovRes, trRes, tsRes] = await Promise.all([
                fetchDashboardOverview(),
                fetchRecentOrders(20),
                fetchTimeSeries('revenue', '7d')
            ]);
            setOverview(ovRes.data);
            setTransactions(trRes.data || []);
            setTimeSeries(tsRes.data || []);
        } catch (err) {
            console.error('Error loading payment data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const chartData = timeSeries.map(d => ({
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: d.value
    }));

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-screen">
                <Loader2 className="animate-spin text-[#0a2e2a]" size={40} />
                <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-400">Loading Financial Ledger...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
            <Header title="Payments & AI Financial Intelligence" />

            <div className="px-8 pb-8 space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0a2e2a] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#bbed3b] opacity-10 blur-3xl rounded-full"></div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Total Revenue</p>
                        <p className="text-3xl font-black text-white relative z-10 mb-2">₹{overview?.total_revenue?.toLocaleString() || '0'}</p>
                        <div className="flex items-center gap-2 text-[#bbed3b] text-sm font-bold relative z-10"><ArrowUpRight size={16} /> Live</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Monthly Target</p>
                            <p className="text-2xl font-black text-[#0a2e2a]">₹{overview?.monthly_revenue?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-teal-600 text-[10px] font-black uppercase bg-teal-50 px-3 py-1.5 rounded-lg w-fit mt-3"><Clock size={14} /> Current Month</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Active Alerts</p>
                            <p className="text-2xl font-black text-rose-500">{overview?.active_alerts || 0}</p>
                        </div>
                        <div className="flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase bg-rose-50 px-3 py-1.5 rounded-lg w-fit mt-3"><CheckCircle size={14} /> Requiring Action</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Low Stock Risks</p>
                            <p className="text-2xl font-black text-amber-500">{overview?.low_stock_items || 0}</p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase bg-amber-50 px-3 py-1.5 rounded-lg w-fit mt-3"><ArrowDownRight size={14} /> Needs Restock</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-[#0a2e2a] text-lg flex items-center gap-2">
                                <CreditCard size={20} className="text-[#bbed3b]" /> Transaction Ledger
                            </h3>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#0a2e2a] rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors uppercase tracking-widest"><Download size={14} /> Export</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
                                        <th className="pb-4 px-4 font-black">Transaction ID</th>
                                        <th className="pb-4 px-4 font-black">Amount</th>
                                        <th className="pb-4 px-4 font-black">Status</th>
                                        <th className="pb-4 px-4 font-black">Channel</th>
                                        <th className="pb-4 px-4 font-black">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {transactions.length > 0 ? transactions.map((t, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                                            <td className="py-4 px-4 font-mono text-gray-400 text-xs">
                                                #{t.order_id?.slice(-8) || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4 font-black text-[#0a2e2a]">₹{Number(t.total_amount || 0).toFixed(2)}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm uppercase tracking-tighter
                                                        ${t.order_status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                          t.order_status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                          'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {t.order_status || 'Success'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">
                                                {t.order_channel || 'Web'}
                                            </td>
                                            <td className="py-4 px-4 text-xs font-medium text-gray-400">
                                                {new Date(t.order_date || t['Order Date']).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No recent transactions</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[450px]">
                        <h3 className="font-bold text-gray-800 text-lg mb-8 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" /> Revenue Forecast
                        </h3>
                        <div className="flex-1 w-full relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#bbed3b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#bbed3b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0a2e2a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-widest">Weekly Growth</span>
                                <span className="text-emerald-600 font-black">↑ 12.5%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
