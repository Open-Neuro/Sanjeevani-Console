import { useState, useEffect } from 'react';
import { Search, Upload, Filter, Activity, ShieldAlert, Loader2, Plus, X, Package } from 'lucide-react';
import { fetchProducts, addProduct } from '../services/api';

const ProductTable = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [category] = useState('');

    // Add product modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ medicine_name: '', category: '', stock: 0, generic_name: '', brand_name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts(page, 10, search, category);
            setProducts(data.data || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(loadProducts, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [page, search, category]);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await addProduct(newProduct);
            setIsModalOpen(false);
            setNewProduct({ medicine_name: '', category: '', stock: 0, generic_name: '', brand_name: '' });
            loadProducts(); // Refresh list
        } catch (err) {
            console.error("Error adding product:", err);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="bg-white rounded-xl p-5 mx-8 mb-6 border border-gray-100 shadow-sm">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                            <ShieldAlert size={14} /> Low Stock
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors">
                            <Activity size={14} /> Expiring Soon
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0a2e2a] text-white rounded-lg font-medium text-sm hover:bg-[#133d39] transition-colors shadow-sm">
                        <Upload size={16} /> Export
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#bbed3b] text-[#0a2e2a] rounded-lg font-bold text-sm hover:bg-[#aade2a] transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-[#0a2e2a]" size={40} />
                            <p className="text-sm font-semibold text-gray-400">Synchronizing Inventory...</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black italic">
                                <th className="py-3 px-6">Product Intelligence</th>
                                <th className="py-3 px-4">Classification</th>
                                <th className="py-3 px-4 w-48">Inventory Health</th>
                                <th className="py-3 px-4">Generic Detail</th>
                                <th className="py-3 px-4 text-center">Safety</th>
                                <th className="py-3 px-4">Manufacturer</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {products.length > 0 ? products.map((prod, i) => {
                                const stock = Number(prod["Current Stock"] || prod.Stock || 0);
                                const maxStock = 200; // Reference for progress bar
                                const stockPercent = Math.min((stock / maxStock) * 100, 100);

                                let stockColor = "bg-green-500";
                                let stockBg = "bg-green-50";
                                let stockText = "text-green-700";

                                if (stock === 0) {
                                    stockColor = "bg-red-500";
                                    stockBg = "bg-red-50";
                                    stockText = "text-red-700";
                                } else if (stock < 20) {
                                    stockColor = "bg-orange-500";
                                    stockBg = "bg-orange-50";
                                    stockText = "text-orange-700";
                                }

                                return (
                                    <tr key={i} className="group bg-white hover:bg-[#fcfdfa] transition-all duration-300 shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                                        <td className="py-4 px-6 rounded-l-xl border-y border-l border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-extrabold text-[#0a2e2a] text-base group-hover:text-[#16a34a] transition-colors">
                                                    {prod["Medicine Name"]}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                                                    ID: {prod["Product ID"] || "S-99212"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 border-y border-gray-100">
                                            <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wide border border-gray-100">
                                                {prod.Category || "General"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 border-y border-gray-100">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-xs font-black ${stockText}`}>
                                                        {stock} Units
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                                                        {stock === 0 ? 'Out of Stock' : stock < 20 ? 'Critical' : 'Stable'}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${stockColor} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                                                        style={{ width: `${stockPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 border-y border-gray-100">
                                            <span className="text-gray-500 italic text-xs font-medium block truncate max-w-[120px]" title={prod["Generic Name"]}>
                                                {prod["Generic Name"] || "-"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 border-y border-gray-100 text-center">
                                            {prod.Category?.toLowerCase().includes('antibiotic') || prod.Category?.toLowerCase().includes('chronic') ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded-sm text-[9px] font-black uppercase shadow-sm">Rx Only</span>
                                                    <span className="text-[8px] text-purple-400 font-bold mt-1 uppercase tracking-tighter">High Safety</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-200 text-xs font-black">OTC</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 rounded-r-xl border-y border-r border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                                                    <Activity size={12} className="text-teal-600" />
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-700 truncate max-w-[100px]">
                                                    {prod["Brand Name"] || "Sanjeevani Care"}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Package size={48} className="text-gray-300" />
                                            <p className="text-lg font-bold text-gray-400">No Intelligence Data Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <p>Showing {products.length} of {total} tracked medicines.</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="font-bold text-gray-900">Page {page}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={products.length < 10}
                        className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#0a2e2a]">Add New Product</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name *</label>
                                <input
                                    required
                                    value={newProduct.medicine_name}
                                    onChange={e => setNewProduct({ ...newProduct, medicine_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                                    placeholder="e.g. Paracetamol 500mg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <input
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                                        placeholder="e.g. Analgesic"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Stock</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newProduct.stock}
                                        onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Generic Name</label>
                                <input
                                    value={newProduct.generic_name}
                                    onChange={e => setNewProduct({ ...newProduct, generic_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                                    placeholder="e.g. Acetaminophen"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand Name</label>
                                <input
                                    value={newProduct.brand_name}
                                    onChange={e => setNewProduct({ ...newProduct, brand_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bbed3b]"
                                    placeholder="e.g. Tylenol"
                                />
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-[#0a2e2a] text-[#bbed3b] rounded-lg font-bold hover:bg-[#133d39] disabled:opacity-70 flex justify-center items-center">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;
