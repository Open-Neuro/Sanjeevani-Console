import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../components/Header';
import {
    Search,
    MessageCircle,
    CheckCircle,
    PackageOpen,
    Globe,
    Loader2,
    Send,
    X,
    Bell,
    User,
    Eye,
    ClipboardList,
    Activity,
    ScanLine,
    RefreshCw
} from 'lucide-react';
import { fetchRecentOrders } from '../services/api';
import PatientDetailDrawer from '../components/PatientDetailDrawer';
import OrderDetailDrawer from '../components/OrderDetailDrawer';

interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    
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
    }, []);

    const sortedOrders = useMemo(() => {
        const orderPriority: Record<string, number> = {
            'Pending': 0,
            'Validated': 1,
            'Confirmed': 2,
            'Dispatched': 3,
            'Delivered': 4,
            'Completed': 5,
            'Rejected': 6
        };

        const filtered = orders.filter((order) => {
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

        return [...filtered].sort((a, b) => {
            const pA = orderPriority[a.order_status] ?? 99;
            const pB = orderPriority[b.order_status] ?? 99;
            if (pA !== pB) return pA - pB;
            return new Date(b['Order Date']).getTime() - new Date(a['Order Date']).getTime();
        });
    }, [orders, search]);

    const getPlatformBadge = (platform: string) => {
        const p = (platform || 'web').toLowerCase();
        if (p.includes('whatsapp')) return <span className="inline-flex items-center gap-1.5 text-[#25D366] font-bold text-[9px] bg-[#25D366]/5 px-2 py-0.5 rounded-md border border-[#25D366]/10 uppercase tracking-tight"><MessageCircle size={10} /> WhatsApp</span>;
        if (p.includes('telegram')) return <span className="inline-flex items-center gap-1.5 text-[#0088cc] font-bold text-[9px] bg-[#0088cc]/5 px-2 py-0.5 rounded-md border border-[#0088cc]/10 uppercase tracking-tight"><Send size={10} /> Telegram</span>;
        if (p.includes('voice')) return <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-[9px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-tight"><Activity size={10} /> Voice AI</span>;
        return <span className="inline-flex items-center gap-1.5 text-gray-400 font-bold text-[9px] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 uppercase tracking-tight"><Globe size={10} /> Web</span>;
    };

    const isLive = (o: any) => {
        const s = String(o.order_status || o.status || '').toLowerCase();
        return s === 'pending' || s === 'confirmed' || s === 'validated';
    };

    const pendingCount = orders.filter(o => isLive(o)).length;

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#fcfdfd]">
            <Header title="Orders Terminal (AI Orchestration Live)" />

            <div className="fixed top-5 right-5 z-[600] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`
                            flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-[11px] font-black max-w-sm pointer-events-auto
                            transition-all duration-300 animate-slide-in uppercase tracking-tight
                            ${t.type === 'success' ? 'bg-[#bbed3b] text-[#0a2e2a] border-[#0a2e2a]/10' : ''}
                            ${t.type === 'error' ? 'bg-rose-500 text-white border-rose-400' : ''}
                            ${t.type === 'info' ? 'bg-[#0a2e2a] text-[#bbed3b] border-white/10' : ''}
                        `}
                    >
                        {t.type === 'success' && <CheckCircle size={14} className="shrink-0" />}
                        {t.type === 'error' && <X size={14} className="shrink-0" />}
                        {t.type === 'info' && <Bell size={14} className="shrink-0" />}
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="px-8 pb-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-end mt-6 gap-4">
                    <div className="flex gap-4">
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col justify-center min-w-[160px] shadow-sm">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Live Queue</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-[#0a2e2a]">{pendingCount}</p>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col justify-center min-w-[160px] shadow-sm">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Global Load</p>
                            <p className="text-2xl font-black text-[#0a2e2a]">{total}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-400">
                        <RefreshCw size={12} className={loading ? 'animate-spin text-emerald-500' : ''} />
                        {loading ? 'SYNCING AGENTS...' : 'ALL CHANNELS ACTIVE'}
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="relative flex-1 md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Filter stream..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl w-full text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a2e2a]/10 transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                            <ScanLine size={12} className="opacity-50" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Orchestration Stream</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-gray-400">
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em]">HASH</th>
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em]">PATIENT</th>
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em]">CHANNEL</th>
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em]">MEDICATION</th>
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-right">VALUE</th>
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">STATUS</th>
                                    <th className="pb-1 px-4 text-[9px] font-black uppercase tracking-[0.2em] text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {sortedOrders.length > 0 ? sortedOrders.map((order, i) => (
                                    <tr key={i} className={`group transition-all duration-300 ${order.order_status === 'Completed' ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                                        <td className="py-4 px-4 bg-gray-50/50 rounded-l-2xl border-y border-l border-gray-100">
                                            <span className="font-mono text-gray-400 text-[10px] font-bold tracking-tight">#{order.order_id?.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="py-4 px-4 bg-gray-50/50 border-y border-gray-100">
                                            <button 
                                                onClick={() => setSelectedPatientId(order.patient_id || order.customer_name)}
                                                className="flex items-center gap-2 group/patient"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#0a2e2a] group-hover/patient:bg-[#0a2e2a] group-hover/patient:text-[#bbed3b] transition-all">
                                                    <User size={14} strokeWidth={2.5} />
                                                </div>
                                                <span className="font-bold text-gray-700 tracking-tight text-[11px]">{order.customer_name || 'Walk-in'}</span>
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 bg-gray-50/50 border-y border-gray-100">{getPlatformBadge(order.order_channel)}</td>
                                        <td className="py-4 px-4 bg-gray-50/50 border-y border-gray-100">
                                            <div className="flex flex-col">
                                                <p className="text-gray-800 font-bold text-[11px] tracking-tight truncate max-w-[180px]">{order.product_name}</p>
                                                <p className="text-[9px] font-bold text-[#0a2e2a]/40 uppercase tracking-widest">{order.quantity || 1} UNIT(S)</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 bg-gray-50/50 border-y border-gray-100 text-gray-900 font-black text-right text-[11px]">₹{Number(order.total_amount || 0).toLocaleString()}</td>
                                        <td className="py-4 px-4 bg-gray-50/50 border-y border-gray-100 text-center">
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-[0.05em]
                                                ${order.order_status === 'Pending' ? 'text-amber-600 bg-white border-amber-100 shadow-sm' : 
                                                  order.order_status === 'Confirmed' ? 'text-blue-600 bg-white border-blue-100 shadow-sm' :
                                                  order.order_status === 'Completed' ? 'text-emerald-600 bg-white border-emerald-100' :
                                                  'text-gray-400 bg-white border-gray-100'}`}>
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 bg-gray-50/50 rounded-r-2xl border-y border-r border-gray-100 text-right">
                                            <button 
                                                onClick={() => setSelectedOrderId(order.order_id)}
                                                className="w-8 h-8 bg-[#0a2e2a] text-[#bbed3b] rounded-lg flex items-center justify-center ml-auto hover:bg-[#16423c] transition-all shadow-md shadow-[#0a2e2a]/10 active:scale-90"
                                                title="Open Order Dossier"
                                            >
                                                <Eye size={16} strokeWidth={2.5} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center opacity-40">
                                            <Loader2 size={32} className="animate-spin text-[#0a2e2a] mx-auto mb-2" />
                                            <p className="text-[#0a2e2a] font-black uppercase tracking-[0.3em] text-[9px]">SYNCHRONIZING FEED</p>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-32 text-center opacity-20">
                                            <PackageOpen size={64} className="text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[9px]">EMPTY BUFFER</p>
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
                <OrderDetailDrawer 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)}
                    onStatusUpdate={() => loadOrders(false)}
                />
            )}

            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `}</style>
        </div>
    );
};

export default Orders;
