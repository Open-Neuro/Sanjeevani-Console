import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Search, MapPin, Package, ShoppingBag, Loader2 } from 'lucide-react';
import { fetchCustomers } from '../services/api';

const Customers = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

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

            <div className="p-8">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or patient ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-full text-sm shadow-sm focus:ring-2 focus:ring-[#bbed3b] outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm text-sm">
                            <span className="text-gray-500">Total Customers:</span> <span className="font-bold text-[#0a2e2a]">{total}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0a2e2a] text-white text-xs uppercase tracking-widest font-bold">
                                    <th className="py-4 px-6">Customer / Patient</th>
                                    <th className="py-4 px-6 flex items-center gap-2"><MapPin size={14} /> Location</th>
                                    <th className="py-4 px-6"><ShoppingBag size={14} className="inline mr-2" /> Total Orders</th>
                                    <th className="py-4 px-6"><Package size={14} className="inline mr-2" /> Avg Value</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="animate-spin text-[#0a2e2a] mx-auto" size={40} />
                                            <p className="mt-2 text-gray-500 font-medium">Loading database...</p>
                                        </td>
                                    </tr>
                                ) : patients.length > 0 ? (
                                    patients.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                        {(p.name || p.customer_name || 'P').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-[#0a2e2a]">{p.name || p.customer_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{p.patient_id || p.id || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 italic">{p.location || p.address || 'Not available'}</td>
                                            <td className="py-4 px-6 font-semibold">{p.total_orders || 0}</td>
                                            <td className="py-4 px-6">
                                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-bold text-xs">
                                                    {(p.avg_order_value || 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="bg-gray-100 hover:bg-[#bbed3b] text-[#0a2e2a] px-4 py-1.5 rounded-lg font-bold text-xs transition-all">
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400">
                                            No customer records found for this pharmacy.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Showing <span className="font-bold">{patients.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-4 py-1 bg-[#0a2e2a] text-white rounded-lg text-xs font-bold">
                                {page}
                            </div>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={patients.length < 12}
                                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customers;
