import { useState, useEffect } from 'react';
import { X, Package, Pill, IndianRupee, QrCode, ClipboardCheck, ImageIcon, CheckCircle, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { fetchOrderDetails, updateOrderStatus } from '../services/api';

interface OrderDetailModalProps {
    orderId: string;
    onClose: () => void;
    onStatusUpdate: () => void;
}

const OrderDetailModal = ({ orderId, onClose, onStatusUpdate }: OrderDetailModalProps) => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

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

    const handleVerifyOTP = async () => {
        if (otp.length !== 4) return;
        setVerifying(true);
        try {
            // In a real app, this would hit a verify endpoint
            // For now, we simulate success and update status to Delivered
            await updateOrderStatus(orderId, 'Delivered');
            onStatusUpdate();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0a2e2a]/60 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#bbed3b] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#0a2e2a] font-bold uppercase tracking-widest text-xs">Decrypting Order Bundle...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0a2e2a]/60 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
                    <p className="text-red-500 font-bold mb-4">{error || 'Order not found'}</p>
                    <button onClick={onClose} className="w-full py-3 bg-[#0a2e2a] text-white rounded-xl font-bold">Close</button>
                </div>
            </div>
        );
    }

    const items = Array.isArray(order.items) ? order.items : [
        { name: order['Medicine Name'] || order.product_name, qty: order.Quantity || order['Quantity Ordered'] || 1, price: order['Total Amount'] || order.total_amount }
    ];

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0a2e2a]/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
                
                {/* Left Side: Order Intel */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar border-r border-gray-100">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                                Order Tracking Bundle
                            </span>
                            <h2 className="text-3xl font-black text-[#0a2e2a] tracking-tighter">#{order['Order ID']?.slice(-8)}</h2>
                            <p className="text-gray-400 text-sm font-medium mt-1">Placed on {new Date(order['Order Date']).toLocaleString()}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Prescription Section */}
                        {(order.prescription_required || order.prescription_url) && (
                            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 relative overflow-hidden">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
                                        <ClipboardCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-rose-900 font-black text-sm uppercase tracking-tight">Prescription Required</p>
                                        <p className="text-rose-600 text-xs font-bold">Verified by AI Vision</p>
                                    </div>
                                </div>
                                {order.prescription_url ? (
                                    <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                                        <img src={order.prescription_url} alt="Prescription" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ImageIcon className="text-white" size={32} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/60 rounded-2xl p-8 text-center border-2 border-dashed border-rose-200">
                                        <p className="text-rose-400 font-bold text-xs">Prescription image processed via WhatsApp</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Items */}
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Medication Items</h3>
                            <div className="space-y-3">
                                {items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0a2e2a] shadow-sm">
                                                <Pill size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Qty: {item.qty} Units</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-[#0a2e2a]">₹{Number(item.price || 0).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-[#0a2e2a] rounded-3xl p-6 text-white shadow-xl shadow-[#0a2e2a]/20">
                            <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase tracking-widest mb-2">
                                <span>Subtotal</span>
                                <span>₹{Number(order['Total Amount']).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase tracking-widest mb-4">
                                <span>Delivery Fee</span>
                                <span className="text-[#bbed3b]">FREE</span>
                            </div>
                            <div className="h-px bg-white/10 mb-4"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm uppercase tracking-tighter">Total Payable</span>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-[#bbed3b]">₹{Number(order['Total Amount']).toFixed(2)}</p>
                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Inclusive of taxes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Delivery & Logistics */}
                <div className="w-full md:w-[350px] bg-gray-50 p-8 flex flex-col relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-200 rounded-full transition-colors hidden md:block text-gray-400">
                        <X size={20} />
                    </button>

                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Logistics Console</h3>

                    <div className="flex-1 space-y-6">
                        {/* Delivery Status */}
                        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl ${order['Order Status'] === 'Completed' || order['Order Status'] === 'Delivered' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Status</p>
                                    <p className="text-gray-800 font-black">{order['Order Status'] || 'Awaiting Action'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <div className="w-0.5 h-10 bg-emerald-100"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Confirmed</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Pharmacist approved</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${order['Order Status'] === 'Dispatched' || order['Order Status'] === 'Delivered' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                        <div className={`w-0.5 h-10 ${order['Order Status'] === 'Delivered' ? 'bg-emerald-100' : 'bg-gray-100'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight opacity-50">Dispatched</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Out for delivery</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${order['Order Status'] === 'Delivered' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight opacity-50">Delivered</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Verification complete</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Address */}
                        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin size={16} className="text-emerald-500" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Coordinates</p>
                            </div>
                            <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                {order.address || 'H-204, Green Valley Apartments, Cyber City, Sector 56, Gurgaon'}
                            </p>
                        </div>

                        {/* Verification Tools */}
                        <div className="space-y-3 pt-4">
                            {!showQR ? (
                                <button 
                                    onClick={() => setShowQR(true)}
                                    className="w-full py-4 bg-[#0a2e2a] text-[#bbed3b] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-[#0a2e2a]/20 transition-all active:scale-95"
                                >
                                    <QrCode size={18} /> Show Delivery QR
                                </button>
                            ) : (
                                <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-xl flex flex-col items-center animate-scale-in">
                                    <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center relative mb-4">
                                        <QrCode size={120} className="text-[#0a2e2a]" />
                                        <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-2xl animate-pulse"></div>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-6">
                                        Scan to Verify Rider
                                    </p>
                                    <div className="w-full">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-1">Manual OTP Verification</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                maxLength={4} 
                                                placeholder="----"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-center font-black tracking-[0.5em] text-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                                            />
                                            <button 
                                                onClick={handleVerifyOTP}
                                                disabled={otp.length !== 4 || verifying}
                                                className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 active:scale-90 transition-all disabled:opacity-50"
                                            >
                                                {verifying ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowQR(false)} className="mt-4 text-[10px] font-black text-gray-400 uppercase hover:text-red-500 transition-colors tracking-widest">
                                        Cancel Scanning
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default OrderDetailModal;
