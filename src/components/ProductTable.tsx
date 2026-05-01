import { useEffect, useMemo, useRef, useState, useCallback, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  Image as ImageIcon,
  Loader2,
  Minus,
  Package,
  Pencil,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { addProduct, applyStockActions, bulkAddProducts, bulkImportPreview, deleteProduct, fetchProducts, fetchProductBatches, updateProduct } from '../services/api';

type UnitType = 'unit' | 'strip' | 'box';

interface ExtractedProduct {
  medicine_name: string;
  expiry_date: string;
  batch_no: string;
  manufacturer: string;
  mrp: string;
  confidence: number;
}

type PackBreakdown = { box: number; strip: number; unit: number };

type NormalizedBatch = {
  key: string;
  batchNo: string;
  expiryDate: string;
  availableBaseUnits: number;
  purchasePrice: number;
  sellingPrice: number;
  supplierName: string;
  unitType: string;
  raw: Record<string, any>;
};

type ProductRow = {
  id?: string;
  _id?: string;
  product_id?: string;
  computedId?: string;
  computedStock?: number;
  computedPrice?: number;
  computedPurchasePrice?: number;
  computedEarliestExpiry?: string;
  computedExpiryDays?: number | null;
  computedBatches?: NormalizedBatch[];
  computedAvailableBatches?: NormalizedBatch[];
  medicine_name?: string;
  strength?: string;
  generic_name?: string;
  brand_name?: string;
  manufacturer?: string;
  supplier_name?: string;
  category?: string;
  Category?: string;
  packaging?: { base_uom?: string; levels?: { level: string; to_base_units: number; label?: string }[] };
  stock_summary?: { available_base_units?: number; breakdown?: PackBreakdown };
  stock_breakdown?: PackBreakdown;
  stock?: number;
  "Stock"?: number;
  batch_no?: string;
  expiry_date?: string;
  selling_price?: number;
  unit_price?: number;
  mrp?: number;
  purchase_price?: number;
  schedule?: string;
  prescription_required?: boolean;
  barcodes?: { code: string; level: string; is_primary?: boolean }[];
  "Medicine Name"?: string;
  "Strength"?: string;
  "Generic Name"?: string;
  "Brand Name"?: string;
  "Manufacturer"?: string;
  "Supplier Name"?: string;
  "Current Stock"?: number;
  "Batch Number"?: string;
  "Expiry Date"?: string;
  "MRP"?: number;
  "Unit Price"?: number;
  "Purchase Price"?: number;
  "Selling Price"?: number;
  "Schedule"?: string;
  "Prescription Required"?: boolean;
  "Product ID"?: string;
  unit_type?: string;
  base_uom?: string;
  hsn_code?: string;
  gst_percentage?: number;
  is_schedule_h?: boolean;
  is_schedule_h1?: boolean;
  location_rack?: string;
  min_stock_alert?: number;
};

type ProductForm = {
  medicine_name: string;
  generic_name: string;
  brand_name: string;
  supplier_name: string;
  category: string;
  stock: number;
  batch_no: string;
  expiry_date: string; // YYYY-MM-DD
  selling_price: number;
  purchase_price: number;
  mrp: number;
  hsn_code: string;
  gst_percentage: number; // e.g. 12
  is_schedule_h: boolean;
  is_schedule_h1: boolean;
  location_rack: string;
  min_stock_alert: number;
  schedule: string;
  prescription_required: boolean;
  packaging: {
    base_uom: string;
    levels: { level: 'unit' | 'strip' | 'box'; label: string; to_base_units: number }[];
  };
  barcode: string;
  product_image_url: string;
};

type ImportRow = {
  medicine_name: string;
  category?: string;
  generic_name?: string;
  brand_name?: string;
  supplier_name?: string;
  stock?: number;
  expiry_date?: string;
  mrp?: number;
  selling_price?: number;
  purchase_price?: number;
  schedule?: string;
  batch_no?: string;
  resolution?: 'new' | 'skip' | 'new_batch';
};

type BillItem = {
  key: string;
  product: ProductRow;
  qty: number;
  saleUnit: UnitType;
  batch: NormalizedBatch | null;
  availableBatches: NormalizedBatch[];
};

const SCHEDULES = ['OTC', 'H', 'H1', 'X'];

const emptyForm = (): ProductForm => ({
  medicine_name: '',
  generic_name: '',
  brand_name: '',
  supplier_name: '',
  category: 'General',
  stock: 0,
  batch_no: generateDefaultBatchId(),
  expiry_date: '',
  selling_price: 0,
  purchase_price: 0,
  mrp: 0,
  hsn_code: '',
  gst_percentage: 12,
  is_schedule_h: false,
  is_schedule_h1: false,
  location_rack: '',
  min_stock_alert: 10,
  schedule: 'OTC',
  prescription_required: false,
  packaging: {
    base_uom: 'unit',
    levels: [
      { level: 'unit', label: 'Unit', to_base_units: 1 },
      { level: 'strip', label: 'Strip', to_base_units: 10 },
      { level: 'box', label: 'Box', to_base_units: 100 },
    ],
  },
  barcode: '',
  product_image_url: '',
});

// --- Date helpers ---
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // If it's DD/MM/YYYY
  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  // If it's MM/YYYY
  const my = dateStr.match(/^(\d{2})\/(\d{4})$/);
  if (my) {
    const lastDay = new Date(Number(my[2]), Number(my[1]), 0).getDate();
    return `${my[2]}-${my[1]}-${String(lastDay).padStart(2, '0')}`;
  }
  return dateStr;
};

