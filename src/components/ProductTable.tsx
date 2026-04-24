import { useEffect, useMemo, useRef, useState, useCallback, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Image as ImageIcon,
  Pencil,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { addProduct, applyStockActions, bulkAddProducts, bulkImportPreview, deleteProduct, fetchProducts, fetchProductBatches, updateProduct } from '../services/api';

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
};

type ProductForm = {
  medicine_name: string;
  generic_name: string;
  brand_name: string;
  supplier_name: string;
  category: string;
  stock: number;
  batch_no: string;
  expiry_month_year: string; // MM/YYYY
  selling_price: number;
  purchase_price: number;
  mrp: number;
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
  batch_no: '',
  expiry_month_year: '',
  selling_price: 0,
  purchase_price: 0,
  mrp: 0,
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Date helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const toMonthYear = (dateStr?: string): string => {
  if (!dateStr) return '';
  const m = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (m) return `${m[2]}/${m[1]}`;
  if (/^\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  return '';
};
const fromMonthYear = (my: string): string => {
  if (!my) return '';
  const m = my.match(/^(\d{2})\/(\d{4})$/);
  if (!m) return my;
  const mo = parseInt(m[1]), yr = parseInt(m[2]);
  const last = new Date(yr, mo, 0).getDate();
  return `${yr}-${String(mo).padStart(2,'0')}-${String(last).padStart(2,'0')}`;
};
const displayExpiry = (d?: string) => toMonthYear(d) || d || '-';

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CSV parser Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const parseCSV = (text: string): ImportRow[] => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return {
      medicine_name: obj.medicine_name || obj.medicine_name || '',
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
    expiry_month_year: '',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qtyAutoSelectUsed = useRef<Record<string, boolean>>({});

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
  const resolveProductKey = (p: ProductRow) => String(p.id || p._id || p['Product ID'] || p.barcodes?.[0]?.code || '');
  const parseExpiryTimestamp = (value?: string) => {
    if (!value) return Number.POSITIVE_INFINITY;
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
  };
  const normalizeBatch = (batch: Record<string, any>, index = 0): NormalizedBatch => {
    const batchNo = String(batch.batch_no || batch.batch_number || batch['Batch Number'] || batch.batch || '').trim();
    const expiryDate = String(batch.expiry_date || batch['Expiry Date'] || batch.expiry || '').trim();
    const availableBaseUnits = Number(batch.available_base_units ?? batch['Current Stock'] ?? batch.stock ?? 0);
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
  const getBatchList = (product: ProductRow, productId: string) => {
    const loaded = batchesByProduct[productId] || [];
    const productBatch = product.batch_no || product['Batch Number'] ? [product] : [];
    const next = [...loaded, ...productBatch];
    return next.map((batch, index) => normalizeBatch(batch, index)).sort((a, b) => {
      const expiryDiff = parseExpiryTimestamp(a.expiryDate) - parseExpiryTimestamp(b.expiryDate);
      if (expiryDiff !== 0) return expiryDiff;
      return a.batchNo.localeCompare(b.batchNo);
    });
  };
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
    return Number(p.stock_summary?.available_base_units ?? p['Current Stock'] ?? 0);
  };
  const resolvePrice = (p: ProductRow) => Number(p.selling_price ?? p['Selling Price'] ?? p.unit_price ?? p['Unit Price'] ?? p.mrp ?? p['MRP'] ?? p.purchase_price ?? p['Purchase Price'] ?? 0);
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
  const resolveUnitLabel = (p: ProductRow) => p.base_uom || p.unit_type || p.packaging?.base_uom || p.packaging?.levels?.find((item) => item.level === 'unit')?.label || 'Unit';
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
  const getExpiryBadge = (days: number | null) => {
    if (days === null) return null;
    if (days < 0) return { label: 'Expired', className: 'border border-red-100 bg-red-50 text-red-700' };
    if (days <= 30) return { label: 'Expiring soon', className: 'border border-amber-100 bg-amber-50 text-amber-700' };
    return null;
  };
  const resolveBillPrice = (item: BillItem) => Number(item.batch?.sellingPrice ?? resolvePrice(item.product));
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

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts(1, 1000, search);
      setProducts((res.data || []) as ProductRow[]);
    } catch (error) {
      console.error(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredProducts = useMemo(() => {
    const next = products.filter((p, index) => {
      const id = getRowKey(p, index);
      const stock = resolveStock(p, id);
      if (filter === 'low') return stock > 0 && stock < 20;
      if (filter === 'expiry') {
        const exp = resolveExpiry(p, id);
        if (!exp) return false;
        const days = getExpiryDays(p, id);
        if (days === null) return false;
        return days >= 0 && days <= 90;
      }
      return true;
    });
    if (filter === 'expiry') {
      return next.sort((a, b) => (getExpiryDays(a, resolveProductKey(a)) ?? 9999) - (getExpiryDays(b, resolveProductKey(b)) ?? 9999));
    }
    return next;
  }, [products, filter, batchesByProduct]);

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
      batch_no: '',
      expiry_month_year: '',
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
      setSelected((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    setSelected((prev) => ({
      ...prev,
      [key]: {
        key,
        product,
        qty: 1,
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
      const nextQty = Math.max(0, qty);
      setQtyDrafts((drafts) => ({ ...drafts, [productId]: String(nextQty) }));
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
      return {
        ...prev,
        [itemKey]: {
          ...item,
          batch: nextBatch,
        },
      };
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
        batch_no: product.batch_no || product['Batch Number'] || '',
        expiry_month_year: toMonthYear(product.expiry_date || product['Expiry Date']),
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
        expiry_date: fromMonthYear(form.expiry_month_year),
        selling_price: form.selling_price,
        purchase_price: form.purchase_price,
        mrp: form.mrp,
        schedule: form.schedule,
        prescription_required: form.prescription_required,
        packaging: form.packaging,
        base_uom: form.packaging.base_uom,
        barcodes: form.barcode ? [{ code: form.barcode, level: 'unit', is_primary: true }] : undefined,
        product_image_url: form.product_image_url,
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
            expiry_date: fromMonthYear(batchForm.expiry_month_year) || undefined,
            qty: { unit: Number(batchForm.quantity) || 0, strip: 0, box: 0 },
            supplier_name: batchForm.supplier_name.trim() || undefined,
            purchase_rate_per_base: batchForm.purchase_rate_per_base ? Number(batchForm.purchase_rate_per_base) : undefined,
            mrp_per_base: batchForm.mrp_per_base ? Number(batchForm.mrp_per_base) : undefined,
            unit_type: batchDialogProduct.base_uom || batchDialogProduct.unit_type || batchDialogProduct.packaging?.base_uom || 'unit',
          },
        ],
      };
      await applyStockActions(payload, `batch-add:${batchDialogProductId}:${batchForm.batch_no || Date.now()}`);      setMessage('Batch added successfully');
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

  const createBill = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please add medicines to the bill first');
      return;
    }
    setBillingSaving(true);
    setMessage(null);
    try {
      const payload = {
        action: 'sale_out',
        reason_code: 'counter_sale',
        reference_type: 'bill',
        reference_id: `bill-${Date.now()}`,
        lines: selectedItems.map((item) => ({
          product_id: resolveProductKey(item.product) || item.key,
          batch_no: item.batch?.batchNo || undefined,
          qty: { unit: item.qty, strip: 0, box: 0 },
          reason_code: 'counter_sale',
        })),
      };
      await applyStockActions(payload, `bill-${Date.now()}`);
      setSelected({});
      setQtyDrafts({});
      setCartOpen(false);
      setMessage('Bill created successfully');
      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : 'Could not create bill');
    } finally {
      setBillingSaving(false);
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
      const tagged = rows.map(r => ({ ...r, resolution: (dupes.includes(r.medicine_name) ? 'skip' : 'new') as 'new'|'skip'|'new_batch' }));
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
      setMessage(`Import done: ${res.added} added, ${(res.skipped||[]).length} skipped.`);
      setImportDialogOpen(false);
      setImportRows([]);
      await loadProducts();
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Import failed'); } finally { setImportSaving(false); }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openProductDrawer()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0a2e2a] px-3.5 py-2.5 text-sm font-semibold text-[#bbed3b]"
            >
              <Plus size={16} /> Add Product
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importPreviewing}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-sm font-semibold text-violet-700"
            >
              {importPreviewing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Import CSV
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleImportFile} />
            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800"
            >
              <ShoppingCart size={16} /> Cart {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
            <button
              onClick={() => { setSelected({}); setQtyDrafts({}); }}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700"
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
                className={`rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition ${
                  filter === item.key
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines, salt, brand, or barcode"
              className="w-full rounded-[20px] border border-gray-200 bg-white py-3 pl-11 pr-4 text-[15px] text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.04)] outline-none transition placeholder:text-gray-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <AlertCircle size={16} />
            {message}
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

        {/* Recently added chips */}
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

        {/* Alerts moved to individual cards for a cleaner integrated UI */}



        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <Package size={34} className="text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-500">No products match this view</p>
              <p className="mt-1 max-w-sm text-sm text-gray-400">Try a different search or add the first medicine to start your catalog.</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => {
              const id = getRowKey(product, index);
              const stock = resolveStock(product, id);
              const batch = product.batch_no || product['Batch Number'] || '';
              const expiry = product.expiry_date || product['Expiry Date'] || '-';
              const price = resolvePrice(product);
              const category = product.category || 'OTC';
              const selectedQty = selected[id]?.qty || 0;
              const productBatches = getBatchList(product, id);
              const earliestExpiry = productBatches[0]?.expiryDate || expiry;
              const expiryDays = getExpiryDays(product, id);
              const expiryBadge = getExpiryBadge(expiryDays);
              const batchLabel = batch ? `Batch ${batch}` : '+ Add Batch';
              return (
                <article key={id} className="rounded-2xl border border-gray-100 bg-white px-3 py-3 transition hover:border-emerald-100 hover:shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => addBillItem(product, id)}
                        className={`mt-1 grid h-8 w-8 place-items-center rounded-xl border transition ${
                          selected[id]
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-400'
                        }`}
                        aria-label="Add to bill"
                      >
                        {selected[id] ? <Check size={16} /> : <ShoppingCart size={16} />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-[20px] font-black leading-tight text-[#02100e] tracking-tight">
                            {resolveMedicineTitle(product)}
                          </h4>
                          {resolveStrength(product) ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              {resolveStrength(product)}
                            </span>
                          ) : null}
                        </div>

                        {resolveCompany(product) ? (
                          <div className="mt-1 text-sm font-medium text-gray-500">{resolveCompany(product)}</div>
                        ) : null}

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-gray-600">
                          <button
                            type="button"
                            onClick={() => openBatchDialog(product, id)}
                            className={`group flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-tight transition-all active:scale-95 ${
                              batch
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 ring-1 ring-rose-200/50'
                            }`}
                          >
                            <Plus size={12} className={batch ? 'hidden' : 'block'} />
                            {batchLabel}
                          </button>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-600 ring-1 ring-gray-200/50">
                              <Package size={12} className="text-gray-400" />
                              Stock: {formatStockLabel(product, id)}
                            </span>

                            {/* Integrated Status Badges */}
                            {expiryBadge && (
                              <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ring-1 ${expiryBadge.className.includes('red') ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                                <AlertTriangle size={12} />
                                {expiryBadge.label}
                              </span>
                            )}
                            
                            {resolveStock(product, id) < 20 && resolveStock(product, id) > 0 && (
                              <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-bold text-orange-700 ring-1 ring-orange-200">
                                <TrendingUp size={12} className="rotate-180" />
                                Low Stock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-[11px] font-medium text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Exp: {displayExpiry(earliestExpiry)}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>Category: {category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
                        <div className="leading-tight">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">Sell</p>
                          <p className="text-sm font-semibold text-gray-900">Rs {price.toFixed(2)}</p>
                        </div>
                      </div>
                      {(() => {
                        const buyPrice = Number(product.purchase_price ?? product['Purchase Price'] ?? 0);
                        if (buyPrice > 0 && price > 0) {
                          const margin = ((price - buyPrice) / price * 100).toFixed(0);
                          return (
                            <div className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2">
                              <TrendingUp size={11} className="text-emerald-600" />
                              <div className="leading-tight">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-500">Margin</p>
                                <p className="text-sm font-semibold text-emerald-700">{margin}%</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <button
                        type="button"
                        onClick={() => openProductDrawer(product, id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-700"
                        title="Edit product"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpandedProduct(id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-700"
                        title={expandedProductId === id ? 'Hide batches' : 'Show batches'}
                      >
                        <Package size={14} />
                      </button>

                      <button
                        onClick={() => addBillItem(product, id)}
                        className={`grid h-9 w-9 place-items-center rounded-full ${
                          selected[id] ? 'bg-emerald-600 text-white' : 'bg-[#0a2e2a] text-[#bbed3b]'
                        }`}
                        title={selected[id] ? 'Added to bill' : 'Add to bill'}
                      >
                        <ShoppingCart size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmDeleteProduct(product, id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-600"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

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
                        {productBatches.length > 0 ? (
                          productBatches.map((batchItem, batchIndex: number) => {
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
                                      {batchItem.purchasePrice > 0 && batchItem.sellingPrice > 0 && (
                                        <span className="text-[10px] font-bold text-emerald-600">
                                          ({(((batchItem.sellingPrice - batchItem.purchasePrice) / batchItem.sellingPrice) * 100).toFixed(0)}% Margin)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-500">
                            {loadingBatchesId === id ? 'Loading batches...' : 'No batch added yet'}
                            {loadingBatchesId !== id ? (
                              <button
                                type="button"
                                onClick={() => openBatchDialog(product, id)}
                                className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                              >
                                <Plus size={12} />
                                Add First Batch
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedQty > 0 && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Bill quantity</p>
                          {/* <p className="text-sm text-emerald-800">Use this when preparing the bill</p> */}
                          <div className="mt-1 flex items-center gap-3">
                            
                            <span className="text-xs text-emerald-700">
                              Total: Rs {billTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBillQty(id, selectedQty - 1)}
                            className="grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={getQtyDraft(id, selectedQty)}
                            onChange={(e) => {
                              const next = e.target.value.replace(/[^\d]/g, '');
                              const display = next === '' ? '0' : next;
                              setQtyDrafts((prev) => ({ ...prev, [id]: display }));
                              setBillQty(id, Number(display));
                            }}
                            onFocus={(e) => handleQtyFocus(id, e.currentTarget.value, e.currentTarget)}
                            onBlur={(e) => handleQtyBlur(id, e.currentTarget.value)}
                            className="w-14 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[#bbed3b]"
                          />
                          <button
                            type="button"
                            onClick={() => setBillQty(id, selectedQty + 1)}
                            className="grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => setCartOpen(true)}
                            className="grid h-7 w-7 place-items-center rounded-full bg-[#0a2e2a] text-[#bbed3b]"
                            title="Open cart"
                          >
                            <ShoppingCart size={14} />
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]">
          <div className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400">Cart view</p>
                <h3 className="text-xl font-semibold text-[#0a2e2a]">Selected medicines</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-full border border-gray-200 p-2 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {selectedItems.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center">
                      <ShoppingCart size={28} className="mx-auto text-gray-300" />
                      <p className="mt-2 text-sm font-semibold text-gray-500">Cart is empty</p>
                      <p className="mt-1 text-sm text-gray-400">Tap Add to bill on products to build the bill.</p>
                    </div>
                ) : (
                  selectedItems.map((item) => {
                    const id = item.key;
                    const price = resolveBillPrice(item);
                    return (
                      <div key={id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold leading-tight text-[#061412]">{resolveMedicineTitle(item.product)}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{resolveCompany(item.product) || 'Selected medicine'} &middot; Rs {price.toFixed(2)} each</p>
                            {item.batch ? (
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                                  Batch {item.batch.batchNo}
                                </span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                                  Exp {item.batch.expiryDate || '-'}
                                </span>
                                {item.availableBatches.length > 1 ? (
                                  <select
                                    value={item.batch.key}
                                    onChange={(e) => updateBillBatch(id, e.target.value)}
                                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 outline-none"
                                  >
                                    {item.availableBatches.map((batch) => (
                                      <option key={batch.key} value={batch.key}>
                                        {batch.batchNo}
                                        {batch.expiryDate ? ` &middot; ${batch.expiryDate}` : ''}
                                      </option>
                                    ))}
                                  </select>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          <button onClick={() => confirmRemoveBillItem(id)} className="rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <QtyButton label="-" onClick={() => setBillQty(id, item.qty - 1)} />
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
                              className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-[#bbed3b]"
                            />
                            <QtyButton label="+" onClick={() => setBillQty(id, item.qty + 1)} />
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">Line total</p>
                            <span className="text-sm font-semibold text-gray-900">Rs {(item.qty * price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 p-6">
              <div className="rounded-[24px] bg-[#0a2e2a] p-4 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">Bill total</p>
                <p className="mt-2 text-3xl font-semibold">Rs {billTotal.toFixed(2)}</p>
              </div>
              <button
                type="button"
                onClick={createBill}
                disabled={billingSaving}
                className="mt-4 w-full rounded-2xl bg-[#bbed3b] px-4 py-3 text-sm font-semibold text-[#0a2e2a] disabled:opacity-70"
              >
                {billingSaving ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Create Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {batchDialogOpen && batchDialogProduct && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400">Batch entry</p>
                <h3 className="text-xl font-semibold text-[#0a2e2a]">Add Batch</h3>
                <p className="mt-1 text-sm text-gray-500">{resolveMedicineTitle(batchDialogProduct)}</p>
              </div>
              <button onClick={closeBatchDialog} className="rounded-full border border-gray-200 p-2 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveBatch} className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Batch Number" value={batchForm.batch_no} onChange={(value) => setBatchForm({ ...batchForm, batch_no: value })} />
                <MonthYearField label="Expiry (MM/YYYY)" value={batchForm.expiry_month_year} onChange={(value) => setBatchForm({ ...batchForm, expiry_month_year: value })} required />
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Quantity *</span>
                  <input
                    required
                    type="number"
                    value={batchForm.quantity}
                    onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#bbed3b]"
                  />
                </label>
                <Field label="Supplier Name" value={batchForm.supplier_name} onChange={(value) => setBatchForm({ ...batchForm, supplier_name: value })} />
                <Field label="Purchase Price *" value={batchForm.purchase_rate_per_base} onChange={(value) => setBatchForm({ ...batchForm, purchase_rate_per_base: value })} type="number" required />
                <Field label="Selling / MRP" value={batchForm.mrp_per_base} onChange={(value) => setBatchForm({ ...batchForm, mrp_per_base: value })} type="number" />
              </div>

              <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                Batch stock is stored in base units, but the display will stay readable in the product row.
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeBatchDialog} className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchSaving}
                  className="flex-1 rounded-2xl bg-[#0a2e2a] px-4 py-3 text-sm font-semibold text-[#bbed3b] disabled:opacity-70"
                >
                  {batchSaving ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="flex w-full max-w-2xl max-h-[92vh] flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400">Quick create</p>
                <h3 className="text-xl font-semibold text-[#0a2e2a]">{editingProductId ? 'Edit Product' : 'Add Product'}</h3>
              </div>
              <button onClick={closeProductDrawer} className="rounded-full border border-gray-200 p-2 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Medicine Name *" value={form.medicine_name} onChange={(value) => setForm({ ...form, medicine_name: value })} required />
                <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
                <Field label="Generic Name" value={form.generic_name} onChange={(value) => setForm({ ...form, generic_name: value })} />
                <Field label="Brand Name" value={form.brand_name} onChange={(value) => setForm({ ...form, brand_name: value })} />
                <Field label="Supplier Name" value={form.supplier_name} onChange={(value) => setForm({ ...form, supplier_name: value })} />
                <Field label="Initial Stock" value={String(form.stock)} onChange={(value) => setForm({ ...form, stock: Number(value) || 0 })} type="number" />
                <Field label="Batch No (leave blank for auto)" value={form.batch_no} onChange={(value) => setForm({ ...form, batch_no: value })} />
                <MonthYearField label="Expiry (MM/YYYY)" value={form.expiry_month_year} onChange={(value) => setForm({ ...form, expiry_month_year: value })} />
                <Field label="Purchase Price" value={String(form.purchase_price)} onChange={(value) => setForm({ ...form, purchase_price: Number(value) || 0 })} type="number" />
                <Field label="MRP" value={String(form.mrp)} onChange={(value) => setForm({ ...form, mrp: Number(value) || 0 })} type="number" />
                <Field label="Selling Price" value={String(form.selling_price)} onChange={(value) => setForm({ ...form, selling_price: Number(value) || 0 })} type="number" />
              </div>

              {/* Product image upload */}
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Product Image (optional)</span>
                <label
                  htmlFor="product-img-upload"
                  className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  {form.product_image_url ? (
                    <>
                      <img src={form.product_image_url} alt="Product preview" className="mx-auto h-24 w-24 rounded-xl object-cover shadow-sm" />
                      <span className="text-xs text-gray-500">Click to change image</span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 group-hover:bg-emerald-100">
                        <ImageIcon size={22} className="text-gray-400 group-hover:text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Click or drag to upload product image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP · max 2 MB</p>
                    </>
                  )}
                  <input
                    id="product-img-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setForm({ ...form, product_image_url: ev.target?.result as string });
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {form.product_image_url && (
                  <button type="button" onClick={() => setForm({ ...form, product_image_url: '' })} className="mt-1.5 text-xs font-medium text-red-500 hover:text-red-700">
                    Remove image
                  </button>
                )}
              </div>


              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Schedule</label>
                  <select
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value, prescription_required: e.target.value !== 'OTC' })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#bbed3b]"
                  >
                    {SCHEDULES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.prescription_required}
                    onChange={(e) => setForm({ ...form, prescription_required: e.target.checked })}
                  />
                  Prescription required
                </label>
              </div>

              <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">Packaging</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">Base unit only in stock</p>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <SelectField
                    label="Base Unit Type"
                    value={form.packaging.base_uom}
                    onChange={(value) => setForm({
                      ...form,
                      packaging: {
                        ...form.packaging,
                        base_uom: value,
                      },
                    })}
                    options={['unit', 'tablet', 'strip', 'bottle', 'injection']}
                  />
                  <Field
                    label="Unit to base"
                    value={String(form.packaging.levels.find((item) => item.level === 'unit')?.to_base_units || 1)}
                    onChange={(value) => updateLevel(form, setForm, 'unit', value)}
                    type="number"
                  />
                  <Field
                    label="Strip to base"
                    value={String(form.packaging.levels.find((item) => item.level === 'strip')?.to_base_units || 10)}
                    onChange={(value) => updateLevel(form, setForm, 'strip', value)}
                    type="number"
                  />
                  <Field
                    label="Box to base"
                    value={String(form.packaging.levels.find((item) => item.level === 'box')?.to_base_units || 100)}
                    onChange={(value) => updateLevel(form, setForm, 'box', value)}
                    type="number"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeProductDrawer} className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-[#0a2e2a] px-4 py-3 text-sm font-semibold text-[#bbed3b] disabled:opacity-70"
                >
                  {saving ? <Loader2 className="mx-auto animate-spin" size={18} /> : editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import conflict resolution dialog */}
      {importDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex w-full max-w-2xl max-h-[90vh] flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-500">CSV Import</p>
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
                    <p className="text-xs text-gray-500 mt-0.5">{row.category} &middot; Stock {row.stock || 0} &middot; MRP &#8377;{row.mrp || 0}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {row.resolution === 'skip' && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">Duplicate</span>}
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
    </div>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Helper components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
    className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 bg-white text-base font-semibold text-gray-700"
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

const MonthYearField = ({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => {
  const parts = value ? value.split('/') : ['', ''];
  const month = parts[0] || '';
  const year = parts[1] || '';
  const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</span>
      <div className="flex gap-2">
        <select
          value={month}
          required={required}
          onChange={e => onChange(`${e.target.value}/${year}`)}
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#bbed3b]"
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => <option key={m} value={m}>{MONTH_NAMES[i]}</option>)}
        </select>
        <input
          type="number"
          placeholder="YYYY"
          value={year}
          min={2020}
          max={2040}
          onChange={e => onChange(`${month}/${e.target.value}`)}
          className="w-24 rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#bbed3b]"
        />
      </div>
    </label>
  );
};

export default ProductTable;

