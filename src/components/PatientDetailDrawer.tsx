import React, { useEffect, useState } from 'react';
import { X, User, Phone, MapPin, Package, Clock, ShieldAlert, History, Activity } from 'lucide-react';
import { fetchPatientProfile, fetchPatientOrders } from '../services/api';

interface PatientDetailDrawerProps {
    patientId: string;
    onClose: () => void;
}

const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({ patientId, onClose }) => {
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [profileRes, ordersRes] = await Promise.all([
                    fetchPatientProfile(patientId),
                    fetchPatientOrders(patientId, 1, 10)
                ]);
                setProfile(profileRes.data);
                setOrders(ordersRes.data || []);
            } catch (err) {
                console.error('Error loading patient details:', err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) loadData();
    }, [patientId]);

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col">
            <div className="bg-[#0a2e2a] p-6 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100/20 flex items-center justify-center text-teal-300 font-bold text-xl">
                        {profile?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{profile?.name || 'Patient Profile'}</h2>
                        <p className="text-xs text-teal-400 font-mono">ID: {patientId}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <Activity className="animate-spin text-teal-600" size={40} />
                        <p className="text-xs font-black uppercase tracking-widest">Synchronizing Patient Intelligence...</p>
                    </div>
                ) : (
                    <>
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Core Context</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600"><Phone size={18} /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Contact Number</p>
                                        <p className="text-sm font-bold text-gray-800">{profile?.contact_number || profile?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600"><MapPin size={18} /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Address / Location</p>
                                        <p className="text-sm font-bold text-gray-800 truncate">{profile?.address || 'No address on file'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Purchase History</h3>
                                <History size={14} className="text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {orders.length > 0 ? orders.map((order, i) => (
                                    <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-teal-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-black text-[#0a2e2a]">#{order.order_id?.slice(-6) || 'N/A'}</p>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(order.order_date || order['Order Date']).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">{order.product_name || order['Medicine Name']}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded-md">Qty: {Math.round(order.quantity || 1)}</span>
                                            <span className="text-xs font-black text-[#0a2e2a]">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center py-10 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-2xl">No previous orders found.</p>
                                )}
                            </div>
                        </div>

                        {/* AI Insights for Patient */}
                        <div className="p-6 bg-[#bbed3b]/10 rounded-3xl border border-[#bbed3b]/30">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldAlert size={18} className="text-[#0a2e2a]" />
                                <h3 className="text-xs font-black text-[#0a2e2a] uppercase tracking-wider">AI Patient Risk Profile</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-600">Adherence Score</span>
                                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-full">{profile?.adherence_score || '85'}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-600">Chronic Status</span>
                                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-full">{profile?.is_chronic ? 'CHRONIC' : 'ACUTE'}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <div className="p-6 border-t border-gray-100 shrink-0">
                <button 
                    className="w-full bg-[#0a2e2a] text-[#bbed3b] py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest"
                    onClick={onClose}
                >
                    Close Profile
                </button>
            </div>
        </div>
    );
};

export default PatientDetailDrawer;
