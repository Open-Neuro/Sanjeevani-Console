import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import {
    Search,
    MessageCircle,
    CheckCircle,
    PackageOpen,
    Globe,
    Loader2,
    Send,
    Smartphone,
    X,
    Bell,
    User,
    ChevronRight,
    Truck,
    Eye,
    Receipt,
    ClipboardList,
    Activity
} from 'lucide-react';
import { fetchRecentOrders, confirmOrder, updateOrderStatus } from '../services/api';
import PatientDetailDrawer from '../components/PatientDetailDrawer';
import OrderDetailModal from '../components/OrderDetailModal';

interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [page] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    const prevOrdersCount = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    }, []);

    const showToast = (type: Toast['type'], message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const loadOrders = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const data = await fetchRecentOrders(50);
            const newOrders = data.data || [];
            
            // Notification logic
            if (!isInitial && newOrders.length > prevOrdersCount.current) {
                audioRef.current?.play().catch(e => console.log('Audio play failed', e));
                showToast('info', 'New order received via AI Bridge!');
            }
            
            setOrders(newOrders);
            setTotal(data.total || 0);
            prevOrdersCount.current = newOrders.length;
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (isInitial) {
                setOrders([]);
                setTotal(0);
                showToast('error', 'Failed to sync with pharmacy core.');
            }
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders(true);
        const interval = setInterval(() => loadOrders(false), 10000);
        return () => clearInterval(interval);
    }, [page, search]);

    const handleConfirm = async (orderId: string) => {
        try {
            setProcessingId(orderId);
            await confirmOrder(orderId);
            showToast('success', 'Order confirmed. Inventory reserved.');
            loadOrders(false);
        } catch (err: any) {
            showToast('error', err.message || 'Confirmation failed');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDispatch = async (orderId: string) => {
        try {
            setProcessingId(orderId);
            await updateOrderStatus(orderId, 'Dispatched');
            showToast('success', 'Order marked as dispatched.');
            loadOrders(false);
        } catch (err: any) {
            showToast('error', err.message || 'Dispatch failed');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [
            order.order_id,
            order.customer_name,
            order.product_name,
            order.order_channel,
            order.order_status,
        ].some((value) => String(value || '').toLowerCase().includes(q));
    });

    const getPlatformBadge = (platform: string) => {
        const p = (platform || 'web').toLowerCase();
        if (p.includes('whatsapp')) return <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100"><MessageCircle size={13} /> WhatsApp</span>;
        if (p.includes('telegram')) return <span className="inline-flex items-center gap-1.5 text-sky-500 font-bold text-xs bg-sky-50 px-2 py-1 rounded-lg border border-sky-100"><Send size={13} /> Telegram</span>;
        if (p.includes('sms')) return <span className="inline-flex items-center gap-1.5 text-purple-600 font-bold text-xs bg-purple-50 px-2 py-1 rounded-lg border border-purple-100"><Smartphone size={13} /> SMS</span>;
        if (p.includes('voice')) return <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg border border-amber-100"><Activity size={13} /> Voice AI</span>;
        return <span className="inline-flex items-center gap-1.5 text-gray-500 font-bold text-xs bg-gray-50 px-2 py-1 rounded-lg border border-gray-100"><Globe size={13} /> Web</span>;
    };

    const isLive = (o: any) => {
        const s = String(o.order_status || o.status || '').toLowerCase();
        return s === 'pending' || s === 'confirmed' || s === 'validated';
    };

    const pendingCount = orders.filter(o => isLive(o)).length;

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#fcfdfd]">
            <Header title="Orders Terminal (AI Orchestration Live)" />

            <div className="fixed top-5 right-5 z-[400] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`
                            flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold max-w-sm pointer-events-auto
                            transition-all duration-300 animate-slide-in
                            ${t.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : ''}
                            ${t.type === 'error' ? 'bg-rose-500 text-white border-rose-400' : ''}
                            ${t.type === 'info' ? 'bg-[#0a2e2a] text-[#bbed3b] border-white/10' : ''}
                        `}
                    >
                        {t.type === 'success' && <CheckCircle size={18} className="shrink-0" />}
                        {t.type === 'error' && <X size={18} className="shrink-0" />}
                        {t.type === 'info' && <Bell size={18} className="shrink-0" />}
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                    <div className="bg-white border border-gray-100 p-6 rounded-[32px] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Queue Intelligence</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-[#0a2e2a]">{pendingCount}</p>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                            </div>
                            <p className="text-[10px] font-semibold text-gray-400 mt-1">{loading ? 'Syncing...' : 'Real-time telemetry'}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-inner">
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <ClipboardList size={24} />}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-[32px] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Lifetime Volume</p>
                            <p className="text-3xl font-black text-[#0a2e2a]">{total}</p>
                            <p className="text-[10px] font-semibold text-gray-400 mt-1">Sanjeevani Global DB</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner"><Globe size={24} /></div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-[#bbed3b] to-sky-500"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Customer, Medicine..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl w-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#bbed3b] transition-all placeholder:text-gray-300 shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0a2e2a] text-white px-5 py-2.5 rounded-full shadow-lg">
                            <div className="w-2 h-2 bg-[#bbed3b] rounded-full animate-pulse shadow-[0_0_10px_#bbed3b]"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Orchestration Active</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Link</th>
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Profile</th>
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AI channel</th>
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Prescription</th>
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Value</th>
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Lifecycle</th>
                                    <th className="pb-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                                    <tr key={i} className="border-b border-gray-50/50 transition-all hover:bg-gray-50/80 group">
                                        <td className="py-6 px-4">
                                            <span className="font-mono text-gray-400 text-xs font-bold">#{order.order_id?.slice(-6).toUpperCase() || 'N/A'}</span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <button 
                                                onClick={() => setSelectedPatientId(order.patient_id || order.customer_name)}
                                                className="flex items-center gap-3 group/patient"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-[#0a2e2a] group-hover/patient:bg-[#bbed3b] group-hover/patient:text-[#0a2e2a] transition-all shadow-sm">
                                                    <User size={16} strokeWidth={2.5} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-black text-gray-800 tracking-tight group-hover/patient:text-[#0a2e2a] transition-colors">{order.customer_name || 'Unidentified'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {order.patient_id?.slice(-6) || 'WALK-IN'}</p>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="py-6 px-4">{getPlatformBadge(order.order_channel || order.channel || order.source)}</td>
                                        <td className="py-6 px-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-gray-800 font-bold text-sm leading-tight">{order.product_name || 'Multi-item Order'}</p>
                                                {order.quantity && <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{order.quantity} Units Secured</p>}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-gray-900 font-black text-right text-base">₹{Number(order.total_amount || 0).toLocaleString()}</td>
                                        <td className="py-6 px-4 text-center">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border shadow-sm uppercase tracking-widest
                                                ${order.order_status === 'Pending' ? 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-100/50' : 
                                                  order.order_status === 'Confirmed' ? 'text-blue-600 bg-blue-50 border-blue-100 shadow-blue-100/50' :
                                                  order.order_status === 'Dispatched' ? 'text-purple-600 bg-purple-50 border-purple-100 shadow-purple-100/50' :
                                                  'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100/50'}`}>
                                                {order.order_status || 'Syncing'}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setSelectedOrderId(order.order_id)}
                                                    className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-[#0a2e2a] hover:text-white transition-all shadow-sm active:scale-90"
                                                    title="Detailed Inspection"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                
                                                {order.order_status === 'Pending' && (
                                                    <button 
                                                        disabled={processingId === order.order_id}
                                                        onClick={() => handleConfirm(order.order_id)}
                                                        className="px-4 py-2 bg-[#0a2e2a] text-[#bbed3b] rounded-xl shadow-lg shadow-[#0a2e2a]/20 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        {processingId === order.order_id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Verify</span>
                                                    </button>
                                                )}
                                                
                                                {order.order_status === 'Confirmed' && (
                                                    <button 
                                                        disabled={processingId === order.order_id}
                                                        onClick={() => handleDispatch(order.order_id)}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        {processingId === order.order_id ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Ship</span>
                                                    </button>
                                                )}

                                                <button className="p-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-all active:scale-90" title="Print Invoice">
                                                    <Receipt size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 border-4 border-gray-100 border-t-[#0a2e2a] rounded-full animate-spin"></div>
                                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Synchronizing with AI Cluster</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <PackageOpen size={80} className="text-gray-400" />
                                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">No active order streams found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedPatientId && (
                <PatientDetailDrawer 
                    patientId={selectedPatientId} 
                    onClose={() => setSelectedPatientId(null)} 
                />
            )}

            {selectedOrderId && (
                <OrderDetailModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)}
                    onStatusUpdate={() => loadOrders(false)}
                />
            )}

            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Orders;
