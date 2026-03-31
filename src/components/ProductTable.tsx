import { useState, useEffect, useRef } from 'react';
import { Search, Upload, Filter, Activity, ShieldAlert, Loader2, Plus, X, Package, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Edit, Trash2, Edit3, Save } from 'lucide-react';
import { fetchProducts, addProduct, bulkAddProducts } from '../services/api';
import * as XLSX from 'xlsx';

const SCHEDULES = ['OTC', 'H', 'H1', 'X'];
 
const ProductTable = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [category] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'expiring'>('all');
    
    /* ─── DUMMY DATA FOR DEMO ─── */
    const DUMMY_PRODUCTS: any[] = [
        { "Medicine Name": "Augmentin 625 Duo", "Category": "Antibiotics", "Current Stock": 5, "Batch Number": "AUG-221", "Expiry Date": "2024-08-12", "MRP": 210, "Selling Price": 195, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Pan D Capsule", "Category": "Antacids", "Current Stock": 12, "Batch Number": "PAN-005", "Expiry Date": "2025-01-20", "MRP": 185, "Selling Price": 165, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Dolo 650mg", "Category": "Analgesics", "Current Stock": 450, "Batch Number": "DOL-884", "Expiry Date": "2025-06-15", "MRP": 30, "Selling Price": 28, "Schedule": "OTC", "Prescription Required": false },
        { "Medicine Name": "Zifi 200mg", "Category": "Antibiotics", "Current Stock": 18, "Batch Number": "ZIF-112", "Expiry Date": "2024-11-30", "MRP": 155, "Selling Price": 140, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Lipitor 10mg", "Category": "Statins", "Current Stock": 8, "Batch Number": "LIP-334", "Expiry Date": "2024-05-10", "MRP": 450, "Selling Price": 410, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Metformin 500mg", "Category": "Anti-Diabetic", "Current Stock": 200, "Batch Number": "MET-771", "Expiry Date": "2025-12-01", "MRP": 15, "Selling Price": 12, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Amlodipine 5mg", "Category": "Hypertension", "Current Stock": 150, "Batch Number": "AML-445", "Expiry Date": "2025-03-22", "MRP": 85, "Selling Price": 75, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Azithromycin 500mg", "Category": "Antibiotics", "Current Stock": 45, "Batch Number": "AZI-992", "Expiry Date": "2024-12-15", "MRP": 120, "Selling Price": 105, "Schedule": "H", "Prescription Required": true },
        { "Medicine Name": "Vicks Action 500", "Category": "Cold & Flu", "Current Stock": 85, "Batch Number": "VIC-111", "Expiry Date": "2025-05-10", "MRP": 45, "Selling Price": 42, "Schedule": "OTC", "Prescription Required": false },
        { "Medicine Name": "Shelcal 500mg", "Category": "Supplements", "Current Stock": 110, "Batch Number": "SHE-223", "Expiry Date": "2025-08-20", "MRP": 115, "Selling Price": 95, "Schedule": "OTC", "Prescription Required": false },
    ];
    /* ─────────────────────────── */

    void DUMMY_PRODUCTS;

    // Add product modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quickAddMode, setQuickAddMode] = useState(false);
    
    // Initial State for Product
    const initialProductState = { 
        medicine_name: '', category: 'General', stock: 0, 
        generic_name: '', brand_name: '', batch_no: '', 
        expiry_date: '', mrp: 0, selling_price: 0, 
        schedule: 'OTC', prescription_required: false 
    };
    
    const [newProduct, setNewProduct] = useState(initialProductState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Bulk import state (Excel)
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importData, setImportData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Bulk Entry Mode (Spreadsheet-like)
    const [isBulkEntryOpen, setIsBulkEntryOpen] = useState(false);
    const [bulkEntries, setBulkEntries] = useState<any[]>([]);

    const loadProducts = async () => {
        try {
            const data = await fetchProducts(page, 10, search, category);
            // Apply client-side filters if needed, though usually backend handles it
            let filtered = data.data || [];
            
            if (filterStatus === 'low_stock') {
                filtered = filtered.filter((p: any) => {
                    const stock = Number(p["Current Stock"] || p.stock || 0);
                    return stock < 20;
                });
            } else if (filterStatus === 'expiring') {
                // Rough filter for expiring soon assuming proper date format
                filtered = filtered.filter((p: any) => {
                    const exp = p["Expiry Date"] || p.expiry_date;
                    if (!exp) return false;
                    const expDate = new Date(exp);
                    const now = new Date();
                    const diffTime = Math.abs(expDate.getTime() - now.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    return diffDays < 90 && expDate > now;
                });
            }

            setProducts(filtered);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Error fetching products:", err);
            setProducts([]);
            setTotal(0);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(loadProducts, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [page, search, category, filterStatus]);

    // Update prescription logic automatically based on schedule
    useEffect(() => {
        if (newProduct.schedule === 'OTC') {
            setNewProduct(prev => ({ ...prev, prescription_required: false }));
        } else {
            setNewProduct(prev => ({ ...prev, prescription_required: true }));
        }
    }, [newProduct.schedule]);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.medicine_name.trim()) return;
        try {
            setIsSubmitting(true);
            await addProduct(newProduct);
            setIsModalOpen(false);
            setNewProduct(initialProductState);
            loadProducts(); // Refresh list
        } catch (err) {
            console.error("Error adding product:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                
                // Helper to format Excel date numbers
                const formatExcelDate = (val: any) => {
                    if (typeof val === 'number') {
                        // Excel serial date to JS Date
                        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                        return date.toISOString().split('T')[0];
                    }
                    return val ? String(val) : '';
                };

                // Transform data to match API
                const transformedData = data.map((row: any) => {
                    const schedule = row['Schedule'] || row['schedule'] || 'OTC';
                    return {
                        medicine_name: String(row['Medicine Name'] || row['Name'] || row['medicine_name'] || ''),
                        category: String(row['Category'] || row['category'] || 'General'),
                        stock: parseInt(row['Stock'] || row['Current Stock'] || row['stock'] || 0),
                        generic_name: String(row['Generic Name'] || row['generic_name'] || ''),
                        brand_name: String(row['Brand Name'] || row['brand_name'] || ''),
                        batch_no: String(row['Batch No'] || row['Batch Number'] || row['batch_no'] || ''),
                        expiry_date: formatExcelDate(row['Expiry Date'] || row['expiry_date']),
                        mrp: parseFloat(row['MRP'] || row['mrp'] || 0),
                        selling_price: parseFloat(row['Selling Price'] || row['selling_price'] || row['Price'] || 0),
                        schedule: String(schedule),
                        prescription_required: schedule !== 'OTC'
                    };
                }).filter(p => p.medicine_name);

                setImportData(transformedData);
                setIsImportModalOpen(transformedData.length > 0);
                if (transformedData.length === 0) {
                    setImportError("No valid product data found in the file.");
                }
            } catch (err) {
                console.error("Error parsing Excel:", err);
                setImportError("Failed to parse the file. Please ensure it's a valid Excel or CSV file.");
            }
        };
        reader.readAsBinaryString(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleBulkImport = async () => {
        try {
            setIsImporting(true);
            setImportError(null);
            await bulkAddProducts(importData);
            setIsImportModalOpen(false);
            setImportData([]);
            loadProducts();
        } catch (err: any) {
            console.error("Error in bulk import:", err);
            setImportError(err.message || "Bulk import failed.");
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Medicine Name': 'Example Medicine 500mg',
                'Category': 'Analgesic',
                'Stock': 100,
                'Generic Name': 'Acetaminophen',
                'Brand Name': 'PharmaCare',
                'Batch Number': 'BCH-1002',
                'Expiry Date': '2026-12-31',
                'MRP': 50.00,
                'Selling Price': 45.00,
                'Schedule': 'OTC'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products Template");
        XLSX.writeFile(wb, "Sanjeevani_Product_Template.xlsx");
    };

    // Bulk Entry table handlers
    const addBulkRow = () => {
        setBulkEntries([...bulkEntries, { ...initialProductState }]);
    };

    const removeBulkRow = (index: number) => {
        setBulkEntries(bulkEntries.filter((_, i) => i !== index));
    };

    const updateBulkRow = (index: number, field: string, value: any) => {
        const newEntries = [...bulkEntries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        // Auto-update prescription required based on schedule
        if (field === 'schedule') {
             newEntries[index].prescription_required = value !== 'OTC';
        }
        setBulkEntries(newEntries);
    };

    const handleSaveBulkEntry = async () => {
        const validEntries = bulkEntries.filter(e => e.medicine_name.trim() !== '');
        if (validEntries.length === 0) return;
        
        try {
            setIsImporting(true);
            await bulkAddProducts(validEntries);
            setIsBulkEntryOpen(false);
            setBulkEntries([]);
            loadProducts();
        } catch(err) {
            console.error("Failed bulk save:", err);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 mx-8 mb-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-50 pb-5">
                <div>
                    <h2 className="text-xl font-bold text-[#0a2e2a]">Inventory Master</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage medicines, batches, and pricing</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />
                    <button 
                        onClick={downloadTemplate}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
                        title="Download Excel Template"
                    >
                        <Download size={16} /> Template
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <Upload size={16} /> Import
                    </button>
                    <button 
                        onClick={() => {
                            if (bulkEntries.length === 0) addBulkRow();
                            setIsBulkEntryOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-100 transition-colors shadow-sm"
                    >
                        <Edit3 size={16} /> Bulk Entry
                    </button>
                    <button
                        onClick={() => { setIsModalOpen(true); setQuickAddMode(false); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2e2a] text-[#bbed3b] border border-[#0a2e2a] rounded-xl font-bold text-sm hover:bg-[#133d39] transition-all shadow-md active:scale-95"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, generic, or brand..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl w-72 text-sm focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm">
                        <button 
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All Items
                        </button>
                        <button 
                            onClick={() => setFilterStatus('low_stock')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${filterStatus === 'low_stock' ? 'bg-orange-50 text-orange-700 shadow border border-orange-100' : 'text-gray-500 hover:text-orange-600'}`}
                        >
                            <ShieldAlert size={12} /> Low Stock
                        </button>
                        <button 
                            onClick={() => setFilterStatus('expiring')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${filterStatus === 'expiring' ? 'bg-red-50 text-red-700 shadow border border-red-100' : 'text-gray-500 hover:text-red-600'}`}
                        >
                            <Activity size={12} /> Expiring Soon
                        </button>
                    </div>
                </div>
                
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm">
                    <Filter size={16} /> Advanced Filters
                </button>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 custom-scrollbar relative w-full">
                <table className="w-full text-left min-w-[1200px]">
                    <thead className="bg-[#fcfdfa] sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                        <tr className="text-gray-500 text-[11px] uppercase tracking-wider font-bold">
                            <th className="py-4 px-5">Product Details</th>
                            <th className="py-4 px-4 w-32">Inventory</th>
                            <th className="py-4 px-4">Batch & Expiry</th>
                            <th className="py-4 px-4">Pricing (₹)</th>
                            <th className="py-4 px-4">Regulatory</th>
                            <th className="py-4 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {products.length > 0 ? products.map((prod, i) => {
                            const stock = Number(prod["Current Stock"] || prod.stock || 0);
                            const schedule = prod["Schedule"] || prod.schedule || 'OTC';
                            const reqRx = prod["Prescription Required"] || prod.prescription_required || (schedule !== 'OTC');
                            const mrp = Number(prod["MRP"] || prod.mrp || 0);
                            const sp = Number(prod["Selling Price"] || prod.selling_price || 0);
                            const batch = prod["Batch Number"] || prod.batch_no || '-';
                            const exp = prod["Expiry Date"] || prod.expiry_date || '-';
                            
                            let stockStatus = 'In Stock';
                            let stockColor = 'text-green-600';
                            let stockBg = 'bg-green-50';
                            let stockBorder = 'border-green-100';

                            if (stock === 0) {
                                stockStatus = 'Out of Stock';
                                stockColor = 'text-red-600';
                                stockBg = 'bg-red-50';
                                stockBorder = 'border-red-100';
                            } else if (stock < 20) {
                                stockStatus = 'Low Stock';
                                stockColor = 'text-orange-600';
                                stockBg = 'bg-orange-50';
                                stockBorder = 'border-orange-100';
                            }

                            return (
                                <tr key={i} className="group bg-white hover:bg-blue-50/30 transition-all duration-200">
                                    {/* Product Details */}
                                    <td className="py-3 px-5 border-l-2 border-transparent group-hover:border-[#bbed3b]">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[#0a2e2a] text-base group-hover:text-blue-700 transition-colors">
                                                {prod["Medicine Name"] || prod.medicine_name}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                    ID: {prod["Product ID"] || `M-8${i}21`}
                                                </span>
                                                {prod["Brand Name"] && <span className="text-xs text-gray-500 truncate max-w-[150px]">{prod["Brand Name"]}</span>}
                                            </div>
                                            <span className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={prod["Generic Name"] || prod.generic_name}>
                                                {prod["Generic Name"] || prod.generic_name || <span className="italic text-gray-300">No Generic Info</span>}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Inventory */}
                                    <td className="py-3 px-4">
                                        <div className={`inline-flex flex-col items-start px-2.5 py-1.5 rounded-lg border ${stockBg} ${stockBorder}`}>
                                            <span className={`text-sm font-black ${stockColor}`}>
                                                {stock} Unit{stock !== 1 && 's'}
                                            </span>
                                            <span className={`text-[9px] font-bold uppercase ${stockColor} opacity-80 mt-0.5`}>
                                                {stockStatus}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Batch & Expiry */}
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-400 font-medium w-8">B/N:</span>
                                                <span className="text-sm font-medium text-gray-700 font-mono tracking-tight">{batch}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-400 font-medium w-8">EXP:</span>
                                                <span className={`text-sm font-medium ${filterStatus==='expiring' ? 'text-red-600 font-bold' : 'text-gray-700'}`}>{exp}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Pricing */}
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col">
                                            {(mrp > 0 || sp > 0) ? (
                                                <>
                                                    <span className="text-sm font-bold text-gray-800">₹{sp > 0 ? sp.toFixed(2) : mrp.toFixed(2)}</span>
                                                    {mrp > sp && sp > 0 && <span className="text-[10px] text-gray-400 line-through">MRP ₹{mrp.toFixed(2)}</span>}
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">Not set</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Regulatory */}
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col items-start gap-1.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border 
                                                ${schedule === 'OTC' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                                                 schedule === 'H' || schedule === 'H1' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                                 'bg-red-50 text-red-700 border-red-200'}`}
                                            >
                                                Sch: {schedule}
                                            </span>
                                            {reqRx && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                                                    Rx Reqd
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-gray-50 rounded-full border border-gray-100">
                                            <Package size={32} className="text-gray-300" />
                                        </div>
                                        <p className="text-base font-bold text-gray-500">No inventory found matching criteria</p>
                                        <p className="text-xs text-gray-400 max-w-sm mt-1">Try adjusting your search or filters, or import new medicines to populate the catalog.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-4">
                <p>Showing <span className="font-bold text-gray-800">{products.length}</span> of <span className="font-bold text-gray-800">{total}</span> items</p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Previous
                    </button>
                    <div className="px-4 py-1.5 font-bold text-gray-800 bg-gray-50 rounded-lg border border-gray-100">
                        {page}
                    </div>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={products.length < 10}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* ====== MODALS ====== */}

            {/* 1. Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-[#0a2e2a]">Add Product Manually</h2>
                                <p className="text-xs text-gray-500 mt-1">Complete the form below to add a medicine to inventory</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox text-[#bbed3b] focus:ring-[#bbed3b] rounded"
                                        checked={quickAddMode} 
                                        onChange={(e) => setQuickAddMode(e.target.checked)} 
                                    />
                                    Quick Add Mode
                                </label>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border border-gray-100 shadow-sm transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <form id="addProductForm" onSubmit={handleAddProduct} className="space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> BASIC INFO
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Medicine Name <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                value={newProduct.medicine_name}
                                                onChange={e => setNewProduct({ ...newProduct, medicine_name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold"
                                                placeholder="e.g. Paracetamol 500mg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Category</label>
                                            <input
                                                value={newProduct.category}
                                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm"
                                                placeholder="e.g. Analgesic"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Initial Stock <span className="text-red-500">*</span></label>
                                            <input
                                                required
                                                type="number" min="0"
                                                value={newProduct.stock === 0 ? '' : newProduct.stock}
                                                onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold text-blue-700"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {!quickAddMode && (
                                    <>
                                        <hr className="border-gray-100" />
                                        
                                        {/* Product Details Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div> PRODUCT DETAILS
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Generic Name</label>
                                                    <input
                                                        value={newProduct.generic_name}
                                                        onChange={e => setNewProduct({ ...newProduct, generic_name: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm"
                                                        placeholder="e.g. Acetaminophen"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Brand Name</label>
                                                    <input
                                                        value={newProduct.brand_name}
                                                        onChange={e => setNewProduct({ ...newProduct, brand_name: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm"
                                                        placeholder="e.g. Tylenol"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        {/* Inventory Details Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div> INVENTORY & PRICING
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Batch Number</label>
                                                    <input
                                                        value={newProduct.batch_no}
                                                        onChange={e => setNewProduct({ ...newProduct, batch_no: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-mono tracking-tight"
                                                        placeholder="e.g. BATCH-A123"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Expiry Date</label>
                                                    <input
                                                        type="date"
                                                        value={newProduct.expiry_date}
                                                        onChange={e => setNewProduct({ ...newProduct, expiry_date: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm text-gray-700"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">MRP (₹)</label>
                                                    <input
                                                        type="number" step="0.01" min="0"
                                                        value={newProduct.mrp === 0 ? '' : newProduct.mrp}
                                                        onChange={e => setNewProduct({ ...newProduct, mrp: parseFloat(e.target.value) || 0 })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Selling Price (₹)</label>
                                                    <input
                                                        type="number" step="0.01" min="0"
                                                        value={newProduct.selling_price === 0 ? '' : newProduct.selling_price}
                                                        onChange={e => setNewProduct({ ...newProduct, selling_price: parseFloat(e.target.value) || 0 })}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold text-green-700"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <hr className="border-gray-100" />

                                        {/* Regulatory Section */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div> REGULATORY
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-1">Schedule</label>
                                                    <select
                                                        value={newProduct.schedule}
                                                        onChange={e => setNewProduct({ ...newProduct, schedule: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] transition-all text-sm font-medium"
                                                    >
                                                        {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex flex-col justify-center pt-5">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-5 h-5 form-checkbox text-purple-600 rounded-md border-gray-300 focus:ring-purple-500 transition-all"
                                                            checked={newProduct.prescription_required}
                                                            onChange={e => setNewProduct({ ...newProduct, prescription_required: e.target.checked })}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800">Prescription Required</span>
                                                            <span className="text-[10px] text-gray-500">Check to restrict sales without Rx</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="addProductForm"
                                disabled={isSubmitting} 
                                className="flex-2 px-4 py-3 bg-[#0a2e2a] text-[#bbed3b] rounded-xl font-bold text-sm hover:bg-[#133d39] disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-[#0a2e2a]/20 transition-all active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <Save size={18} /> Save Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Bulk Entry Modal (Spreadsheet style) */}
            {isBulkEntryOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-6xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-[#0a2e2a] flex items-center gap-2">
                                    <Edit3 size={20} className="text-blue-500" /> Bulk Manual Entry
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Quickly rapidly add multiple products like a spreadsheet</p>
                            </div>
                            <button onClick={() => setIsBulkEntryOpen(false)} className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border border-gray-100 shadow-sm transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar bg-gray-50 p-6">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left bg-white">
                                    <thead className="bg-gray-100/50 border-b border-gray-200 sticky top-0 z-10">
                                        <tr className="text-[11px] font-black uppercase text-gray-500 tracking-wider">
                                            <th className="py-3 px-4 w-12 text-center">#</th>
                                            <th className="py-3 px-4 min-w-[200px]">Medicine Name *</th>
                                            <th className="py-3 px-3 w-28">Stock *</th>
                                            <th className="py-3 px-3 min-w-[150px]">Batch No</th>
                                            <th className="py-3 px-3 w-36">Expiry</th>
                                            <th className="py-3 px-3 w-28">Price (₹)</th>
                                            <th className="py-3 px-3 w-28">Schedule</th>
                                            <th className="py-3 px-4 w-16 text-center">Del</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {bulkEntries.map((entry, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="py-2 px-4 text-center text-xs font-bold text-gray-400">{idx + 1}</td>
                                                <td className="py-2 px-4">
                                                    <input 
                                                        type="text"
                                                        value={entry.medicine_name} 
                                                        onChange={(e) => updateBulkRow(idx, 'medicine_name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent focus:bg-white text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-300"
                                                        placeholder="Name..."
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input 
                                                        type="number" min="0"
                                                        value={entry.stock === 0 ? '' : entry.stock} 
                                                        onChange={(e) => updateBulkRow(idx, 'stock', parseInt(e.target.value)||0)}
                                                        className="w-full px-3 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent focus:bg-white text-sm font-semibold text-blue-700 transition-all"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input 
                                                        type="text"
                                                        value={entry.batch_no} 
                                                        onChange={(e) => updateBulkRow(idx, 'batch_no', e.target.value)}
                                                        className="w-full px-3 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent focus:bg-white text-sm font-mono tracking-tight text-gray-600 transition-all"
                                                        placeholder="Batch"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input 
                                                        type="date"
                                                        value={entry.expiry_date} 
                                                        onChange={(e) => updateBulkRow(idx, 'expiry_date', e.target.value)}
                                                        className="w-full px-3 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent focus:bg-white text-xs text-gray-600 transition-all"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input 
                                                        type="number" step="0.01" min="0"
                                                        value={entry.selling_price === 0 ? '' : entry.selling_price} 
                                                        onChange={(e) => updateBulkRow(idx, 'selling_price', parseFloat(e.target.value)||0)}
                                                        className="w-full px-3 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent focus:bg-white text-sm font-semibold text-green-700 transition-all"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <select 
                                                        value={entry.schedule}
                                                        onChange={(e) => updateBulkRow(idx, 'schedule', e.target.value)}
                                                        className="w-full px-2 py-2 border border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent focus:bg-white text-xs font-bold transition-all text-gray-700"
                                                    >
                                                        {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </td>
                                                <td className="py-2 px-4 text-center">
                                                    <button onClick={() => removeBulkRow(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <button 
                                        onClick={addBulkRow}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Plus size={16} /> Add Row
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-500">{bulkEntries.length} row(s) ready</span>
                            <div className="flex gap-4">
                                <button onClick={() => setIsBulkEntryOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
                                <button 
                                    onClick={handleSaveBulkEntry} 
                                    disabled={isImporting || bulkEntries.filter(e => e.medicine_name.trim() !== '').length === 0}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                                >
                                    {isImporting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Save All Entries
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Bulk Import Preview Modal (Excel) */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#0a2e2a] tracking-tight">Import Preview</h2>
                                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mt-1">Found {importData.length} Valid Products in File</p>
                                </div>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-white hover:bg-gray-100 rounded-full border border-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {importError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                                <AlertCircle size={20} />
                                <p className="text-sm font-bold">{importError}</p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 rounded-2xl mb-6 shadow-inner bg-gray-50/30">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-gray-100 z-10 border-b border-gray-200">
                                    <tr className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                        <th className="py-3 px-6">Medicine Name</th>
                                        <th className="py-3 px-4">Stock</th>
                                        <th className="py-3 px-4">Batch/Exp</th>
                                        <th className="py-3 px-4">Price</th>
                                        <th className="py-3 px-4">Sch</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {importData.map((prod, idx) => (
                                        <tr key={idx} className="hover:bg-white transition-colors">
                                            <td className="py-3 px-6 font-bold text-[#0a2e2a]">{prod.medicine_name}</td>
                                            <td className="py-3 px-4 font-black tracking-tight">{prod.stock}</td>
                                            <td className="py-3 px-4 text-xs font-mono text-gray-600">
                                                {prod.batch_no || '-'}<br/><span className="text-gray-400 font-sans">{prod.expiry_date}</span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-bold text-green-700">₹{prod.selling_price || prod.mrp || 0}</td>
                                            <td className="py-3 px-4 text-xs font-bold text-purple-600">{prod.schedule}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsImportModalOpen(false)} 
                                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 border border-gray-200 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel Import
                            </button>
                            <button 
                                onClick={handleBulkImport}
                                disabled={isImporting || importData.length === 0}
                                className="flex-[2] px-6 py-4 bg-[#bbed3b] text-[#0a2e2a] rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-[#aade2a] shadow-xl shadow-[#bbed3b]/20 disabled:opacity-70 flex justify-center items-center gap-2 active:scale-95 transition-all"
                            >
                                {isImporting ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Commit {importData.length} Products
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;
