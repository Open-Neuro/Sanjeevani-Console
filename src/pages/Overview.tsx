import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
    Bell, Package, ShoppingCart, Users,
    ChevronRight, BrainCircuit, TrendingUp, Clock,
    CheckCircle, Loader2, AlertCircle, X, Search
} from 'lucide-react';
import { fetchDashboardOverview, fetchRefillAlerts, fetchInventoryAlerts, fetchRecentOrders, fetchTimeSeries, fetchProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';



/* ─── Component ─────────────────────────────────────── */
const Overview = () => {
    const { user } = useAuth();
    const [overview, setOverview] = useState<any>(null);
    const [refills, setRefills] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [timeSeries, setTimeSeries] = useState<any[]>([]);

    const [error, setError] = useState<string | null>(null);

    // Modal state for stat details
    const [modalLoading, setModalLoading] = useState(false);
    const [statModal, setStatModal] = useState<{ open: boolean, title: string, items: any[], type: string }>({
        open: false,
        title: '',
        items: [],
        type: ''
    });

    const openStatModal = async (type: string) => {
        let title = '';
        let items: any[] = [];
        setModalLoading(true);
        setStatModal(prev => ({ ...prev, open: true, title: 'Synchronizing...', items: [] }));

        try {
            switch (type) {
                case 'products':
                    title = 'Complete Inventory Intelligence';
                    const prodRes = await fetchProducts(1, 50);
                    items = prodRes.data || [];
                    break;
                case 'low_stock':
                    title = 'Urgent: Low Stock Detection';
                    const lowRes = await fetchInventoryAlerts();
                    items = lowRes.data || [];
                    break;
                case 'expiry':
                    title = 'Critical: Expiry Risk Analysis';
                    const expRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/products/expiry-risk`);
                    const expData = await expRes.json();
                    items = expData.data || [];
                    break;
                case 'alerts':
                    title = 'Active Intelligence Alerts';
                    const refillRes = await fetchRefillAlerts();
                    items = refillRes.data || [];
                    break;
            }
            setStatModal({ open: true, title, items, type });
        } catch (err) {
            console.error("Error opening stat modal:", err);
            setStatModal(prev => ({ ...prev, open: false }));
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch data in parallel
                const results = await Promise.allSettled([
                    fetchDashboardOverview(),
                    fetchRefillAlerts(),
                    fetchInventoryAlerts(),
                    fetchRecentOrders(5),
                    fetchTimeSeries('orders', '30d')
                ]);

                // Update states individually if successful
                if (results[0].status === 'fulfilled') {
                    const data = results[0].value.data;
                    setOverview(data);
                }
                if (results[1].status === 'fulfilled') {
                    const data = results[1].value.data || [];
                    setRefills(data);
                }
                if (results[2].status === 'fulfilled') {
                    const data = results[2].value.data || [];
                    setInventory(data);
                }
                if (results[3].status === 'fulfilled') {
                    const data = results[3].value.data || [];
                    setOrders(data);
                }
                if (results[4].status === 'fulfilled') {
                    const data = results[4].value.data || [];
                    setTimeSeries(data);
                }

                setError(null);
            } catch (err: any) {
                console.error("Error loading dashboard data:", err);
                if (!overview) setError("Failed to connect to backend.");
            } finally {
                // No loaders to clear
            }
        };

        loadData();
    }, []);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* ── Top Welcome Bar ── */}
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
                {/* Left: Welcome */}
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                            Welcome in, {user?.pharmacy_name || user?.name || 'Sanjeevani'}
                        </h1>
                        {error && (
                            <div className="flex items-center gap-1.5 mt-1 text-red-500 text-[10px] font-semibold">
                                <AlertCircle size={10} /> {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Total Orders */}
                <div className="text-center">
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{overview?.total_orders || '0'}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">Total Orders</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <TrendingUp size={10} className="text-green-500" />
                        <p className="text-[10px] text-green-500 font-bold">+15%</p>
                    </div>
                </div>

                {/* Right: Stat Pills */}
                <div className="flex items-center gap-2">
                    <TopStatPill icon={<Users size={13} className="text-teal-500" />} value={overview?.total_patients || '0'} label="Total Patients" change="+5%" color="teal" onClick={() => { }} />
                    <TopStatPill icon={<Bell size={13} className="text-red-500" />} value={overview?.active_alerts || '0'} label="Alerts" change="Active" color="red" onClick={() => openStatModal('alerts')} />
                    <TopStatPill icon={<Package size={13} className="text-amber-500" />} value={overview?.low_stock_items || '0'} label="Low Stock" change="Urgent" color="amber" onClick={() => openStatModal('low_stock')} />
                    <TopStatPill icon={<Clock size={13} className="text-purple-400" />} value={overview?.expiry_risk_items || '0'} label="Expiry Risk" change="Critical" color="teal" onClick={() => openStatModal('expiry')} />
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-3 p-3 overflow-hidden">

                {/* ── REFILL ALERTS (col 1-5, row 1) ── */}
                <div className="col-span-5 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50 shrink-0">
                        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Bell size={13} className="text-amber-500" />
                            Refill Alerts:
                            <span className="text-red-500 font-bold">High Risk</span>
                        </h2>
                        <button className="flex items-center text-[10px] font-medium text-gray-400 hover:text-gray-700 gap-0.5">
                            View All <ChevronRight size={11} />
                        </button>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-3 px-4 py-1.5 bg-gray-50/60 shrink-0">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Name</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Days Left ▼</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Alert</span>
                    </div>

                    {/* Rows */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {refills.length > 0 ? refills.map((row, i) => (
                            <div key={i} className="grid grid-cols-3 items-center px-4 py-2 hover:bg-gray-50/40 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                        {row.customer_name?.charAt(0) || 'P'}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[11px] font-semibold text-gray-800 leading-tight truncate">{row.customer_name}</p>
                                        <p className="text-[9px] text-gray-400 leading-tight truncate">{row.product_name}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700">
                                        {row.days_until_refill || 0} days
                                        <span className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        </span>
                                    </span>
                                    <span className={`ml-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${row.risk_level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{row.risk_level || 'Medium'}</span>
                                </div>
                                <div className="flex justify-end">
                                    <button className="bg-amber-400 hover:bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-colors flex items-center gap-1">
                                        <Bell size={9} /> Alert
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                <CheckCircle size={24} className="mb-2 text-green-400 opacity-50" />
                                <p className="text-[10px] font-medium">No pending refill alerts</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── INVENTORY ALERTS (col 6-9, row 1) ── */}
                <div className="col-span-4 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50 shrink-0">
                        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Package size={13} className="text-gray-500" />
                            Inventory Alerts
                        </h2>
                        <ChevronRight size={13} className="text-gray-400" />
                    </div>

                    {/* Toggle Tabs */}
                    <div className="flex gap-2 px-4 py-2 shrink-0">
                        <button className="bg-[#0a2e2a] text-white text-[10px] font-semibold px-3 py-1 rounded-full">Low Stock</button>
                        <button className="border border-gray-200 text-gray-500 text-[10px] font-semibold px-3 py-1 rounded-full hover:bg-gray-50">Expiring Soon</button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 px-2 custom-scrollbar">
                        {inventory.length > 0 ? inventory.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-2 py-2.5 hover:bg-gray-50/40 transition-colors">
                                <div className="flex-1 truncate pr-2">
                                    <p className="text-[11px] font-semibold text-gray-800 truncate">{item["Medicine Name"] || item.medicine_name || item.product_name}</p>
                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                        {item.urgency === 'critical' ? 'Critical' : `${Math.round(item.current_stock || 0)} Units Remaining`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${item.urgency === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {Math.round(item.current_stock || 0)} {item.urgency === 'critical' ? 'Critical' : 'Low'}
                                    </span>
                                    <ChevronRight size={12} className="text-gray-300" />
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                <CheckCircle size={24} className="mb-2 text-green-400 opacity-50" />
                                <p className="text-[10px] font-medium">Inventory levels healthy</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RECENT ORDERS (col 10-12, row 1) ── */}
                <div className="col-span-3 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50 shrink-0">
                        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <ShoppingCart size={13} className="text-gray-500" />
                            Recent Orders
                        </h2>
                        <ChevronRight size={13} className="text-gray-400" />
                    </div>

                    {/* Column headers */}
                    <div className="grid grid-cols-3 px-4 py-1.5 bg-gray-50/60 shrink-0">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Order</span>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Patient</span>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Status</span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {orders.length > 0 ? orders.map((order, i) => (
                            <div key={i} className="grid grid-cols-3 items-center px-4 py-2 hover:bg-gray-50/40 transition-colors">
                                <div className="truncate pr-1">
                                    <p className="text-[10px] font-bold text-gray-800 leading-tight">#{order.order_id?.slice(-4) || 'ORD'}</p>
                                    <p className="text-[8px] text-gray-400 leading-tight">Just now</p>
                                </div>
                                <div className="truncate pr-1">
                                    <p className="text-[10px] font-semibold text-gray-600 truncate">{order.customer_name || order.Patient_Name}</p>
                                </div>
                                <div className="flex justify-end">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                <ShoppingCart size={24} className="mb-2 opacity-30" />
                                <p className="text-[10px] font-medium">No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── DEMAND FORECAST CHART (col 1-8, row 2) ── */}
                <div className="col-span-8 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 shrink-0">
                        <div>
                            <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                <BrainCircuit size={13} className="text-purple-500" />
                                Sanjeevani AI Demand Forecasting
                            </h2>
                            <p className="text-[10px] text-gray-400 font-medium">Daily order trends based on real-time data</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                <span className="text-[10px] font-semibold text-gray-500">Orders</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 px-4 pb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries.length > 0 ? timeSeries : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                                    tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorTeal)" name="Orders" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── AI INSIGHTS FEED (col 9-12, row 2) ── */}
                <div className="col-span-4 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse"></div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
                        {(() => {
                            const liveInsights: any[] = [];

                            // 1. Map Orders as "New Signals"
                            orders.slice(0, 3).forEach((o) => liveInsights.push({
                                icon: ShoppingCart,
                                color: '#10b981',
                                text: `Neural Signal detected: Remote order`,
                                highlight: `#${o.order_id?.slice(-4) || 'RD'} for ${o.customer_name || o.Patient_Name}`,
                                ago: 'Active',
                                label: 'Order Agent 01'
                            }));

                            // 2. Map Refill & Safety Alerts
                            refills.forEach((r) => liveInsights.push({
                                icon: Bell,
                                color: (r.alert_type === 'interaction_warning' || r.risk_level === 'High') ? '#f43f5e' : '#f59e0b',
                                text: r.alert_type === 'interaction_warning' ? `⚠️ RX MISSING: ${r.customer_name || r.patient_name} order needs` : `Neural Refill Alert: ${r.customer_name || r.patient_name} requires`,
                                highlight: r.product_name || r.medicine_name,
                                ago: r.days_until_refill ? `${r.days_until_refill}D` : 'Urgent',
                                label: r.alert_type === 'interaction_warning' ? 'Safety Agent 02' : 'Refill Agent 03'
                            }));

                            // 3. Map Inventory Critical Signals
                            inventory.forEach((inv) => liveInsights.push({
                                icon: Package,
                                color: inv.urgency === 'critical' ? '#ef4444' : '#3b82f6',
                                text: `Stock Level Critical: Only ${Math.round(inv.current_stock || 0)} units of`,
                                highlight: inv.medicine_name || inv.product_name || inv["Medicine Name"],
                                ago: 'Real-time',
                                label: 'Inventory Agent 04'
                            }));

                            if (liveInsights.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
                                        <div className="p-4 bg-gray-100 rounded-full">
                                            <BrainCircuit size={40} className="text-gray-400" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Awaiting Agent Signals...</p>
                                    </div>
                                );
                            }

                            return liveInsights.slice(0, 10).map((insight: any, i: number) => (
                                <div key={i} className="flex flex-col space-y-1 animate-slide-up">
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: insight.color }}></div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{insight.label}</span>
                                    </div>
                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] group-hover:shadow-md transition-all">
                                        <p className="text-[11px] font-medium text-gray-700 leading-relaxed">
                                            {insight.text} <span className="font-bold border-b-2 border-gray-50 pb-0.5" style={{ color: insight.color }}>{insight.highlight}</span>
                                        </p>
                                        <div className="mt-2 flex items-center justify-end text-[9px] font-bold text-gray-400">
                                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                                <Clock size={8} /> {insight.ago}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl">
                            <div className="flex gap-1 px-1">
                                <span className="w-1 h-1 bg-[#bbed3b] rounded-full animate-pulse"></span>
                                <span className="w-1 h-1 bg-[#bbed3b] rounded-full animate-pulse [animation-delay:200ms]"></span>
                                <span className="w-1 h-1 bg-[#bbed3b] rounded-full animate-pulse [animation-delay:400ms]"></span>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">Live Intelligence Feed...</span>
                        </div>
                        <button
                            className="bg-[#0a2e2a] hover:bg-[#1a4a44] text-[#bbed3b] p-2.5 rounded-xl shadow-lg transition-all active:scale-95"
                            onClick={() => window.location.reload()}
                            title="Force Neural Refresh"
                        >
                            <BrainCircuit size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Detail Modal for Stats ── */}
            {statModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a2e2a]/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-white/20">
                        <div className="bg-[#0a2e2a] p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">{statModal.title}</h3>
                                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-1">Live Database Synchronization Active</p>
                            </div>
                            <button onClick={() => setStatModal({ ...statModal, open: false })} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-teal-600 gap-4">
                                    <Loader2 className="animate-spin" size={40} />
                                    <p className="font-black text-[10px] uppercase tracking-widest animate-pulse">Accessing Neural Database...</p>
                                </div>
                            ) : statModal.items.length > 0 ? statModal.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-500/30 transition-all hover:bg-white hover:shadow-lg group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-teal-600 shadow-sm group-hover:rotate-12 transition-transform">
                                            {item.alert_type === 'refill_due' ? <Bell size={18} /> :
                                                item.alert_type === 'interaction_warning' ? <AlertCircle size={18} className="text-red-500" /> :
                                                    statModal.type === 'expiry' ? <Clock size={18} /> : <Package size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">{item.customer_name || item.medicine_name || item["Medicine Name"]}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.product_name || item.Category || item.alert_type || 'Inventory Unit'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-teal-700">
                                            {item.days_until_refill ? `${item.days_until_refill}D Remaining` :
                                                item.days_until_expiry ? `${item.days_until_expiry}D Expiry` :
                                                    `${Math.round(item.current_stock || item["Current Stock"] || 0)} Units`}
                                        </p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${(item.risk_level === 'High' || item.urgency === 'critical' || item.alert_type === 'interaction_warning')
                                            ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {item.alert_type === 'interaction_warning' ? '⚠️ RX MISSING' : item.risk_level || item.urgency || 'Operational'}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                                    <div className="p-5 bg-gray-50 rounded-full">
                                        <Search size={40} className="opacity-20" />
                                    </div>
                                    <p className="font-bold text-sm">No specialized data signals detected for this filter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

/* ─── Sub-Components ─────────────────────────────────── */

const TopStatPill = ({ icon, value, label, change, color, onClick }: any) => {
    const colorClasses: any = {
        amber: 'bg-amber-50 border-amber-100',
        teal: 'bg-teal-50 border-teal-100',
        red: 'bg-red-50 border-red-100',
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses[color]} shrink-0 hover:shadow-md hover:scale-105 transition-all outline-none cursor-pointer`}
        >
            {icon}
            <div className="flex flex-col -space-y-0.5 text-left">
                <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-gray-900 leading-none">{value}</span>
                    <span className="text-[8px] font-bold text-green-600">{change}</span>
                </div>
                <span className="text-[8px] text-gray-500 font-semibold uppercase tracking-tight">{label}</span>
            </div>
        </button>
    );
};

export default Overview;
