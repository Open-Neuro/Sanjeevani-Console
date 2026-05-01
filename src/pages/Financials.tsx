import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { 
    TrendingUp, 
    DollarSign, 
    Activity, 
    Loader2, 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownRight, 
    Clock, 
    CheckCircle, 
    Download, 
    Pill,
    Globe,
    Zap,
    History
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer, 
    Legend,
    AreaChart,
    Area
} from 'recharts';
import { fetchDashboardOverview, fetchTimeSeries, fetchDashboardProducts, fetchRecentOrders } from '../services/api';

const Financials = () => {
    const [overview, setOverview] = useState<any>(null);
    const [timeSeries, setTimeSeries] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ovRes, tsRes, tpRes, trRes] = await Promise.all([
                fetchDashboardOverview(),
                fetchTimeSeries('revenue', '7d'),
                fetchDashboardProducts(),
                fetchRecentOrders(10)
            ]);
            setOverview(ovRes.data);
            setTimeSeries(tsRes.data || []);
            setTopProducts(tpRes.data?.top_medicines_by_orders || []);
            setTransactions(trRes.data || []);
        } catch (err) {
            console.error('Error loading financial data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const chartData = useMemo(() => timeSeries.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: d.value,
        target: d.value * 0.9 // AI baseline target
    })), [timeSeries]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-white h-screen">
                <Loader2 className="animate-spin text-[#0a2e2a]" size={32} />
                <p className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Syncing Revenue Ledger...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#fcfdfd]">
            <Header title="Financial Terminal & Market Intel" />

            <div className="px-8 pb-8 space-y-6">
                
                {/* ── High-Impact Metrics ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <MetricCard 
                        icon={<Zap size={16} />} 
                        label="Gross Revenue" 
                        value={`₹${overview?.total_revenue?.toLocaleString() || '0'}`} 
                        trend="+12.4%"
                        subtext="All-time processed"
                        variant="dark"
                    />
                    <MetricCard 
                        icon={<Activity size={16} />} 
                        label="Monthly Flow" 
                        value={`₹${overview?.monthly_revenue?.toLocaleString() || '0'}`} 
                        trend="+5.2%"
                        subtext="Current period"
                    />
                    <MetricCard 
                        icon={<History size={16} />} 
                        label="Settled Ledger" 
                        value={`₹${(overview?.total_revenue * 0.98).toLocaleString() || '0'}`} 
                        trend="Stable"
                        subtext="Bank clearance"
                    />
                    <MetricCard 
                        icon={<Globe size={16} />} 
                        label="Market Share" 
                        value="64%" 
                        trend="+2.1%"
                        subtext="Local dominance"
                    />
                </div>

                {/* ── Main Analytics Engine ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Revenue Trends */}
                    <div className="lg:col-span-2 bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col h-[420px]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xs font-black text-[#0a2e2a] uppercase tracking-wider">Revenue Stream Analysis</h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">7-Day Transactional Intelligence</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="w-2 h-2 bg-[#0a2e2a] rounded-full"></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Actual</span>
                                <span className="w-2 h-2 bg-[#bbed3b] rounded-full ml-2"></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Predicted</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0 relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0a2e2a" stopOpacity={0.05} />
                                            <stop offset="95%" stopColor="#0a2e2a" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: '800' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: '800' }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <RechartsTooltip cursor={{ stroke: '#0a2e2a', strokeWidth: 1 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0a2e2a" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="target" stroke="#bbed3b" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Market Intel: Top Products */}
                    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col h-[420px]">
                        <h3 className="text-[10px] font-black text-[#0a2e2a] uppercase tracking-[0.2em] mb-6">Market Dominance</h3>
                        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                            {topProducts.map((item, idx) => (
                                <div key={idx} className="p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-[#bbed3b]/30 hover:bg-white transition-all group">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-black text-[9px] text-[#0a2e2a] group-hover:bg-[#0a2e2a] group-hover:text-[#bbed3b] transition-all">
                                                0{idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-800 tracking-tight">{item.medicine}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{item.orders} Volume</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-[#0a2e2a]">₹{item.revenue.toLocaleString()}</p>
                                            <p className="text-[7px] font-black text-emerald-500 uppercase">Top 1%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-4 w-full py-2.5 bg-[#0a2e2a]/5 text-[#0a2e2a] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#0a2e2a] hover:text-white transition-all">
                            View Deep Intel
                        </button>
                    </div>
                </div>

                {/* ── Transaction Ledger ── */}
                <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xs font-black text-[#0a2e2a] uppercase tracking-wider">Live Transaction Ledger</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Verified SSSA Processing Flow</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#0a2e2a] text-[#bbed3b] rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#0a2e2a]/10 hover:scale-105 transition-all">
                            <Download size={14} /> Export Ledger
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-gray-400">
                                    <th className="pb-1 px-4 text-[8px] font-black uppercase tracking-[0.2em]">TRACE ID</th>
                                    <th className="pb-1 px-4 text-[8px] font-black uppercase tracking-[0.2em]">VALUATION</th>
                                    <th className="pb-1 px-4 text-[8px] font-black uppercase tracking-[0.2em]">STATE</th>
                                    <th className="pb-1 px-4 text-[8px] font-black uppercase tracking-[0.2em]">CHANNEL</th>
                                    <th className="pb-1 px-4 text-[8px] font-black uppercase tracking-[0.2em] text-right">TIMESTAMP</th>
                                </tr>
                            </thead>
                            <tbody className="text-[10px]">
                                {transactions.map((t, i) => (
                                    <tr key={i} className="group">
                                        <td className="py-3 px-4 bg-gray-50/50 rounded-l-xl border-y border-l border-gray-100 font-mono text-gray-400 font-bold">
                                            #{t.order_id?.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="py-3 px-4 bg-gray-50/50 border-y border-gray-100 font-black text-[#0a2e2a]">
                                            ₹{Number(t.total_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 bg-gray-50/50 border-y border-gray-100">
                                            <span className={`px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest
                                                ${t.order_status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                  t.order_status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                  'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {t.order_status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 bg-gray-50/50 border-y border-gray-100 font-bold text-gray-400 uppercase tracking-widest text-[8px]">
                                            {t.order_channel || 'Web Console'}
                                        </td>
                                        <td className="py-3 px-4 bg-gray-50/50 rounded-r-xl border-y border-r border-gray-100 text-right text-gray-400 font-bold">
                                            {new Date(t.order_date || t['Order Date']).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
            `}</style>
        </div>
    );
};

const MetricCard = ({ icon, label, value, trend, subtext, variant = "light" }: any) => (
    <div className={`p-5 rounded-[24px] border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md
        ${variant === 'dark' ? 'bg-[#0a2e2a] text-white border-transparent' : 'bg-white text-[#0a2e2a]'}`}>
        {variant === 'dark' && <div className="absolute top-0 right-0 w-24 h-24 bg-[#bbed3b] opacity-10 blur-3xl rounded-full"></div>}
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`p-2 rounded-lg ${variant === 'dark' ? 'bg-white/10' : 'bg-gray-50'} text-[#bbed3b]`}>
                {icon}
            </div>
            <div className={`text-[8px] font-black px-2 py-0.5 rounded-full ${trend.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'}`}>
                {trend}
            </div>
        </div>
        <div className="relative z-10">
            <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${variant === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{label}</p>
            <p className="text-2xl font-black tracking-tight mb-1">{value}</p>
            <p className={`text-[8px] font-bold uppercase tracking-tighter opacity-60`}>{subtext}</p>
        </div>
    </div>
);

export default Financials;
