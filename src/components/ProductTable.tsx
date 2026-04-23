import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import {
  AlertCircle,
  Check,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { addProduct, applyStockActions, fetchProducts, fetchProductBatches } from '../services/api';

type PackBreakdown = { box: number; strip: number; unit: number };

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
  packaging?: { levels?: { level: string; to_base_units: number; label?: string }[] };
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
};

type ProductForm = {
  medicine_name: string;
  generic_name: string;
  brand_name: string;
  category: string;
  stock: number;
  batch_no: string;
  expiry_date: string;
  selling_price: number;
  mrp: number;
  schedule: string;
  prescription_required: boolean;
  packaging: {
    base_uom: string;
    levels: { level: 'unit' | 'strip' | 'box'; label: string; to_base_units: number }[];
  };
  barcode: string;
};

type BillItem = {
  key: string;
  product: ProductRow;
  qty: number;
};

const SCHEDULES = ['OTC', 'H', 'H1', 'X'];

const emptyForm = (): ProductForm => ({
  medicine_name: '',
  generic_name: '',
  brand_name: '',
  category: 'General',
  stock: 0,
  batch_no: '',
  expiry_date: '',
  selling_price: 0,
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
});

const ProductTable = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'expiry'>('all');
  const [selected, setSelected] = useState<Record<string, BillItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [batchesByProduct, setBatchesByProduct] = useState<Record<string, any[]>>({});
  const [loadingBatchesId, setLoadingBatchesId] = useState<string | null>(null);
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
  const getRowKey = (p: ProductRow, index: number) => {
    const stable = resolveProductKey(p);
    if (stable) return stable;
    const batch = p.batch_no || p['Batch Number'] || 'nobatch';
    const expiry = p.expiry_date || p['Expiry Date'] || 'noexpiry';
    return `${resolveMedicineTitle(p)}|${batch}|${expiry}|${index}`;
  };
  const resolveStock = (p: ProductRow) => Number(p.stock_summary?.available_base_units ?? p['Current Stock'] ?? 0);
  const resolvePrice = (p: ProductRow) => Number(p.selling_price ?? p['Selling Price'] ?? p.unit_price ?? p['Unit Price'] ?? p.mrp ?? p['MRP'] ?? p.purchase_price ?? p['Purchase Price'] ?? 0);
  const resolvePurchasePrice = (p: ProductRow) => Number(p.purchase_price ?? p['Purchase Price'] ?? 0);
  const resolveExpiry = (p: ProductRow) => p.expiry_date || p['Expiry Date'] || '';
  const getExpiryDays = (p: ProductRow) => {
    const expiry = resolveExpiry(p);
    if (!expiry) return null;
    const diff = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Number.isNaN(diff) ? null : diff;
  };
  const resolveUnitLabel = (p: ProductRow) => p.packaging?.levels?.find((item) => item.level === 'unit')?.label || 'Unit';
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
  const formatStockLabel = (p: ProductRow) => formatPackAmount(resolveStock(p), p);

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
    const next = products.filter((p) => {
      const stock = resolveStock(p);
      if (filter === 'low') return stock > 0 && stock < 20;
      if (filter === 'expiry') {
        const exp = resolveExpiry(p);
        if (!exp) return false;
        const days = getExpiryDays(p);
        if (days === null) return false;
        return days >= 0 && days <= 90;
      }
      return true;
    });
    if (filter === 'expiry') {
      return next.sort((a, b) => (getExpiryDays(a) ?? 9999) - (getExpiryDays(b) ?? 9999));
    }
    return next;
  }, [products, filter]);

  const selectedItems = Object.values(selected);
  const selectedCount = selectedItems.length;
  const billTotal = selectedItems.reduce((sum, item) => sum + item.qty * resolvePrice(item.product), 0);

  const loadBatchesForProduct = async (productId: string) => {
    if (batchesByProduct[productId]) return batchesByProduct[productId];
    setLoadingBatchesId(productId);
    try {
      const response = await fetchProductBatches(productId);
      const batches = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setBatchesByProduct((prev) => ({ ...prev, [productId]: batches }));
      return batches;
    } catch (error) {
      console.error(error);
      setBatchesByProduct((prev) => ({ ...prev, [productId]: [] }));
      return [];
    } finally {
      setLoadingBatchesId((current) => (current === productId ? null : current));
    }
  };

  const toggleExpandedProduct = async (productId: string) => {
    setExpandedProductId((current) => (current === productId ? null : productId));
    await loadBatchesForProduct(productId);
  };
  const openBatchDialog = (product: ProductRow, productId: string) => {
    setBatchDialogProduct(product);
    setBatchDialogProductId(productId);
    setBatchForm({
      batch_no: '',
      expiry_date: '',
      quantity: 0,
      supplier_name: resolveCompany(product),
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
  const toggleBillItem = (product: ProductRow, key: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { key, product, qty: 1 };
      return next;
    });
  };

  const setBillQty = (productId: string, qty: number) => {
    setSelected((prev) => {
      if (!prev[productId]) return prev;
      return { ...prev, [productId]: { ...prev[productId], qty: Math.max(0, qty) } };
    });
  };

  const removeBillItem = (productId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const resetForm = () => setForm(emptyForm());

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await addProduct({
        medicine_name: form.medicine_name,
        generic_name: form.generic_name,
        brand_name: form.brand_name,
        category: form.category,
        stock: form.stock,
        batch_no: form.batch_no,
        expiry_date: form.expiry_date,
        selling_price: form.selling_price,
        mrp: form.mrp,
        schedule: form.schedule,
        prescription_required: form.prescription_required,
        packaging: form.packaging,
        barcodes: form.barcode ? [{ code: form.barcode, level: 'unit', is_primary: true }] : undefined,
      });
      resetForm();
      setDrawerOpen(false);
      setMessage('Product added successfully');
      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage('Could not save product');
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
          },
        ],
      };
      await applyStockActions(payload, `batch-add:${batchDialogProductId}:${batchForm.batch_no || Date.now()}`);
      setMessage('Batch added successfully');
      closeBatchDialog();
      await loadProducts();
      if (expandedProductId) {
        await loadBatchesForProduct(expandedProductId);
      }
    } catch (error) {
      console.error(error);
      setMessage('Could not add batch');
    } finally {
      setBatchSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0a2e2a] px-3.5 py-2.5 text-sm font-semibold text-[#bbed3b]"
            >
              <Plus size={16} /> Add Product
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-800"
            >
              <ShoppingCart size={16} /> Cart {selectedCount > 0 ? `(${selectedCount})` : ''}
            </button>
            <button
              onClick={() => setSelected({})}
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

        {filter === 'expiry' && (
          <div className="mb-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Showing medicines expiring in the next 90 days, sorted by nearest expiry first.
          </div>
        )}

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
              const stock = resolveStock(product);
              const batch = product.batch_no || product['Batch Number'] || '';
              const expiry = product.expiry_date || product['Expiry Date'] || '-';
              const price = resolvePrice(product);
              const category = product.category || 'OTC';
              const selectedQty = selected[id]?.qty || 0;
              const productBatches = batchesByProduct[id] || [];
              const earliestExpiry = productBatches.find((batchItem: any) => batchItem.expiry_date || batchItem['Expiry Date'])?.expiry_date
                || productBatches.find((batchItem: any) => batchItem.expiry_date || batchItem['Expiry Date'])?.['Expiry Date']
                || expiry;
              const batchLabel = batch ? `Batch ${batch}` : '+ Add Batch';
              return (
                <article key={id} className="rounded-2xl border border-gray-100 bg-white px-3 py-3 transition hover:border-emerald-100 hover:shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleBillItem(product, id)}
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
                            className={`rounded-full px-2.5 py-1 font-semibold transition ${
                              batch
                                ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {batchLabel}
                          </button>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-700">Earliest Exp: {earliestExpiry}</span>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-700">Stock: {formatStockLabel(product)}</span>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-700">Form: {category}</span>
                          {resolvePurchasePrice(product) > 0 ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">Buy: Rs {resolvePurchasePrice(product).toFixed(2)}</span>
                          ) : null}
                        </div>
                        {filter === 'expiry' && getExpiryDays(product) !== null && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
                        <span>{getExpiryDays(product)} day(s) left</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-2.5">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${stock === 0 ? 'bg-red-50' : stock < 20 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                        <Package size={13} className={stock === 0 ? 'text-red-500' : stock < 20 ? 'text-amber-600' : 'text-emerald-600'} />
                        <div className="leading-tight">
                          <p className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${stock === 0 ? 'text-red-500' : stock < 20 ? 'text-amber-600' : 'text-emerald-600'}`}>Stock</p>
                        <p className={`text-sm font-semibold ${stock === 0 ? 'text-red-700' : stock < 20 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {formatStockLabel(product)}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2">
                        <div className="leading-tight">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">Rate</p>
                          <p className="text-sm font-semibold text-gray-900">Rs {price.toFixed(2)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpandedProduct(id)}
                        className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-700"
                        title={expandedProductId === id ? 'Hide batches' : 'Show batches'}
                      >
                        <Package size={14} />
                      </button>

                      <button
                        onClick={() => toggleBillItem(product, id)}
                        className={`grid h-9 w-9 place-items-center rounded-full ${
                          selected[id] ? 'bg-emerald-600 text-white' : 'bg-[#0a2e2a] text-[#bbed3b]'
                        }`}
                        title={selected[id] ? 'Added to bill' : 'Add to bill'}
                      >
                        <ShoppingCart size={14} />
                      </button>

                      {selected[id] ? (
                        <button
                          onClick={() => removeBillItem(id)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-600"
                          title="Clear from bill"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
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
                        {(batchesByProduct[id] || []).length > 0 ? (
                          batchesByProduct[id].map((batchItem: any, batchIndex: number) => {
                            const batchNo = batchItem.batch_no || batchItem['Batch Number'] || 'Missing';
                            const batchExpiry = batchItem.expiry_date || batchItem['Expiry Date'] || '-';
                            const batchStock = Number(batchItem.available_base_units ?? batchItem['Current Stock'] ?? 0);
                            const batchPrice = Number(batchItem.purchase_rate_per_base ?? batchItem.unit_price ?? batchItem['Unit Price'] ?? batchItem.mrp_per_base ?? batchItem['MRP'] ?? 0);
                            const sellingPrice = Number(batchItem.selling_price ?? batchItem['Selling Price'] ?? batchItem.mrp ?? batchItem['MRP'] ?? 0);
                            const supplier = batchItem.supplier_name || batchItem['Supplier Name'] || '';
                            return (
                              <div key={`${batchNo}-${batchIndex}`} className="rounded-xl border border-gray-100 bg-white px-3 py-2">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                                  <span className="font-semibold text-gray-900">Batch {batchNo}</span>
                                  <span>Exp {batchExpiry}</span>
                                  <span>{formatPackAmount(batchStock, product)}</span>
                                  {supplier ? <span>Supplier {supplier}</span> : null}
                                  {batchPrice ? <span>Buy Rs {batchPrice.toFixed(2)}</span> : null}
                                  {sellingPrice ? <span>Sell Rs {sellingPrice.toFixed(2)}</span> : null}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-gray-500">
                            {loadingBatchesId === id ? 'Loading batches...' : 'No batch details found'}
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
                          <p className="text-sm text-emerald-800">Use this when preparing the bill</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-xs text-emerald-700">
                              Line Total: Rs {(selectedQty * price).toFixed(2)}
                            </span>
                            <span className="text-xs text-emerald-700">
                              Bill Total: Rs {billTotal.toFixed(2)}
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
                            type="number"
                            min="0"
                            value={selectedQty}
                            onChange={(e) => setBillQty(id, e.target.value === '' ? 0 : Number(e.target.value))}
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
                    const price = resolvePrice(item.product);
                    return (
                      <div key={id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold leading-tight text-[#061412]">{resolveMedicineTitle(item.product)}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{resolveCompany(item.product) || 'Selected medicine'} • Rs {price.toFixed(2)} each</p>
                          </div>
                          <button onClick={() => removeBillItem(id)} className="rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <QtyButton label="-" onClick={() => setBillQty(id, item.qty - 1)} />
                            <input
                              type="number"
                              min={0}
                              value={item.qty}
                              onChange={(e) => setBillQty(id, e.target.value === '' ? 0 : Number(e.target.value))}
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
              <button className="mt-4 w-full rounded-2xl bg-[#bbed3b] px-4 py-3 text-sm font-semibold text-[#0a2e2a]">
                Create Bill
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
                <Field label="Batch Number" value={batchForm.batch_no} onChange={(value) => setBatchForm({ ...batchForm, batch_no: value })} required />
                <Field label="Expiry Date" value={batchForm.expiry_date} onChange={(value) => setBatchForm({ ...batchForm, expiry_date: value })} type="date" required />
                <Field label="Quantity" value={String(batchForm.quantity)} onChange={(value) => setBatchForm({ ...batchForm, quantity: Number(value) || 0 })} type="number" required />
                <Field label="Supplier Name" value={batchForm.supplier_name} onChange={(value) => setBatchForm({ ...batchForm, supplier_name: value })} />
                <Field label="Purchase Price" value={batchForm.purchase_rate_per_base} onChange={(value) => setBatchForm({ ...batchForm, purchase_rate_per_base: value })} type="number" />
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
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400">Quick create</p>
                <h3 className="text-xl font-semibold text-[#0a2e2a]">Add Product</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="rounded-full border border-gray-200 p-2 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Medicine Name" value={form.medicine_name} onChange={(value) => setForm({ ...form, medicine_name: value })} required />
                <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
                <Field label="Generic Name" value={form.generic_name} onChange={(value) => setForm({ ...form, generic_name: value })} />
                <Field label="Brand Name" value={form.brand_name} onChange={(value) => setForm({ ...form, brand_name: value })} />
                <Field label="Initial Stock" value={String(form.stock)} onChange={(value) => setForm({ ...form, stock: Number(value) || 0 })} type="number" />
                <Field label="Barcode" value={form.barcode} onChange={(value) => setForm({ ...form, barcode: value })} />
                <Field label="Batch No" value={form.batch_no} onChange={(value) => setForm({ ...form, batch_no: value })} />
                <Field label="Expiry Date" value={form.expiry_date} onChange={(value) => setForm({ ...form, expiry_date: value })} type="date" />
                <Field label="MRP" value={String(form.mrp)} onChange={(value) => setForm({ ...form, mrp: Number(value) || 0 })} type="number" />
                <Field label="Selling Price" value={String(form.selling_price)} onChange={(value) => setForm({ ...form, selling_price: Number(value) || 0 })} type="number" />
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
                <div className="grid gap-3 md:grid-cols-3">
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
                <button type="button" onClick={() => setDrawerOpen(false)} className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-[#0a2e2a] px-4 py-3 text-sm font-semibold text-[#bbed3b] disabled:opacity-70"
                >
                  {saving ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default ProductTable;




