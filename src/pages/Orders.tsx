import { useState, useEffect } from 'react';
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
    Bell
} from 'lucide-react';
import { fetchRecentOrders } from '../services/api';

interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface Order {
    order_id: string;
    customer_name: string;
    order_channel: string;
    product_name: string;
    quantity: number;
    total_amount: number;
    order_status: string;
    [key: string]: any;
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [page] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (type: Toast['type'], message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await fetchRecentOrders(50);
            setOrders(data.data || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrders([]);
            setTotal(0);
            showToast('error', 'Failed to sync with pharmacy core.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 10000);
        return () => clearInterval(interval);
    }, [page, search]);

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
        if (p.includes('whatsapp')) return <span className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm"><MessageCircle size={15} /> WhatsApp</span>;
        if (p.includes('telegram')) return <span className="inline-flex items-center gap-1.5 text-blue-500 font-semibold text-sm"><Send size={15} /> Telegram</span>;
        if (p.includes('sms')) return <span className="inline-flex items-center gap-1.5 text-purple-600 font-semibold text-sm"><Smartphone size={15} /> SMS</span>;
        if (p.includes('voice')) return <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-sm"><Smartphone size={15} /> Voice AI</span>;
        return <span className="inline-flex items-center gap-1.5 text-gray-500 font-semibold text-sm"><Globe size={15} /> Web</span>;
    };

    const isLive = (o: any) => {
        const s = String(o.order_status || o.status || '').toLowerCase();
        return s === 'pending' || s === 'confirmed' || s === 'validated';
    };

    const pendingCount = orders.filter(o => isLive(o)).length;

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar bg-[#f8faf9]">
            <Header title="Orders Terminal (AI Orchestration Live)" />

            <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`
                            flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold max-w-sm pointer-events-auto
                            transition-all duration-300 animate-slide-in
                            ${t.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}
                            ${t.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : ''}
                            ${t.type === 'info' ? 'bg-sky-50 text-sky-800 border-sky-200' : ''}
                        `}
                    >
                        {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500 shrink-0" />}
                        {t.type === 'error' && <X size={18} className="text-red-500 shrink-0" />}
                        {t.type === 'info' && <Bell size={18} className="text-sky-500 shrink-0" />}
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Live Processing</p>
                            <p className="text-3xl font-black text-gray-800">{pendingCount}</p>
                            <p className="text-[10px] font-semibold text-gray-400 mt-1">{loading ? 'Syncing...' : 'Live order queue'}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                            {loading ? <Loader2 className="animate-spin" size={28} /> : <PackageOpen size={28} />}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                        <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p><p className="text-3xl font-black text-gray-800">{total}</p></div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><Globe size={28} /></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 animate-pulse"></div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl w-72 text-sm focus:outline-none focus:ring-2 focus:ring-[#bbed3b] transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                            Live backend orders
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Hash</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Channel</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Medication</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value (INR)</th>
                                    <th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center italic">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                                    <tr key={i} className="border-b border-gray-50 transition-all hover:bg-gray-50/50 group">
                                        <td className="py-5 px-4">
                                            <span className="font-mono text-gray-400 text-xs">#{order.order_id?.slice(-6) || 'N/A'}</span>
                                        </td>
                                        <td className="py-5 px-4 font-bold text-gray-800">{order.customer_name || 'Anonymous'}</td>
                                        <td className="py-5 px-4">{getPlatformBadge(order.order_channel || order.channel || order.source)}</td>
                                        <td className="py-5 px-4 text-gray-600 font-medium">{order.product_name || '-'}</td>
                                        <td className="py-5 px-4 text-gray-600 font-black">{Math.round(order.quantity || 1)}</td>
                                        <td className="py-5 px-4 text-gray-900 font-black text-right">{Number(order.total_amount || 0).toFixed(2)}</td>
                                        <td className="py-5 px-4 text-center">
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                                                {order.order_status || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={48} className="text-gray-200 animate-spin" />
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading live orders</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <PackageOpen size={48} className="text-gray-200" />
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No live orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.25s ease-out; }
            `}</style>
        </div>
    );
};

export default Orders;