const displayExpiry = (d?: string) => {
  if (!d || d === '-') return '-';
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`; // Display as DD/MM/YYYY
  return d;
};

const generateDefaultBatchId = () => `BAT-${Math.floor(1000 + Math.random() * 9000)}`;

// --- CSV parser ---
const parseCSV = (text: string): ImportRow[] => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return {
      medicine_name: obj.medicine_name || '',
      category: obj.category || 'General',
      generic_name: obj.generic_name || '',
      brand_name: obj.brand_name || '',
      supplier_name: obj.supplier_name || '',
      stock: Number(obj.current_stock || obj.stock || 0),
      expiry_date: obj.expiry_date || '',
      mrp: Number(obj.mrp || 0),
      selling_price: Number(obj.selling_price || 0),
      purchase_price: Number(obj.purchase_price || 0),
      schedule: obj.schedule || 'OTC',
      batch_no: obj.batch_number || obj.batch_no || '',
      resolution: 'new' as const,
    };
  }).filter(r => r.medicine_name.trim());
};

const ProductTable = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expiry'>('all');
  const [selected, setSelected] = useState<Record<string, BillItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [billingSaving, setBillingSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [batchesByProduct, setBatchesByProduct] = useState<Record<string, any[]>>({});
  const [loadedBatchesByProduct, setLoadedBatchesByProduct] = useState<Record<string, boolean>>({});
  const [loadingBatchesId, setLoadingBatchesId] = useState<string | null>(null);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchDialogProductId, setBatchDialogProductId] = useState<string | null>(null);
  const [batchDialogProduct, setBatchDialogProduct] = useState<ProductRow | null>(null);
  const [batchForm, setBatchForm] = useState({
    batch_no: '',
    expiry_date: '',
    quantity: 0,
    supplier_name: '',
    purchase_rate_per_base: '',
    mrp_per_base: '',
  });
  const [batchSaving, setBatchSaving] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importPreviewing, setImportPreviewing] = useState(false);
  const [importSaving, setImportSaving] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastBill, setLastBill] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const qtyAutoSelectUsed = useRef<Record<string, boolean>>({});

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openProductDrawer();
      } else if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCartOpen(true);
      } else if (e.key === 'Escape') {
        setDrawerOpen(false);
        setCartOpen(false);
        setBatchDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  const resolveName = (p: ProductRow) => p['Medicine Name'] || p.medicine_name || '';
  const resolveStrength = (p: ProductRow) => p.strength || p['Strength'] || '';
  const resolveCompany = (p: ProductRow) => p.manufacturer || p['Manufacturer'] || p.brand_name || p['Brand Name'] || p.supplier_name || p['Supplier Name'] || '';
  const isWeakName = (value: string) => !value || /^(medicine|product|item|unknown|na|n\/a)$/i.test(value.trim());
  const resolveMedicineTitle = (p: ProductRow) => {
    const base = resolveName(p).trim();
    const strength = resolveStrength(p).trim();
    const generic = (p.generic_name || p['Generic Name'] || '').trim();
    const company = resolveCompany(p).trim();
    const candidate = !isWeakName(base) ? base : generic || '';
    if (candidate && strength && !candidate.toLowerCase().includes(strength.toLowerCase())) return `${candidate} ${strength}`;
    if (candidate) return candidate;
    if (strength) return strength;
    return company || 'Medicine';
  };
  const resolveProductKey = (p: ProductRow) => String(p.id || p._id || p.product_id || p['Product ID'] || p.computedId || p.barcodes?.[0]?.code || '');
  const parseExpiryTimestamp = (value?: string) => {
    if (!value) return Number.POSITIVE_INFINITY;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
  };
  const normalizeBatch = (batch: Record<string, any>, index = 0): NormalizedBatch => {
    const batchNo = String(batch.batch_no || batch.batch_number || batch['Batch Number'] || batch.batch || '').trim();
    const expiryDate = String(batch.expiry_date || batch['Expiry Date'] || batch.expiry || '').trim();
    const availableBaseUnits = Number(batch.available_base_units ?? batch['Current Stock'] ?? batch.stock ?? batch.Stock ?? 0);
    const purchasePrice = Number(batch.purchase_rate_per_base ?? batch.purchase_price ?? batch['Purchase Price'] ?? 0);
    const sellingPrice = Number(batch.selling_price ?? batch['Selling Price'] ?? batch.mrp_per_base ?? batch.mrp ?? batch['MRP'] ?? 0);
    const supplierName = String(batch.supplier_name || batch['Supplier Name'] || '').trim();
    const unitType = String(batch.unit_type || batch.base_uom || batch['Unit Type'] || '').trim();
    const key = String(batch.id || batch._id || batch.batch_id || `${batchNo || 'batch'}-${expiryDate || 'expiry'}-${index}`);
    return {
      key,
      batchNo: batchNo || `Batch ${index + 1}`,
      expiryDate,
      availableBaseUnits,
      purchasePrice,
      sellingPrice,
      supplierName,
      unitType,
      raw: batch,
    };
  };
  const getBatchList = useCallback((product: ProductRow, productId: string) => {
    const loaded = batchesByProduct[productId] || [];
    const productBatch = product.batch_no || product['Batch Number'] ? [product] : [];
    const next = [...loaded, ...productBatch];
    return next.map((batch, index) => normalizeBatch(batch, index)).sort((a, b) => {
      const expiryDiff = parseExpiryTimestamp(a.expiryDate) - parseExpiryTimestamp(b.expiryDate);
      if (expiryDiff !== 0) return expiryDiff;
      return a.batchNo.localeCompare(b.batchNo);
    });
  }, [batchesByProduct]);
  const getRowKey = (p: ProductRow, index: number) => {
    const stable = resolveProductKey(p);
    if (stable) return stable;
    const batch = p.batch_no || p['Batch Number'] || 'nobatch';
    const expiry = p.expiry_date || p['Expiry Date'] || 'noexpiry';
    return `${resolveMedicineTitle(p)}|${batch}|${expiry}|${index}`;
  };
  const resolveStock = (p: ProductRow, productId = '') => {
    const batches = productId ? getBatchList(p, productId) : [];
    if (batches.length > 0) {
      return batches.reduce((sum, batch) => sum + Number(batch.availableBaseUnits || 0), 0);
    }
    return Number(p.stock_summary?.available_base_units ?? p['Current Stock'] ?? p.stock ?? p.Stock ?? 0);
  };
  const resolvePrice = (p: ProductRow, productId = '') => {
    if (productId) {
      const batches = getBatchList(p, productId).filter(b => b.availableBaseUnits > 0);
      if (batches.length > 0) return batches[0].sellingPrice;
    }
    return Number(p.selling_price ?? p['Selling Price'] ?? p.unit_price ?? p['Unit Price'] ?? p.mrp ?? p['MRP'] ?? p.purchase_price ?? p['Purchase Price'] ?? 0);
  };
  const resolvePurchasePrice = (p: ProductRow, productId = '') => {
    if (productId) {
      const batches = getBatchList(p, productId).filter(b => b.availableBaseUnits > 0);
      if (batches.length > 0) return batches[0].purchasePrice;
    }
    return Number(p.purchase_price ?? p['Purchase Price'] ?? 0);
  };
  const resolveExpiry = (p: ProductRow, productId = '') => {
    const batches = productId ? getBatchList(p, productId) : [];
    return batches[0]?.expiryDate || p.expiry_date || p['Expiry Date'] || '';
  };
  const getExpiryDays = (p: ProductRow, productId = '') => {
    const expiry = resolveExpiry(p, productId);
    if (!expiry) return null;
    const diff = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Number.isNaN(diff) ? null : diff;
  };
  const resolveUnitLabel = (p: ProductRow) => {
    const base = (p.base_uom || p.unit_type || p.packaging?.base_uom || '').toLowerCase();
    if (base === 'bottle') return 'Bottle';
    if (base === 'vial') return 'Vial';
    return p.packaging?.levels?.find((item) => item.level === 'unit')?.label || 'Unit';
  };
  const pluralizeLabel = (label: string, count: number) => {
    const next = label || 'Unit';
    if (count === 1) return next;
    return next.toLowerCase().endsWith('s') ? next : `${next}s`;
  };
  const formatPackAmount = (baseUnits: number, p: ProductRow) => {
    const levels = [...(p.packaging?.levels || [])].sort((a, b) => b.to_base_units - a.to_base_units);
    if (!levels.length) return `${baseUnits.toLocaleString()} ${pluralizeLabel('Unit', baseUnits)}`;
    let remaining = Math.max(baseUnits, 0);
    const parts: string[] = [];
    for (const level of levels) {
      if (level.level === 'unit') continue;
      const count = Math.floor(remaining / level.to_base_units);
      if (count > 0) {
        parts.push(`${count.toLocaleString()} ${pluralizeLabel(level.label || level.level, count)}`);
        remaining -= count * level.to_base_units;
      }
    }
    if (remaining > 0 || parts.length === 0) {
      const unitLabel = resolveUnitLabel(p);
      parts.push(`${remaining.toLocaleString()} ${pluralizeLabel(unitLabel, remaining)}`);
    }
    return parts.join(' + ');
  };
  const formatStockLabel = (p: ProductRow, productId = '') => formatPackAmount(resolveStock(p, productId), p);
  const getPackSize = (p: ProductRow, unit: UnitType) => {
    if (unit === 'unit') return 1;
    return Number(p.packaging?.levels?.find((item) => item.level === unit)?.to_base_units || 1);
  };
  const getSaleUnitLabel = (p: ProductRow, unit: UnitType) => {
    if (unit === 'unit') return resolveUnitLabel(p);
    return p.packaging?.levels?.find((item) => item.level === unit)?.label || (unit === 'strip' ? 'Strip' : 'Box');
  };
  const getSaleUnitOptions = (p: ProductRow): UnitType[] => {
    const options: UnitType[] = ['unit'];
    if (getPackSize(p, 'strip') > 1) options.push('strip');
    if (getPackSize(p, 'box') > getPackSize(p, 'strip')) options.push('box');
    return options;
  };
  const getExpiryBadge = (days: number | null) => {
    if (days === null) return null;
    if (days < 0) return { label: 'Expired', className: 'border border-red-100 bg-red-50 text-red-700' };
    if (days <= 30) return { label: 'Expiring soon', className: 'border border-amber-100 bg-amber-50 text-amber-700' };
    return null;
  };
  const resolveBillBasePrice = (item: BillItem) => Number(item.batch?.sellingPrice ?? resolvePrice(item.product));
  const resolveBillPrice = (item: BillItem) => resolveBillBasePrice(item) * getPackSize(item.product, item.saleUnit);
  const getBillAvailableBaseQty = (item: BillItem) => Number(item.batch?.availableBaseUnits ?? item.product.computedStock ?? resolveStock(item.product, item.key) ?? 0);
  const getBillAvailableQty = (item: BillItem) => Math.floor(getBillAvailableBaseQty(item) / getPackSize(item.product, item.saleUnit));
  const getBillBaseQty = (item: BillItem) => item.qty * getPackSize(item.product, item.saleUnit);
  const getQtyDraft = (key: string, qty: number) => qtyDrafts[key] ?? String(qty);
  const handleQtyFocus = (key: string, currentValue: string, input: HTMLInputElement) => {
    if (!qtyAutoSelectUsed.current[key] && currentValue.length > 0) {
      input.select();
      qtyAutoSelectUsed.current[key] = true;
    }
  };
  const handleQtyBlur = (key: string, currentValue: string) => {
    if (currentValue.trim() === '') {
      setQtyDrafts((prev) => ({ ...prev, [key]: '0' }));
      setBillQty(key, 0);
    }
    qtyAutoSelectUsed.current[key] = false;
  };

  const loadProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetchProducts(1, 1000, '');
      setProducts((res.data || []) as ProductRow[]);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const processedProducts = useMemo(() => {
    return products.map((p, index) => {
      const id = getRowKey(p, index);
      const batches = getBatchList(p, id);
      const mainStock = Number(p.stock_summary?.available_base_units ?? p['Current Stock'] ?? p.stock ?? p.Stock ?? 0);
      const batchStock = batches.reduce((sum, b) => sum + Number(b.availableBaseUnits || 0), 0);
      const stock = Math.max(mainStock, batchStock);

      const availableBatches = batches.filter(b => b.availableBaseUnits > 0);
      const displayPrice = availableBatches.length > 0
        ? availableBatches[0].sellingPrice
        : Number(p.selling_price ?? p['Selling Price'] ?? p.unit_price ?? p['Unit Price'] ?? p.mrp ?? p['MRP'] ?? 0);

      const purchasePrice = availableBatches.length > 0
        ? availableBatches[0].purchasePrice
        : Number(p.purchase_price ?? p['Purchase Price'] ?? 0);

      const earliestExpiry = availableBatches[0]?.expiryDate || p.expiry_date || p['Expiry Date'] || '-';
      const expiryDays = earliestExpiry !== '-' ? Math.ceil((new Date(earliestExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

      return {
        ...p,
        computedId: id,
        computedStock: stock,
        computedPrice: displayPrice,
        computedPurchasePrice: purchasePrice,
        computedEarliestExpiry: earliestExpiry,
        computedExpiryDays: expiryDays,
        computedBatches: batches,
        computedAvailableBatches: availableBatches,
        // Professional Pharmacy Fields
        hsn_code: p.hsn_code || '',
        gst_percentage: Number(p.gst_percentage || 0),
        is_schedule_h: Boolean(p.is_schedule_h || false),
        is_schedule_h1: Boolean(p.is_schedule_h1 || false),
        location_rack: p.location_rack || '',
        min_stock_alert: Number(p.min_stock_alert || 10)
      };
    });
  }, [products, batchesByProduct, getBatchList]);

  const filteredProducts = useMemo(() => {
    // Smart search: split by whitespace and match all terms
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

    let next = processedProducts.filter((p) => {
      // Apply filters first (Low Stock / Expiry)
      if (filter === 'low') {
        if (!(p.computedStock > 0 && p.computedStock < 20)) return false;
      } else if (filter === 'expiry') {
        if (!(p.computedExpiryDays !== null && p.computedExpiryDays >= 0 && p.computedExpiryDays <= 90)) return false;
      }

      // Smart Search Logic
      if (searchTerms.length > 0) {
        const title = resolveMedicineTitle(p).toLowerCase();
        const generic = (p.generic_name || p['Generic Name'] || '').toLowerCase();
        const brand = (p.brand_name || p['Brand Name'] || '').toLowerCase();
        const manufacturer = (p.manufacturer || p['Manufacturer'] || '').toLowerCase();
        const category = (p.category || p['Category'] || '').toLowerCase();
        const batch = (p.batch_no || p['Batch Number'] || '').toLowerCase();
        const barcodes = (p.barcodes || []).map(b => b.code.toLowerCase());

        // Check if every search term matches at least one field
        return searchTerms.every(term =>
          title.includes(term) ||
          generic.includes(term) ||
          brand.includes(term) ||
          manufacturer.includes(term) ||
          category.includes(term) ||
          batch.includes(term) ||
          barcodes.some(bc => bc.includes(term))
        );
      }

      return true;
    });

    if (filter === 'expiry') {
      next = [...next].sort((a, b) => (a.computedExpiryDays ?? 9999) - (b.computedExpiryDays ?? 9999));
    }
    return next;
  }, [processedProducts, filter, search]);

  // Barcode Auto-Add Logic
  useEffect(() => {
    if (search.length >= 8) { // Typical barcode length
        const match = processedProducts.find(p => 
            (p.barcodes || []).some(bc => bc.code === search) || 
            (p.id === search || p._id === search)
        );
        if (match) {
            const key = resolveProductKey(match);
            if (key && !selected[key]) {
                addBillItem(match, key);
                setSearch(''); // Clear search for next scan
                setMessage(`Scanned: ${resolveMedicineTitle(match)}`);
                setTimeout(() => setMessage(null), 2000);
            }
        }
    }
  }, [search, processedProducts]);

  const selectedItems = Object.values(selected);
  const selectedCount = selectedItems.length;
  const billTotal = selectedItems.reduce((sum, item) => sum + item.qty * resolveBillPrice(item), 0);

  const loadBatchesForProduct = async (productId: string, force = false) => {
    if (!force && loadedBatchesByProduct[productId]) return batchesByProduct[productId] || [];
    setLoadingBatchesId(productId);
    try {
      const response = await fetchProductBatches(productId);
      const batches = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setBatchesByProduct((prev) => ({ ...prev, [productId]: batches }));
      setLoadedBatchesByProduct((prev) => ({ ...prev, [productId]: true }));
      return batches;
    } catch (error) {
      console.error(error);
      setLoadedBatchesByProduct((prev) => ({ ...prev, [productId]: false }));
      return [];
    } finally {
      setLoadingBatchesId((current) => (current === productId ? null : current));
    }
  };

  const refreshBatchesForProduct = (productId: string) => loadBatchesForProduct(productId, true);

  const toggleExpandedProduct = async (productId: string) => {
    setExpandedProductId((current) => (current === productId ? null : productId));
    await loadBatchesForProduct(productId);
  };
  const openBatchDialog = (product: ProductRow, productId: string) => {
    setBatchDialogProduct(product);
    setBatchDialogProductId(productId);
    setBatchForm({
      batch_no: generateDefaultBatchId(),
      expiry_date: formatDate(product.expiry_date || product['Expiry Date']),
      quantity: 0,
      supplier_name: resolveCompany(product) || '',
      purchase_rate_per_base: '',
      mrp_per_base: String(resolvePrice(product) || ''),
    });
    setBatchDialogOpen(true);
  };
  const closeBatchDialog = () => {
    setBatchDialogOpen(false);
    setBatchDialogProductId(null);
    setBatchDialogProduct(null);
  };
  const addBillItem = async (product: ProductRow, key: string) => {
    if (selected[key]) {
      setBillQty(key, selected[key].qty + 1);
      return;
    }
    const availableBaseQty = Number(product.computedStock ?? resolveStock(product, key) ?? 0);
    if (availableBaseQty <= 0) {
      setMessage(`${resolveMedicineTitle(product)} is out of stock.`);
      return;
    }
    setSelected((prev) => ({
      ...prev,
      [key]: {
        key,
        product,
        qty: 1,
        saleUnit: 'unit',
        batch: null,
        availableBatches: [],
      },
    }));
    setQtyDrafts((prev) => ({ ...prev, [key]: '1' }));
    qtyAutoSelectUsed.current[key] = false;
  };

  const setBillQty = (productId: string, qty: number) => {
    setSelected((prev) => {
      if (!prev[productId]) return prev;
      const available = getBillAvailableQty(prev[productId]);
      const nextQty = Math.min(Math.max(0, qty), Math.max(available, 0));
      setQtyDrafts((drafts) => ({ ...drafts, [productId]: String(nextQty) }));
      if (qty > available) {
        setMessage(`Only ${available} unit${available === 1 ? '' : 's'} available for ${resolveMedicineTitle(prev[productId].product)}.`);
      }
      return { ...prev, [productId]: { ...prev[productId], qty: nextQty } };
    });
  };

  const removeBillItem = (productId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setQtyDrafts((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    delete qtyAutoSelectUsed.current[productId];
  };

  const updateBillBatch = (itemKey: string, batchKey: string) => {
    setSelected((prev) => {
      const item = prev[itemKey];
      if (!item) return prev;
      const nextBatch = item.availableBatches.find((batch) => batch.key === batchKey) || null;
      const nextAvailable = Math.floor(Number(nextBatch?.availableBaseUnits ?? resolveStock(item.product, item.key) ?? 0) / getPackSize(item.product, item.saleUnit));
      const nextQty = Math.min(item.qty, nextAvailable);
      setQtyDrafts((drafts) => ({ ...drafts, [itemKey]: String(nextQty) }));
      return {
        ...prev,
        [itemKey]: {
          ...item,
          batch: nextBatch,
          qty: nextQty,
        },
      };
    });
  };

  const updateBillSaleUnit = (itemKey: string, saleUnit: UnitType) => {
    setSelected((prev) => {
      const item = prev[itemKey];
      if (!item) return prev;
      const nextItem = { ...item, saleUnit };
      const nextAvailable = Math.floor(getBillAvailableBaseQty(nextItem) / getPackSize(nextItem.product, saleUnit));
      const nextQty = Math.min(Math.max(item.qty, 1), Math.max(nextAvailable, 0));
      setQtyDrafts((drafts) => ({ ...drafts, [itemKey]: String(nextQty) }));
      return { ...prev, [itemKey]: { ...nextItem, qty: nextQty } };
    });
  };

  const confirmRemoveBillItem = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      removeBillItem(productId);
    }
  };

  const confirmDeleteProduct = async (product: ProductRow, productId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteProduct(productId || resolveProductKey(product));
      setSelected((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setQtyDrafts((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      await loadProducts();
      setMessage('Product deleted successfully');
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Could not delete product');
    }
  };

  const resetForm = () => setForm(emptyForm());
  const closeProductDrawer = () => {
    setDrawerOpen(false);
    setEditingProductId(null);
    resetForm();
  };
  const openProductDrawer = (product?: ProductRow, productId?: string) => {
    if (product) {
      setEditingProductId(productId || resolveProductKey(product) || null);
      setForm({
        medicine_name: resolveName(product) || '',
        generic_name: product.generic_name || product['Generic Name'] || '',
        brand_name: product.brand_name || product['Brand Name'] || '',
        supplier_name: product.supplier_name || product['Supplier Name'] || '',
        category: product.category || product.Category || 'General',
        stock: Number(product.stock_summary?.available_base_units ?? product['Current Stock'] ?? 0),
        batch_no: product.batch_no || product['Batch Number'] || generateDefaultBatchId(),
        expiry_date: formatDate(product.expiry_date || product['Expiry Date']),
        selling_price: Number(product.selling_price ?? product['Selling Price'] ?? 0),
        purchase_price: Number(product.purchase_price ?? product['Purchase Price'] ?? 0),
        mrp: Number(product.mrp ?? product['MRP'] ?? 0),
        schedule: product.schedule || product['Schedule'] || 'OTC',
        prescription_required: Boolean(product.prescription_required ?? product['Prescription Required'] ?? false),
        packaging: {
          base_uom: product.base_uom || product.packaging?.base_uom || 'unit',
          levels: [
            { level: 'unit', label: product.packaging?.levels?.find(i => i.level === 'unit')?.label || 'Unit', to_base_units: Number(product.packaging?.levels?.find(i => i.level === 'unit')?.to_base_units || 1) },
            { level: 'strip', label: product.packaging?.levels?.find(i => i.level === 'strip')?.label || 'Strip', to_base_units: Number(product.packaging?.levels?.find(i => i.level === 'strip')?.to_base_units || 10) },
            { level: 'box', label: product.packaging?.levels?.find(i => i.level === 'box')?.label || 'Box', to_base_units: Number(product.packaging?.levels?.find(i => i.level === 'box')?.to_base_units || 100) },
          ],
        },
        barcode: product.barcodes?.find(i => i.is_primary)?.code || product.barcodes?.[0]?.code || '',
        product_image_url: (product as any).product_image_url || '',
        hsn_code: product.hsn_code || '',
        gst_percentage: product.gst_percentage || 12,
        is_schedule_h: product.is_schedule_h || false,
        is_schedule_h1: product.is_schedule_h1 || false,
        location_rack: product.location_rack || '',
        min_stock_alert: product.min_stock_alert || 10,
      });
    } else {
      setEditingProductId(null);
      resetForm();
    }
    setDrawerOpen(true);
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();

    if (!editingProductId && products.some(p => resolveMedicineTitle(p).trim().toLowerCase() === form.medicine_name.trim().toLowerCase())) {
      setMessage(`Medicine "${form.medicine_name}" already exists in the system.`);
      setSaving(false);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const isEditing = Boolean(editingProductId);
      const payload = {
        medicine_name: form.medicine_name,
        generic_name: form.generic_name,
        brand_name: form.brand_name,
        supplier_name: form.supplier_name,
        category: form.category,
        stock: form.stock,
        batch_no: form.batch_no,
        expiry_date: form.expiry_date,
        selling_price: form.selling_price,
        purchase_price: form.purchase_price,
        mrp: form.mrp,
        schedule: form.schedule,
        prescription_required: form.prescription_required,
        packaging: form.packaging,
        base_uom: form.packaging.base_uom,
        barcodes: form.barcode ? [{ code: form.barcode, level: 'unit', is_primary: true }] : undefined,
        product_image_url: form.product_image_url,
        hsn_code: form.hsn_code,
        gst_percentage: form.gst_percentage,
        is_schedule_h: form.is_schedule_h,
        is_schedule_h1: form.is_schedule_h1,
        location_rack: form.location_rack,
        min_stock_alert: form.min_stock_alert,
      };
      if (isEditing) {
        await updateProduct(editingProductId!, payload);
      } else {
        await addProduct(payload);
        if (form.medicine_name) setRecentlyAdded(prev => [form.medicine_name, ...prev].slice(0, 8));
      }
      closeProductDrawer();
      setMessage(isEditing ? 'Product updated successfully' : 'Product added successfully');
      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const saveBatch = async (event: FormEvent) => {
    event.preventDefault();
    if (!batchDialogProduct || !batchDialogProductId) return;
    setBatchSaving(true);
    setMessage(null);
    try {
      const payload = {
        action: 'purchase_in',
        reason_code: 'batch_add',
        reference_type: 'batch_add',
        reference_id: batchDialogProductId,
        lines: [
          {
            product_id: batchDialogProductId,
            batch_no: batchForm.batch_no.trim() || undefined,
            expiry_date: batchForm.expiry_date || undefined,
            qty: { unit: Number(batchForm.quantity) || 0, strip: 0, box: 0 },
            supplier_name: batchForm.supplier_name.trim() || undefined,
            purchase_rate_per_base: batchForm.purchase_rate_per_base ? Number(batchForm.purchase_rate_per_base) : undefined,
            mrp_per_base: batchForm.mrp_per_base ? Number(batchForm.mrp_per_base) : undefined,
            unit_type: batchDialogProduct.base_uom || batchDialogProduct.unit_type || batchDialogProduct.packaging?.base_uom || 'unit',
          },
        ],
      };
      await applyStockActions(payload, `batch-add:${batchDialogProductId}:${batchForm.batch_no || Date.now()}`);
      setMessage('Batch added successfully');
      closeBatchDialog();
      await loadProducts();
      await refreshBatchesForProduct(batchDialogProductId);
      if (expandedProductId && expandedProductId !== batchDialogProductId) {
        await refreshBatchesForProduct(expandedProductId);
      }
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Could not add batch');
    } finally {
      setBatchSaving(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (!rows.length) { setMessage('No valid rows found in file'); return; }
    setImportPreviewing(true);
    try {
      const preview = await bulkImportPreview(rows.map(r => ({ medicine_name: r.medicine_name, category: r.category, generic_name: r.generic_name, brand_name: r.brand_name, supplier_name: r.supplier_name, stock: r.stock, expiry_date: r.expiry_date, mrp: r.mrp, selling_price: r.selling_price, purchase_price: r.purchase_price, schedule: r.schedule, batch_no: r.batch_no })));
      const dupes = (preview.duplicates || []).map((d: any) => d.medicine_name);
      const tagged = rows.map(r => ({ ...r, resolution: (dupes.includes(r.medicine_name) ? 'skip' : 'new') as 'new' | 'skip' | 'new_batch' }));
      setImportRows(tagged);
      setImportDialogOpen(true);
    } catch { setMessage('Could not preview import'); } finally { setImportPreviewing(false); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const commitImport = async () => {
    const toAdd = importRows.filter(r => r.resolution !== 'skip');
    if (!toAdd.length) { setImportDialogOpen(false); return; }
    setImportSaving(true);
    try {
      const res = await bulkAddProducts(toAdd.map(r => ({ medicine_name: r.medicine_name, category: r.category, generic_name: r.generic_name, brand_name: r.brand_name, supplier_name: r.supplier_name, stock: r.stock, expiry_date: r.expiry_date, mrp: r.mrp, selling_price: r.selling_price, purchase_price: r.purchase_price, schedule: r.schedule, batch_no: r.batch_no })));
      setMessage(`Import done: ${res.added} added, ${(res.skipped || []).length} skipped.`);
      setImportDialogOpen(false);
      setImportRows([]);
      await loadProducts();
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Import failed'); } finally { setImportSaving(false); }
  };

  const createBill = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please add medicines to the bill first');
      return;
    }
    if (selectedItems.some((item) => item.qty <= 0)) {
      setMessage('Please keep every bill quantity above zero before confirming the sale.');
      return;
    }
    setBillingSaving(true);
    setMessage(null);
    try {
      const billId = `bill-${Date.now()}`;
      const payload = {
        action: 'sale_out',
        reason_code: 'counter_sale',
        reference_type: 'bill',
        reference_id: billId,
        lines: selectedItems.map((item) => ({
          product_id: resolveProductKey(item.product) || item.key,
          batch_no: item.batch?.batchNo || undefined,
          qty: {
            unit: item.saleUnit === 'unit' ? item.qty : 0,
            strip: item.saleUnit === 'strip' ? item.qty : 0,
            box: item.saleUnit === 'box' ? item.qty : 0,
          },
          reason_code: 'counter_sale',
        })),
      };
      const stockResult = await applyStockActions(payload, `counter-sale:${billId}`);
      
      const billData = {
        billId: payload.reference_id,
        items: selectedItems.map(item => {
          const price = resolveBillPrice(item);
          const gstPercent = Number(item.product.gst_percentage || 12);
          const basePrice = price / (1 + gstPercent / 100);
          const gstAmount = price - basePrice;
          
          return {
            name: resolveMedicineTitle(item.product),
            hsn: item.product.hsn_code || '3004',
            qty: item.qty,
            price: price,
            basePrice: basePrice,
            gstPercent: gstPercent,
            gstAmount: gstAmount * item.qty,
            total: item.qty * price,
            batchNo: item.batch?.batchNo || null,
            saleUnit: getSaleUnitLabel(item.product, item.saleUnit),
            baseQty: getBillBaseQty(item),
          };
        }),
        total: billTotal,
        taxTotal: selectedItems.reduce((sum, item) => {
          const price = resolveBillPrice(item);
          const gstPercent = Number(item.product.gst_percentage || 12);
          const basePrice = price / (1 + gstPercent / 100);
          return sum + (price - basePrice) * item.qty;
        }, 0),
        date: new Date().toLocaleString(),
        stockUpdated: stockResult?.status === 'ok',
        stockMovements: Array.isArray(stockResult?.results) ? stockResult.results.length : selectedItems.length,
      };
      
      setLastBill(billData);
      setShowReceipt(true);
      setCartOpen(false);
      setSelected({});
      setQtyDrafts({});
      await loadProducts(true); 
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Could not create bill');
    } finally {
      setBillingSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openProductDrawer()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0a2e2a] px-3.5 py-2.5 text-sm font-semibold text-[#bbed3b] shadow-sm transition-all hover:bg-[#0f423d] active:scale-95 active:translate-y-0.5"
            >
              <Plus size={16} /> Add Product
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importPreviewing}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:bg-violet-100 active:scale-95 active:translate-y-0.5"
            >
              {importPreviewing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Import CSV
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleImportFile} />
            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-95 active:translate-y-0.5"
            >
              <ShoppingCart size={16} /> Cart {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
            <button
              onClick={() => { setSelected({}); setQtyDrafts({}); }}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95 active:translate-y-0.5"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {[
              { key: 'all', label: 'All' },
              { key: 'low', label: 'Low Stock' },
              { key: 'expiry', label: 'Expiry' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition ${filter === item.key
                  ? 'bg-[#0a2e2a] text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="relative group">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 transition-colors group-focus-within:text-emerald-400" size={17} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines, salt, brand, or barcode (Alt+S)"
              className="w-full rounded-[20px] border border-gray-200 bg-white py-3.5 pl-11 pr-12 text-[15px] text-gray-900 shadow-[0_2px_4px_rgba(0,0,0,0.02)] outline-none transition-all placeholder:text-gray-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-90"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <AlertCircle size={16} />
            {message}
          </div>
        )}

        {selectedItems.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Selected Medicines</p>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0a2e2a] shadow-sm ring-1 ring-emerald-100"
              >
                Review Bill
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedItems.map((item) => (
                <div key={item.key} className="flex min-w-[220px] items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-emerald-100">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-[#061412]">{resolveMedicineTitle(item.product)}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-gray-400">
                      {item.qty} {pluralizeLabel(getSaleUnitLabel(item.product, item.saleUnit), item.qty)} &middot; {getBillBaseQty(item)} base units
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBillItem(item.key)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500"
                    title="Remove from bill"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Medicines</h3>
            <p className="text-sm text-gray-500">Tap a row to add it to the cart.</p>
          </div>
          <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">{filteredProducts.length} shown</span>
        </div>

        {recentlyAdded.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Recently added:</span>
            {recentlyAdded.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Check size={10} /> {name}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-emerald-100 bg-emerald-50/20 py-20 text-center px-6">
              <div className="relative mb-4">
                <Package size={42} className="text-emerald-200" />
                <Search size={20} className="absolute -bottom-1 -right-1 text-emerald-500" />
              </div>
              <h4 className="text-lg font-bold text-[#0a2e2a]">No medicines found</h4>
              <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">
                We couldn't find anything matching "<span className="font-semibold text-emerald-700">{search}</span>".
                Try searching by salt name, brand, or barcode.
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition-all hover:bg-emerald-50 active:scale-95"
                >
                  <X size={14} /> Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const id = product.computedId;
              const stock = product.computedStock;
              const price = product.computedPrice;
              const buyPrice = product.computedPurchasePrice;
              const earliestExpiry = product.computedEarliestExpiry;
              const expiryDays = product.computedExpiryDays;
              const expiryBadge = getExpiryBadge(expiryDays);
              const batchLabel = product.batch_no || product['Batch Number'] ? `Batch ${product.batch_no || product['Batch Number']}` : '+ Add Batch';
              return (
                <article
                  key={id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, input, select')) return;
                    addBillItem(product, id);
                  }}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 px-3 py-2 cursor-pointer ${selected[id]
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-[0_8px_30px_rgba(5,150,105,0.15)] ring-1 ring-emerald-600/20'
                    : 'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-md active:border-emerald-300'
                    }`}
                >
                  {selected[id] && (
                    <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                      <div className="absolute top-2 right-[-20px] rotate-45 bg-emerald-600 px-6 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
                        Selected
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); addBillItem(product, id); }}
                          className={`group/img overflow-hidden relative grid h-[52px] w-[52px] place-items-center rounded-xl border transition-all active:scale-95 ${selected[id]
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-inner'
                            : 'border-gray-200 bg-gray-50 hover:border-emerald-200 hover:bg-white'
                            }`}
                        >
                          {(product as any).product_image_url ? (
                            <img
                              src={(product as any).product_image_url}
                              alt=""
                              className={`h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110 ${selected[id] ? 'opacity-40' : ''}`}
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-gray-300 transition-colors group-hover/img:text-emerald-400">
                              <Package size={24} strokeWidth={1.5} />
                              <span className="text-[8px] font-black uppercase tracking-tighter">No Image</span>
                            </div>
                          )}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-[17px] font-black leading-tight text-[#02100e] tracking-tight">
                            {resolveMedicineTitle(product)}
                          </h4>
                          {resolveStrength(product) ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              {resolveStrength(product)}
                            </span>
                          ) : null}
                        </div>

                        {resolveCompany(product) ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-gray-500">{resolveCompany(product)}</span>
                            {product.is_schedule_h && <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[8px] font-black text-red-600 ring-1 ring-red-200">Sch H</span>}
                            {product.is_schedule_h1 && <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[8px] font-black text-white">Sch H1</span>}
                          </div>
                        ) : null}

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-gray-600">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openBatchDialog(product, id); }}
                            className={`group flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-tight transition-all active:scale-95 ${product.batch_no || product['Batch Number']
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 ring-1 ring-rose-200/50'
                              }`}
                          >
                            {batchLabel}
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 font-semibold text-gray-600 ring-1 ring-gray-200/50">
                              <Package size={11} className="text-gray-400" />
                              Stock: {formatPackAmount(stock, product)}
                            </span>

                            {expiryBadge && (
                              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ring-1 ${expiryBadge.className.includes('red') ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                                <AlertTriangle size={11} />
                                {expiryBadge.label}
                              </span>
                            )}

                            {stock < 20 && stock > 0 && (
                              <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 font-bold text-orange-700 ring-1 ring-orange-200">
                                <TrendingUp size={11} className="rotate-180" />
                                Low
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-[10px] font-medium text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            Exp: {displayExpiry(earliestExpiry)}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>Category: {product.category || 'OTC'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
                      <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-gray-200 bg-white px-2.5 py-1.5 transition-colors hover:border-emerald-200">
                        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600">Sale Price</p>
                        <p className="text-xs font-bold text-gray-900">₹{price.toFixed(2)}</p>
                        {product.gst_percentage > 0 && <p className="text-[7px] font-medium text-gray-400">Inc. {product.gst_percentage}% GST</p>}
                      </div>
                      <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-gray-100 bg-gray-50/50 px-2.5 py-1.5">
                        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-gray-400">Buying</p>
                        <p className="text-xs font-medium text-gray-500">₹{buyPrice.toFixed(2)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openProductDrawer(product, id); }}
                        className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 transition-all hover:bg-gray-50 active:scale-90"
                        title="Edit product"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpandedProduct(id); }}
                        className={`grid h-8 w-8 place-items-center rounded-full border transition-all active:scale-90 ${
                          expandedProductId === id 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        title={expandedProductId === id ? 'Hide batches' : 'Show batches'}
                      >
                        <Package size={13} />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); addBillItem(product, id); }}
                        className={`grid h-8 w-8 place-items-center rounded-full transition-all active:scale-90 ${selected[id] ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#0a2e2a] text-[#bbed3b] hover:bg-[#0f423d]'
                          }`}
                        title={selected[id] ? 'Added to bill' : 'Add to bill'}
                      >
                        {selected[id] ? <Check size={13} /> : <Plus size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); confirmDeleteProduct(product, id); }}
                        className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                        title="Delete product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {selected[id] && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/30 p-2 ring-1 ring-emerald-500/10">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Bill Quantity</span>
                          <span className="text-xs font-bold text-emerald-900">
                            Line Total: ₹{(selected[id].qty * resolveBillPrice(selected[id])).toFixed(2)}
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {getSaleUnitOptions(product).map((unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateBillSaleUnit(id, unit);
                                }}
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                  selected[id].saleUnit === unit ? 'bg-[#0a2e2a] text-[#bbed3b]' : 'bg-white text-emerald-700 ring-1 ring-emerald-100'
                                }`}
                              >
                                {getSaleUnitLabel(product, unit)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBillQty(id, selected[id].qty - 1);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-md bg-white text-gray-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={qtyDrafts[id] ?? String(selected[id].qty)}
                          onChange={(e) => setBillQty(id, parseInt(e.target.value) || 0)}
                          className="h-8 w-12 border-none bg-transparent text-center text-sm font-bold text-gray-900 focus:outline-none focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBillQty(id, selected[id].qty + 1);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-md bg-white text-gray-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 active:scale-90"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBillItem(id);
                          }}
                          className="ml-1 grid h-8 w-8 place-items-center rounded-md bg-rose-100 text-rose-600 shadow-sm transition hover:bg-rose-200 active:scale-90"
                          title="Remove from bill"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {expandedProductId === id && (
                    <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Batch details</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openBatchDialog(product, id)}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                          >
                            <Plus size={12} />
                            Add New Batch
                          </button>
                          {loadingBatchesId === id ? <Loader2 className="animate-spin text-gray-400" size={14} /> : null}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {product.computedBatches.length > 0 ? (
                          (() => {
                            const filteredBatches = product.computedBatches
                              .filter(b => b.availableBaseUnits > 0)
                              .reduce((acc: any[], current) => {
                                const exists = acc.find(item => item.batchNo.trim().toLowerCase() === current.batchNo.trim().toLowerCase());
                                if (!exists) acc.push(current);
                                return acc;
                              }, []);

                            if (filteredBatches.length === 0) return (
                              <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-500">
                                All batches are out of stock.
                              </div>
                            );

                            return filteredBatches.map((batchItem, batchIndex: number) => {
                              const batchBadge = getExpiryBadge(
                                batchItem.expiryDate ? Math.ceil((new Date(batchItem.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
                              );
                              return (
                                <div key={`${batchItem.key}-${batchIndex}`} className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:border-gray-200">
                                  <div className="grid grid-cols-2 gap-y-2 text-[11px] md:grid-cols-4 md:gap-x-4 md:gap-y-0">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Batch No</span>
                                      <span className="font-bold text-gray-900">{batchItem.batchNo}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Expiry</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-gray-700">{batchItem.expiryDate || '-'}</span>
                                        {batchBadge ? <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight ${batchBadge.className}`}>{batchBadge.label}</span> : null}
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Stock</span>
                                      <span className="font-semibold text-emerald-700">{formatPackAmount(batchItem.availableBaseUnits, product)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Pricing</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-gray-500 line-through">₹{batchItem.purchasePrice.toFixed(1)}</span>
                                        <span className="font-bold text-gray-900">₹{batchItem.sellingPrice.toFixed(1)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()
                        ) : (
                          <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-500">
                            {loadingBatchesId === id ? 'Loading batches...' : 'No batch added yet'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </article>
              );
            })
          )}
        </div>
      </section>

      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]" onClick={() => setCartOpen(false)}>
          <div className="ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                  <ShoppingCart size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Cart View</p>
                  <h3 className="text-sm font-bold leading-tight text-[#0a2e2a]">Selected medicines</h3>
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Item count pill */}
            {selectedItems.length > 0 && (
              <div className="px-4 py-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {selectedCount} {selectedCount === 1 ? 'item' : 'items'} added
                </span>
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <div className="space-y-2">
                {selectedItems.length === 0 ? (
                  <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
                    <ShoppingCart size={22} className="mx-auto text-gray-300" />
                    <p className="mt-2 text-xs font-semibold text-gray-400">Cart is empty</p>
                    <p className="mt-1 text-[10px] text-gray-300">Add medicines from the list</p>
                  </div>
                ) : (
                  selectedItems.map((item) => {
                    const id = item.key;
                    const price = resolveBillPrice(item);
                    const lineTotal = item.qty * price;
                    const availableQty = getBillAvailableQty(item);
                    return (
                      <div key={id} className="group relative rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-emerald-100 hover:shadow-md">
                        {/* Remove button */}
                        <button
                          onClick={() => removeBillItem(id)}
                          className="absolute right-2 top-2 rounded-full p-1 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
                        >
                          <X size={11} />
                        </button>

                        {/* Medicine name & price */}
                        <div className="pr-5">
                          <p className="truncate text-xs font-bold leading-tight text-[#061412]">{resolveMedicineTitle(item.product)}</p>
                          <p className="mt-0.5 text-[10px] text-gray-400">₹{price.toFixed(2)} / unit</p>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                            Available: {availableQty} {pluralizeLabel(getSaleUnitLabel(item.product, item.saleUnit), availableQty)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {getSaleUnitOptions(item.product).map((unit) => (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => updateBillSaleUnit(id, unit)}
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition ${
                                  item.saleUnit === unit
                                    ? 'bg-[#0a2e2a] text-[#bbed3b]'
                                    : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100 hover:bg-gray-100'
                                }`}
                              >
                                {getSaleUnitLabel(item.product, unit)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Qty controls + line total */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1">
                            <button
                              type="button"
                              onClick={() => setBillQty(id, item.qty - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-500 active:scale-90 text-xs font-bold"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={getQtyDraft(id, item.qty)}
                              onChange={(e) => {
                                const next = e.target.value.replace(/[^\d]/g, '');
                                const display = next === '' ? '0' : next;
                                setQtyDrafts((prev) => ({ ...prev, [id]: display }));
                                setBillQty(id, Number(display));
                              }}
                              onFocus={(e) => handleQtyFocus(id, e.currentTarget.value, e.currentTarget)}
                              onBlur={(e) => handleQtyBlur(id, e.currentTarget.value)}
                              className="w-9 border-none bg-transparent text-center text-xs font-bold text-gray-800 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setBillQty(id, item.qty + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600 active:scale-90 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-[#0a2e2a]">₹{lineTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer: total + process bill */}
            <div className="border-t border-gray-100 px-3 pb-4 pt-3">
              <div className="rounded-xl bg-[#0a2e2a] px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/50">Grand Total</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/50">{selectedCount} {selectedCount === 1 ? 'item' : 'items'}</p>
                </div>
                <p className="mt-1 text-2xl font-black tracking-tight">₹{billTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <button
                type="button"
                onClick={createBill}
                disabled={billingSaving}
                className="mt-2.5 w-full rounded-xl bg-[#bbed3b] px-4 py-3 text-xs font-black uppercase tracking-widest text-[#0a2e2a] transition-all hover:scale-[1.01] hover:bg-[#c8f74d] active:scale-95 disabled:opacity-70"
              >
                {billingSaving ? <Loader2 className="mx-auto animate-spin" size={16} /> : 'Confirm Sale & Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {importDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-[#0a2e2a]">Review Import</h3>
                <p className="mt-1 text-sm text-gray-500">{importRows.filter(r => r.resolution !== 'skip').length} new &middot; {importRows.filter(r => r.resolution === 'skip').length} duplicates</p>
              </div>
              <button onClick={() => setImportDialogOpen(false)} className="rounded-full border border-gray-200 p-2 text-gray-500"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {importRows.map((row, i) => (
                <div key={i} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${row.resolution === 'skip' ? 'border-gray-100 bg-gray-50' : 'border-emerald-100 bg-emerald-50'}`}>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm text-gray-900">{row.medicine_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{row.category} &middot; Stock {row.stock || 0}</p>
                  </div>
                  <select
                    value={row.resolution}
                    onChange={e => setImportRows(prev => prev.map((r, j) => j === i ? { ...r, resolution: e.target.value as any } : r))}
                    className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#bbed3b]"
                  >
                    <option value="new">Add as New</option>
                    <option value="new_batch">Add as New Batch</option>
                    <option value="skip">Skip</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-4 flex gap-3">
              <button onClick={() => setImportDialogOpen(false)} className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={commitImport} disabled={importSaving} className="flex-1 rounded-2xl bg-[#0a2e2a] px-4 py-3 text-sm font-semibold text-[#bbed3b] disabled:opacity-70">
                {importSaving ? <Loader2 className="mx-auto animate-spin" size={18} /> : `Import ${importRows.filter(r => r.resolution !== 'skip').length} Medicines`}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#0a2e2a] p-2 pl-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] ring-1 ring-white/5">
            {/* Left: icon + bill info */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ShoppingCart size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Current Bill</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-white">₹{billTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/50">{selectedCount} {selectedCount === 1 ? 'item' : 'items'}</span>
                </div>
              </div>
            </div>
            {/* Right: checkout button */}
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#bbed3b] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-[#0a2e2a] transition-all hover:bg-[#c8f74d] active:scale-95"
            >
              Checkout
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Compact Right-side Add/Edit Product Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]">
          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-500 ease-out">
            {/* Compact Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <div>
                <h2 className="text-lg font-black text-[#0a2e2a] tracking-tight">
                  {editingProductId ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Inventory Console</p>
              </div>
              <button onClick={closeProductDrawer} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form onSubmit={saveProduct} className="space-y-6 pb-4">
                {/* Section 1: Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <div className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 transition-all hover:border-emerald-400 hover:bg-emerald-50/30">
                      {form.product_image_url ? (
                        <>
                          <img src={form.product_image_url} className="h-full w-full object-cover" alt="" />
                          <button 
                            type="button" 
                            onClick={() => setForm({ ...form, product_image_url: '' })}
                            className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-rose-500 shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2 text-center">
                          <ImageIcon className="text-gray-200" size={20} />
                          <span className="text-[8px] font-bold text-gray-300">Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-3">
                    <Field required label="Medicine Name" value={form.medicine_name} onChange={v => setForm({ ...form, medicine_name: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} options={['Tablet', 'Syrup', 'Capsule', 'Injection', 'Cream', 'Drops', 'Other']} />
                      <SelectField label="Base Unit" value={form.packaging.base_uom} onChange={v => setForm({ ...form, packaging: { ...form.packaging, base_uom: v } })} options={['unit', 'strip', 'box', 'bottle', 'vial']} />
                    </div>
                  </div>
                </div>

                <Field label="Generic Name (Salt Composition)" value={form.generic_name} onChange={v => setForm({ ...form, generic_name: v })} />

                {/* Section 2: Pricing (Compact Grid) */}
                <div className="rounded-2xl bg-emerald-50/20 p-4 ring-1 ring-emerald-500/5">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" size={14} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0a2e2a]">Pricing & Tax</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <Field type="number" required label="Buy Rate" value={String(form.purchase_price)} onChange={v => setForm({ ...form, purchase_price: Number(v) })} />
                    <Field type="number" required label="Sell Price" value={String(form.selling_price)} onChange={v => setForm({ ...form, selling_price: Number(v) })} />
                    <SelectField label="GST %" value={String(form.gst_percentage)} onChange={v => setForm({ ...form, gst_percentage: Number(v) })} options={['0', '5', '12', '18', '28']} />
                    <Field label="HSN Code" value={form.hsn_code} onChange={v => setForm({ ...form, hsn_code: v })} />
                  </div>
                </div>

                {/* Section 3: Smart Packing (Optimized) */}
                <div className="rounded-2xl border border-gray-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="text-blue-600" size={14} />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0a2e2a]">Pack Configuration</h3>
                    </div>
                    <div className="rounded-md bg-[#0a2e2a] px-2 py-0.5 text-[9px] font-bold text-[#bbed3b]">
                      Total: {form.packaging.base_uom === 'unit' ? 1 : 
                        form.packaging.base_uom === 'strip' ? (form.packaging.levels.find(l => l.level === 'strip')?.to_base_units || 1) :
                        (form.packaging.levels.find(l => l.level === 'strip')?.to_base_units || 1) * (form.packaging.levels.find(l => l.level === 'box')?.to_base_units || 1)} Units
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(form.packaging.base_uom === 'strip' || form.packaging.base_uom === 'box' || form.packaging.base_uom === 'bottle' || form.packaging.base_uom === 'vial') && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-400">Units per {form.packaging.base_uom === 'bottle' || form.packaging.base_uom === 'vial' ? 'Bottle' : 'Strip'}</label>
                        <input 
                          type="number" 
                          value={form.packaging.levels.find(l => l.level === 'strip')?.to_base_units || 1}
                          onChange={(e) => updateLevel(form, setForm, 'strip', e.target.value)}
                          className="w-full rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                    )}
                    {form.packaging.base_uom === 'box' && (
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-400">Strips/Bottles per Box</label>
                        <input 
                          type="number" 
                          value={form.packaging.levels.find(l => l.level === 'box')?.to_base_units || 1}
                          onChange={(e) => updateLevel(form, setForm, 'box', e.target.value)}
                          className="w-full rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Batch & Stock (Compact) */}
                {!editingProductId && (
                  <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-4">
                    <Field label="Batch ID" value={form.batch_no} onChange={v => setForm({ ...form, batch_no: v })} />
                    <Field type="date" label="Expiry" value={form.expiry_date} onChange={v => setForm({ ...form, expiry_date: v })} />
                    <Field type="number" label="Initial Qty" value={String(form.stock)} onChange={v => setForm({ ...form, stock: Number(v) })} />
                  </div>
                )}

                {/* Section 5: Misc */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Storage</h3>
                    <Field label="Rack Location" value={form.location_rack} onChange={v => setForm({ ...form, location_rack: v })} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Regulatory</h3>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_schedule_h} onChange={e => setForm({ ...form, is_schedule_h: e.target.checked })} className="h-3.5 w-3.5 rounded border-gray-300 text-rose-600" />
                        <span className="text-[10px] font-bold text-gray-600">Sch H</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_schedule_h1} onChange={e => setForm({ ...form, is_schedule_h1: e.target.checked })} className="h-3.5 w-3.5 rounded border-gray-300 text-rose-600" />
                        <span className="text-[10px] font-bold text-gray-600">Sch H1</span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/50 p-6">
              <button onClick={closeProductDrawer} className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-500 hover:bg-white">
                Cancel
              </button>
              <button onClick={(e) => { e.preventDefault(); saveProduct(e as any); }} disabled={saving} className="flex-[1.5] rounded-xl bg-[#0a2e2a] py-3 text-xs font-black text-[#bbed3b] transition-all hover:bg-[#0f423d] active:scale-95 shadow-lg shadow-emerald-900/10">
                {saving ? <Loader2 className="mx-auto animate-spin" size={16} /> : editingProductId ? 'Update' : 'Save Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Receipt Modal */}
      {showReceipt && lastBill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:backdrop-blur-none">
          <div className="w-full max-w-lg animate-in zoom-in-95 duration-300 print:max-w-none print:w-[80mm] print:shadow-none print:animate-none">
            <div className="max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl print:max-h-none print:rounded-none">
              {/* Header - Hidden on print for thermal look */}
              <div className="bg-[#0a2e2a] px-6 py-5 text-white print:hidden">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20">
                    <Check size={26} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#bbed3b]">Counter Sale Confirmed</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight">Sale Completed</h3>
                    <p className="mt-1 text-sm text-white/60">Inventory updated and receipt is ready.</p>
                  </div>
                </div>
              </div>

              {/* Thermal Print Header (Only visible on print) */}
              <div className="hidden print:block text-center pt-4 pb-2 border-b border-black">
                <h2 className="text-lg font-black uppercase">SANJEEVANI PHARMACY</h2>
                <p className="text-[10px] font-bold">Health Care at Your Fingertips</p>
                <p className="text-[9px] mt-1">Reg No: SANJ-RX-77420</p>
              </div>
              
              <div className="overflow-y-auto p-6 print:overflow-visible print:p-4">
                <div className="mb-4 grid grid-cols-3 gap-2 print:hidden">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Stock</p>
                    <p className="mt-1 text-sm font-black text-[#0a2e2a]">{lastBill.stockUpdated ? 'Updated' : 'Pending'}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Items</p>
                    <p className="mt-1 text-sm font-black text-gray-900">{lastBill.items.length}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Ledger</p>
                    <p className="mt-1 text-sm font-black text-gray-900">{lastBill.stockMovements}</p>
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-between border-b border-dashed border-gray-200 pb-4 print:border-black print:mb-4 print:pb-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 print:text-black">Invoice #</p>
                    <p className="text-sm font-bold text-gray-900 print:text-[10px]">{lastBill.billId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 print:text-black">Date</p>
                    <p className="text-sm font-bold text-gray-900 print:text-[10px]">{lastBill.date}</p>
                  </div>
                </div>

                <div className="space-y-4 print:space-y-2">
                  <div className="hidden print:grid grid-cols-12 text-[8px] font-black uppercase border-b border-black pb-1 mb-1">
                    <span className="col-span-5">Item</span>
                    <span className="col-span-2">HSN</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-3 text-right">Amount</span>
                  </div>
                  {lastBill.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm print:grid print:grid-cols-12 print:text-[9px]">
                      <div className="min-w-0 flex-1 print:col-span-5">
                        <p className="truncate font-bold text-gray-800 print:text-[9px]">{item.name}</p>
                        <p className="text-xs text-gray-400 print:hidden">{item.qty} units × ₹{item.price.toFixed(2)}</p>
                      </div>
                      <span className="hidden print:block col-span-2 text-center text-gray-500">{item.hsn}</span>
                      <span className="hidden print:block col-span-2 text-center font-bold">{item.qty}</span>
                      <p className="font-black text-gray-900 print:col-span-3 print:text-right">₹{item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-2 border-t border-gray-100 pt-4 print:mt-4 print:pt-2 print:border-black print:border-t-2">
                  <div className="flex justify-between text-xs print:text-[9px]">
                    <span className="text-gray-500 font-bold uppercase tracking-widest print:text-black">Taxable Amount</span>
                    <span className="font-bold">₹{(lastBill.total - lastBill.taxTotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs print:text-[9px]">
                    <span className="text-gray-500 font-bold uppercase tracking-widest print:text-black">GST (CGST+SGST)</span>
                    <span className="font-bold">₹{lastBill.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#0a2e2a] p-6 text-white print:bg-white print:text-black print:p-2 print:border-t print:border-black print:rounded-none">
                    <p className="text-xs font-black uppercase tracking-widest print:text-[10px]">Grand Total</p>
                    <p className="text-2xl font-black print:text-base">₹{lastBill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
                   <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-4 text-xs font-black uppercase tracking-widest text-emerald-700 transition-all hover:bg-emerald-100"
                  >
                    <Printer size={18} /> Print Receipt
                  </button>
                  <button 
                    onClick={() => setShowReceipt(false)}
                    className="rounded-2xl bg-[#0a2e2a] py-4 text-xs font-black uppercase tracking-widest text-[#bbed3b] transition-all hover:bg-[#0f423d]"
                  >
                    Close & New Bill
                  </button>
                </div>

                <div className="hidden print:block text-center mt-6 pt-4 border-t border-dashed border-black">
                    <p className="text-[10px] font-black uppercase">THANK YOU</p>
                    <p className="text-[8px] font-bold text-gray-500">Visit again for all your medical needs</p>
                    <p className="text-[7px] mt-2 opacity-50 font-mono">Generated by SanjeevaniRxAI Console</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Dialog */}
      {batchDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0a2e2a]">Add New Batch</h3>
              <button onClick={closeBatchDialog} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={saveBatch} className="space-y-4">
              <Field required label="Batch Number" value={batchForm.batch_no} onChange={v => setBatchForm({ ...batchForm, batch_no: v })} />
              <Field type="date" required label="Expiry Date" value={batchForm.expiry_date} onChange={v => setBatchForm({ ...batchForm, expiry_date: v })} />
              <Field type="number" required label="Quantity" value={String(batchForm.quantity)} onChange={v => setBatchForm({ ...batchForm, quantity: Number(v) })} />
              <div className="grid grid-cols-2 gap-4">
                <Field type="number" label="Buying Price" value={String(batchForm.purchase_rate_per_base)} onChange={v => setBatchForm({ ...batchForm, purchase_rate_per_base: v })} />
                <Field type="number" label="Selling Price" value={String(batchForm.mrp_per_base)} onChange={v => setBatchForm({ ...batchForm, mrp_per_base: v })} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeBatchDialog} className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={batchSaving} className="flex-1 rounded-2xl bg-[#0a2e2a] py-3 text-sm font-semibold text-[#bbed3b]">
                  {batchSaving ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Add Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// --- Helper components ---

const updateLevel = (
  form: ProductForm,
  setForm: Dispatch<SetStateAction<ProductForm>>,
  level: 'unit' | 'strip' | 'box',
  value: string,
) => {
  const next = Number(value) || 1;
  setForm({
    ...form,
    packaging: {
      ...form.packaging,
      levels: form.packaging.levels.map((item) => (item.level === level ? { ...item, to_base_units: next } : item)),
    },
  });
};

const QtyButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-90"
  >
    {label}
  </button>
);

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</span>
    <input
      required={required}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#bbed3b]"
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#bbed3b]"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);



export default ProductTable;
