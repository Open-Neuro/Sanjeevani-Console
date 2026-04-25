import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Search, MapPin, Package, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';
import { fetchCustomers } from '../services/api';
import PatientDetailDrawer from '../components/PatientDetailDrawer';

const Customers = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    useEffect(() => {
        const loadCustomers = async () => {
            try {
                setLoading(true);
                const data = await fetchCustomers(page, 12, search);
                setPatients(data.data || []);
                setTotal(data.total || 0);
            } catch (err) {
                console.error('Error fetching customers:', err);
                setPatients([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(loadCustomers, 300);
        return () => clearTimeout(timeoutId);
    }, [page, search]);

    return (
        <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-y-auto">
            <Header title="Customer Directory" />

            <div className="px-8 pb-8 space-y-6 mt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or patient ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl w-full text-sm shadow-sm focus:ring-2 focus:ring-[#bbed3b] outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Total Records: <span className="text-[#0a2e2a] ml-1">{total}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0a2e2a] text-white text-[10px] uppercase tracking-[0.2em] font-black">
                                    <th className="py-5 px-6">Customer / Patient</th>
                                    <th className="py-5 px-6">Location</th>
                                    <th className="py-5 px-6">Order Volume</th>
                                    <th className="py-5 px-6">LTV (INR)</th>
                                    <th className="py-5 px-6 text-right">Context</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="animate-spin text-[#0a2e2a] mx-auto" size={40} />
                                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing CRM Intel...</p>
                                        </td>
                                    </tr>
                                ) : patients.length > 0 ? (
                                    patients.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedPatientId(p.patient_id || p.id || p.name)}>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 text-[#0a2e2a] flex items-center justify-center font-black group-hover:bg-[#bbed3b] transition-colors">
                                                        {(p.name || p.customer_name || 'P').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-[#0a2e2a] transition-colors">{p.name || p.customer_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{p.patient_id || p.id || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-gray-500 font-medium italic text-xs">{p.location || p.address || 'Standard Location'}</td>
                                            <td className="py-5 px-6">
                                                <span className="font-black text-[#0a2e2a]">{p.total_orders || 0}</span>
                                                <span className="text-[9px] font-bold text-gray-400 ml-1 uppercase">Purchases</span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-black text-[10px]">
                                                    ₹{(p.avg_order_value || 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <button 
                                                    className="p-2 bg-gray-100 group-hover:bg-[#0a2e2a] group-hover:text-[#bbed3b] text-gray-400 rounded-xl transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPatientId(p.patient_id || p.id || p.name);
                                                    }}
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <ShoppingBag size={40} className="opacity-10" />
                                                <p className="font-bold text-[10px] uppercase tracking-[0.2em]">Zero intelligence matches found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-white border-t border-gray-50 flex items-center justify-between shrink-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Showing <span className="text-[#0a2e2a]">{patients.length}</span> patient profiles
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                Previous
                            </button>
                            <div className="w-10 h-10 flex items-center justify-center bg-[#0a2e2a] text-[#bbed3b] rounded-xl text-xs font-black">
                                {page}
                            </div>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={patients.length < 12}
                                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedPatientId && (
                <PatientDetailDrawer 
                    patientId={selectedPatientId} 
                    onClose={() => setSelectedPatientId(null)} 
                />
            )}
        </div>
    );
};

export default Customers;
