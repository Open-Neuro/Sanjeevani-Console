import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
    Bell, Package, ShoppingCart, Users,
    ChevronRight, BrainCircuit, TrendingUp, Clock,
    Loader2, AlertCircle, X, Search, Database
} from 'lucide-react';
import {
    fetchDashboardOverview,
    fetchRefillAlerts,
    fetchInventoryAlerts,
    fetchRecentOrders,
    fetchTimeSeries,
    fetchProducts,
    testAgents,
    fetchOperationalStatus,
    fetchExpiryRisk,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const Overview = () => {
    const { user } = useAuth();
    const [overview, setOverview] = useState<any>(null);
    const [refills, setRefills] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [timeSeries, setTimeSeries] = useState<any[]>([]);
    const [opsStatus, setOpsStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
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
                    items = (await fetchProducts(1, 50)).data || [];
                    break;
                case 'low_stock':
                    title = 'Urgent: Low Stock Detection';
                    items = (await fetchInventoryAlerts()).data || [];
                    break;
                case 'expiry':
                    title = 'Critical: Expiry Risk Analysis';
                    items = (await fetchExpiryRisk()).data || [];
                    break;
                case 'alerts':
                    title = 'Active Intelligence Alerts';
                    items = (await fetchRefillAlerts()).data || [];
                    break;
                case 'agent_runs':
                    title = 'Recorded 5-Agent Executions';
                    items = opsStatus?.latest_agent_runs || [];
                    break;
                default:
                    items = [];
            }
            setStatModal({ open: true, title, items, type });
        } catch (err) {
            console.error('Error opening stat modal:', err);
            setStatModal(prev => ({ ...prev, open: false }));
        } finally {
            setModalLoading(false);
        }
    };

    const loadData = async () => {
        setLoading(true);
        const results = await Promise.allSettled([
            fetchDashboardOverview(),
            fetchRefillAlerts(),
            fetchInventoryAlerts(),
            fetchRecentOrders(5),
            fetchTimeSeries('orders', '30d'),
            fetchOperationalStatus(),
        ]);

        if (results[0].status === 'fulfilled') setOverview(results[0].value.data);
        if (results[1].status === 'fulfilled') setRefills(results[1].value.data || []);
        if (results[2].status === 'fulfilled') void results[2].value.data;
        if (results[3].status === 'fulfilled') setOrders(results[3].value.data || []);
        if (results[4].status === 'fulfilled') setTimeSeries(results[4].value.data || []);
        if (results[5].status === 'fulfilled') setOpsStatus(results[5].value.data || null);

        const hasFailure = results.some((result) => result.status === 'rejected');
        setError(hasFailure ? 'Some dashboard panels could not sync with the live backend.' : null);
        setLoading(false);
    };

    useEffect(() => {
        loadData().catch((err) => {
            console.error('Error loading dashboard data:', err);
            setError('Failed to connect to the live backend.');
            setLoading(false);
        });

        const pollInterval = setInterval(() => {
            loadData().catch((err) => {
                console.error('Error polling dashboard data:', err);
            });
        }, 10000);

        return () => clearInterval(pollInterval);
    }, []);

    const hasRealData = Boolean(
        opsStatus?.data_presence?.has_orders ||
        opsStatus?.data_presence?.has_patients ||
        opsStatus?.data_presence?.has_products ||
        opsStatus?.data_presence?.has_inventory
    );

    const collectionSummary = (opsStatus?.collections || [])
        .filter((item: any) => item.is_populated)
        .slice(0, 3);

    const liveInsights = [
        ...((opsStatus?.latest_agent_runs || []).flatMap((run: any) =>
            (run.events || []).map((event: any) => ({
                color: event.status === 'failed' ? '#ef4444' : '#10b981',
                text: `${event.agent_name || 'Agent'}:`,
                highlight: event.message || run.order_id,
                ago: run.status || 'active',
                label: run.order_id || 'Agent Run',
            }))
        )),
        ...orders.slice(0, 2).map((o) => ({
            color: '#10b981',
            text: 'Order received:',
            highlight: `#${o.order_id?.slice(-4) || 'ORD'} for ${o.customer_name || o.Patient_Name}`,
            ago: o.order_status || o.status || 'pending',
            label: 'Orders Engine',
        })),
        ...refills.slice(0, 2).map((r) => ({
            color: (r.alert_type === 'interaction_warning' || r.risk_level === 'High') ? '#f43f5e' : '#f59e0b',
            text: r.alert_type === 'interaction_warning' ? 'Safety review:' : 'Refill due:',
            highlight: `${r.customer_name || r.patient_name} - ${r.product_name || r.medicine_name}`,
            ago: r.days_until_refill ? `${r.days_until_refill}d` : 'urgent',
            label: 'Care Agents',
        })),
    ].slice(0, 10);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">
                            Welcome in, {user?.pharmacy_name || user?.name || 'Sanjeevani'}
                        </h1>
                        {error && (
                            <div className="flex items-center gap-1.5 mt-1 text-red-500 text-[10px] font-semibold">
                                <AlertCircle size={10} /> {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">{overview?.total_orders || 0}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">Total Orders</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <TrendingUp size={10} className={hasRealData ? 'text-green-500' : 'text-amber-500'} />
                        <p className={`text-[10px] font-bold ${hasRealData ? 'text-green-500' : 'text-amber-500'}`}>
                            {hasRealData ? 'Live tenant data' : 'No tenant activity yet'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <TopStatPill icon={<Users size={13} className="text-teal-500" />} value={overview?.total_patients || 0} label="Patients" change={hasRealData ? 'Live' : 'Setup'} color="teal" onClick={() => { }} />
                    <TopStatPill icon={<Bell size={13} className="text-red-500" />} value={overview?.active_alerts || 0} label="Alerts" change="Active" color="red" onClick={() => openStatModal('alerts')} />
                    <TopStatPill icon={<Package size={13} className="text-amber-500" />} value={overview?.low_stock_items || 0} label="Low Stock" change="Urgent" color="amber" onClick={() => openStatModal('low_stock')} />
                    <TopStatPill icon={<BrainCircuit size={13} className="text-purple-500" />} value={opsStatus?.agent_run_count || 0} label="Agent Runs" change={opsStatus?.latest_agent_run_status || 'idle'} color="teal" onClick={() => openStatModal('agent_runs')} />
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-3 p-3 overflow-hidden">
                <div className="col-span-5 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50 shrink-0">
                        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Bell size={13} className="text-amber-500" />
                            Refill Alerts
                        </h2>
                        <button className="flex items-center text-[10px] font-medium text-gray-400 hover:text-gray-700 gap-0.5">
                            View All <ChevronRight size={11} />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 px-4 py-1.5 bg-gray-50/60 shrink-0">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Name</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center">Days Left</span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-right">Alert</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {refills.length > 0 ? refills.map((row, i) => (
                            <div key={i} className="grid grid-cols-3 items-center px-4 py-2 hover:bg-gray-50/40 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                        {(row.customer_name || row.patient_name || 'P').charAt(0)}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[11px] font-semibold text-gray-800 leading-tight truncate">{row.customer_name || row.patient_name || 'Unknown patient'}</p>
                                        <p className="text-[9px] text-gray-400 leading-tight truncate">{row.product_name || row.medicine_name}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700">
                                        {row.days_until_refill || 0} days
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${row.risk_level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {row.risk_level || 'Medium'}
                                    </span>
                                </div>
                            </div>
                        )) : loading ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-[10px] italic">Loading refill alerts...</div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-[10px] italic">No active refill alerts</div>
                        )}
                    </div>
                </div>

                <div className="col-span-4 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50 shrink-0">
                        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Database size={13} className="text-gray-500" />
                            Engine Readiness
                        </h2>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${hasRealData ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {hasRealData ? 'Live' : 'New Tenant'}
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/60">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Latest Agent Run</p>
                            <p className="text-sm font-bold text-gray-800 mt-1">{opsStatus?.latest_agent_run_status || 'never_run'}</p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {opsStatus?.latest_agent_run_at ? new Date(opsStatus.latest_agent_run_at).toLocaleString() : 'No backend execution has been recorded yet.'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            {collectionSummary.length > 0 ? collectionSummary.map((item: any) => (
                                <div key={item.collection} className="flex items-center justify-between text-[11px] bg-white border border-gray-100 rounded-xl px-3 py-2">
                                    <span className="font-semibold text-gray-700 capitalize">{item.name}</span>
                                    <span className="font-bold text-gray-900">{item.count}</span>
                                </div>
                            )) : loading ? (
                                <div className="flex items-center justify-center h-32 text-gray-400 text-[10px] italic">
                                    Loading tenant collections...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32 text-gray-400 text-[10px] italic">
                                    No tenant records synced yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-3 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50 shrink-0">
                        <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <ShoppingCart size={13} className="text-gray-500" />
                            Recent Orders
                        </h2>
                        <ChevronRight size={13} className="text-gray-400" />
                    </div>
                    <div className="grid grid-cols-3 px-4 py-1.5 bg-gray-50/60 shrink-0">
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Order</span>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Patient</span>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-right">Status</span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {orders.length > 0 ? orders.map((order, i) => (
                            <div key={i} className="grid grid-cols-3 items-center px-4 py-2 hover:bg-gray-50/40 transition-colors">
                                <div className="truncate pr-1">
                                    <p className="text-[10px] font-bold text-gray-800 leading-tight">#{order.order_id?.slice(-4) || '----'}</p>
                                </div>
                                <div className="truncate pr-1">
                                    <p className="text-[10px] font-semibold text-gray-600 truncate">{order.customer_name || order.Patient_Name || 'Unknown patient'}</p>
                                </div>
                                <div className="flex justify-end">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${(order.order_status || order.status) === 'Completed' || (order.order_status || order.status) === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {order.order_status || order.status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        )) : loading ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-[10px] italic">Loading live orders...</div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-[10px] italic">No recent transactions</div>
                        )}
                    </div>
                </div>

                <div className="col-span-8 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 shrink-0">
                        <div>
                            <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                <BrainCircuit size={13} className="text-purple-500" />
                                Order Trend
                            </h2>
                            <p className="text-[10px] text-gray-400 font-medium">Orders synced from live backend data</p>
                        </div>
                    </div>
                    <div className="flex-1 px-4 pb-4">
                        {timeSeries.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(str) => str?.split('-').slice(1).join('/') || ''} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorTeal)" name="Orders" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-[10px] italic">
                                {loading ? 'Loading order trend...' : 'No order trend available yet'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-span-4 row-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse"></div>
                    <div className="px-4 pt-4 pb-2 border-b border-gray-100 bg-gray-50/60">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Agent Activity</p>
                                <p className="text-xs font-bold text-gray-800 mt-1">
                                    {opsStatus?.latest_agent_run_status === 'completed' ? 'Recorded execution available' : 'No persisted execution yet'}
                                </p>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${hasRealData ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {hasRealData ? 'Real data' : 'Need data'}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {liveInsights.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
                                <div className="p-4 bg-gray-100 rounded-full">
                                    <BrainCircuit size={40} className="text-gray-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">No agent runs recorded yet</p>
                            </div>
                        ) : liveInsights.map((insight, i) => (
                            <div key={i} className="flex flex-col space-y-1 animate-slide-up">
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: insight.color }}></div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{insight.label}</span>
                                </div>
                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: insight.color }}>
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
                        ))}
                    </div>
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50/80 p-2 rounded-xl">
                            <div className="flex gap-1 px-1">
                                <span className="w-1 h-1 bg-[#bbed3b] rounded-full animate-pulse"></span>
                                <span className="w-1 h-1 bg-[#bbed3b] rounded-full animate-pulse [animation-delay:200ms]"></span>
                                <span className="w-1 h-1 bg-[#bbed3b] rounded-full animate-pulse [animation-delay:400ms]"></span>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter italic">Persisted backend telemetry</span>
                        </div>
                        <button
                            className="bg-[#0a2e2a] hover:bg-[#1a4a44] text-[#bbed3b] px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 text-[10px] font-bold flex items-center gap-2"
                            onClick={async () => {
                                try {
                                    const result = await testAgents();
                                    if (result.status === 'ok') {
                                        alert(`Recorded ${result.agents?.length || 5} agents for ${result.context.patient}. Refreshing dashboard telemetry now.`);
                                        await loadData();
                                    }
                                } catch (err: any) {
                                    alert(`Agent test failed: ${err.message || err}`);
                                }
                            }}
                        >
                            <BrainCircuit size={16} /> TEST AGENTS
                        </button>
                    </div>
                </div>
            </div>

            {statModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a2e2a]/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] border border-white/20">
                        <div className="bg-[#0a2e2a] p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">{statModal.title}</h3>
                                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-1">Live backend synchronization</p>
                            </div>
                            <button onClick={() => setStatModal({ ...statModal, open: false })} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-teal-600 gap-4">
                                    <Loader2 className="animate-spin" size={40} />
                                    <p className="font-black text-[10px] uppercase tracking-widest animate-pulse">Loading records...</p>
                                </div>
                            ) : statModal.items.length > 0 ? statModal.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-500/30 transition-all hover:bg-white hover:shadow-lg group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-teal-600 shadow-sm">
                                            {statModal.type === 'alerts' ? <Bell size={18} /> :
                                                statModal.type === 'expiry' ? <Clock size={18} /> :
                                                    statModal.type === 'agent_runs' ? <BrainCircuit size={18} /> :
                                                        <Package size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">
                                                {item.customer_name || item.patient_name || item.medicine_name || item.product_name || item.order_id || 'Record'}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {item.product_name || item.alert_type || item.status || item.latest_record_at || 'Operational record'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-teal-700">
                                            {item.days_until_refill ? `${item.days_until_refill}D Remaining` :
                                                item.days_until_expiry ? `${item.days_until_expiry}D Expiry` :
                                                    item.current_stock !== undefined ? `${Math.round(item.current_stock || 0)} Units` :
                                                        item.updated_at ? new Date(item.updated_at).toLocaleDateString() :
                                                            item.count || item.status || '-'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                                    <div className="p-5 bg-gray-50 rounded-full">
                                        <Search size={40} className="opacity-20" />
                                    </div>
                                    <p className="font-bold text-sm">No records found for this view.</p>
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
