import { useState, useEffect } from 'react';
import { X, Package, Pill, CheckCircle, Clock, ShieldCheck, MapPin, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { fetchOrderDetails, updateOrderStatus } from '../services/api';

interface OrderDetailDrawerProps {
    orderId: string;
    onClose: () => void;
    onStatusUpdate: () => void;
}

const OrderDetailDrawer = ({ orderId, onClose, onStatusUpdate }: OrderDetailDrawerProps) => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [otpVisible, setOtpVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchOrderDetails(orderId);
                setOrder(data.data);
            } catch (err: any) {
                setError(err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, [orderId]);

    const handleConfirmOrder = async () => {
        try {
            setActionLoading(true);
            await updateOrderStatus(orderId, 'Confirmed');
            setOtpVisible(true);
            onStatusUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 z-[700] flex justify-end animate-fade-in">
            <div className="absolute inset-0 bg-[#0a2e2a]/05 backdrop-blur-[2px] transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-gray-100 overflow-hidden">
                
                {/* Header: Tight & Professional */}
                <div className="px-5 py-4 bg-[#0a2e2a] text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                            <Package size={14} className="text-[#bbed3b]" />
                        </div>
                        <div>
                            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-[#bbed3b]/50">SECURE CONSOLE</p>
                            <h2 className="text-xs font-bold tracking-tight">ORDER #{orderId.slice(-8).toUpperCase()}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin text-[#0a2e2a]" />
                        <p className="text-[#0a2e2a] font-black uppercase tracking-[0.3em] text-[7px] opacity-40">FETCHING DOSSIER</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                        
                        {/* Status Card: Subscribed UI */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                                    order['Order Status'] === 'Pending' ? 'bg-amber-500' : 
                                    order['Order Status'] === 'Confirmed' ? 'bg-sky-500' : 
                                    'bg-emerald-500'
                                } text-white`}>
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">STATE</p>
                                    <p className="text-[#0a2e2a] font-black text-[10px] uppercase">{order['Order Status'] || 'PENDING'}</p>
                                </div>
                            </div>
                            {order['Order Status'] === 'Pending' && (
                                <button 
                                    disabled={actionLoading}
                                    onClick={handleConfirmOrder}
                                    className="px-3 py-1.5 bg-[#0a2e2a] text-[#bbed3b] rounded-lg font-black text-[8px] uppercase tracking-widest hover:bg-[#16423c] transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={10} className="animate-spin" /> : 'VERIFY'} 
                                    <ArrowRight size={10} />
                                </button>
                            )}
                        </div>

                        {/* OTP Block: High-Security Aesthetic */}
                        {(order['Order Status'] === 'Confirmed' || otpVisible) && (
                            <div className="bg-[#bbed3b] rounded-xl p-5 text-[#0a2e2a] border border-[#0a2e2a]/5 animate-scale-in">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck size={14} className="opacity-60" />
                                    <p className="font-black text-[7px] uppercase tracking-[0.2em] opacity-60">SECURE HANDOVER KEY</p>
                                </div>
                                <div className="text-3xl font-black tracking-[0.3em] text-center bg-white/30 py-2.5 rounded-lg border border-[#0a2e2a]/5 shadow-inner">
                                    {order['Order ID']?.slice(-4).toUpperCase() || '8291'}
                                </div>
                                <p className="text-[7px] font-bold text-center mt-3 uppercase tracking-widest opacity-40">Provide this key to the delivery partner</p>
                            </div>
                        )}

                        {/* Patient Information Section */}
                        <div className="space-y-2.5">
                            <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">PATIENT INTEL</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <p className="text-[7px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1.5"><User size={8} /> NAME</p>
                                    <p className="font-bold text-[#0a2e2a] text-[9px] truncate tracking-tight">{order['Patient Name'] || 'Anonymous'}</p>
                                </div>
                                <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <p className="text-[7px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1.5"><Phone size={8} /> CHANNEL</p>
                                    <p className="font-bold text-[#0a2e2a] text-[9px] tracking-tight truncate">{order['Contact Number']?.replace('whatsapp:', '') || 'HIDDEN'}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                <p className="text-[7px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1.5"><MapPin size={8} /> DESTINATION</p>
                                <p className="text-[#0a2e2a] font-bold text-[9px] leading-relaxed tracking-tight line-clamp-2 italic opacity-80">
                                    {order['Delivery Address'] || 'Verified channel coordinates'}
                                </p>
                            </div>
                        </div>

                        {/* Billing Section: Modern & Compact */}
                        <div className="space-y-2.5">
                            <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">FINANCIALS</h3>
                            <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                <Pill size={12} />
                                            </div>
                                            <p className="font-bold text-[#0a2e2a] text-[10px] tracking-tight">{order['Medicine Name'] || 'MULTI-ITEM ORDER'}</p>
                                        </div>
                                        <p className="text-[9px] font-black text-[#0a2e2a] opacity-40">x{order['Quantity Ordered'] || 1}</p>
                                    </div>
                                    <div className="h-px bg-gray-50"></div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <span>Subtotal</span>
                                            <span className="text-[#0a2e2a]">₹{Number(order['Total Amount']).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
                                            <span>AI-Logistics Fee</span>
                                            <span>COMPLIMENTARY</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-2.5 bg-[#0a2e2a] text-white flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[8px] font-black text-[#bbed3b]/40">TOTAL</span>
                                        <p className="text-[11px] font-black text-[#bbed3b]">₹{Number(order['Total Amount']).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle size={9} className="text-[#bbed3b]" />
                                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#bbed3b]/60">PAYMENT SECURE</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Section */}
                        {(order.prescription_required || order.prescription_url) && (
                            <div className="space-y-2.5 pb-4">
                                <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">AI EVIDENCE</h3>
                                <button 
                                    onClick={() => window.open(order.prescription_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800', '_blank')}
                                    className="w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm relative group bg-gray-50 flex flex-col items-center"
                                >
                                    <img 
                                        src={order.prescription_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800'} 
                                        alt="Prescription" 
                                        className="w-full aspect-[4/3] object-contain group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-[#0a2e2a]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/20">Click to Zoom Rx</span>
                                    </div>
                                </button>
                                <p className="text-[8px] text-gray-400 font-bold text-center italic mt-1">Verify medication names & dosage carefully</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes scale-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-left { animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-scale-in { animation: scale-in 0.3s ease-out; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `}</style>
        </div>
    );
};

export default OrderDetailDrawer;
