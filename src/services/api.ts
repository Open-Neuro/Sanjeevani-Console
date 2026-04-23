import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

// Helper to get auth headers
const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('sanjeevani_token');
    const headers: Record<string, string> = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Generic fetch wrapper
const authFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...getHeaders((options.body instanceof FormData) ? '' : 'application/json'),
            ...(options.headers || {}),
        },
    });

    if (response.status === 401) {
        // Optional: Handle token expiration/unauthorized
        console.warn('Unauthorized request - redirecting or clearing token potentially');
    }

    return response;
};

export const apiGet = async (path: string) => {
    const response = await authFetch(`${API_BASE_URL}${path}`);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return response.json();
};

export const fetchDashboardOverview = async () => {
    const response = await authFetch(`${API_BASE_URL}/dashboard/overview`);
    if (!response.ok) throw new Error('Failed to fetch dashboard overview');
    return response.json();
};

export const fetchDashboardProducts = async () => {
    const response = await authFetch(`${API_BASE_URL}/dashboard/products`);
    if (!response.ok) throw new Error('Failed to fetch dashboard products');
    return response.json();
};

export const fetchOperationalStatus = async () => {
    return apiGet('/dashboard/ops-status');
};

export const fetchRefillAlerts = async () => {
    const response = await authFetch(`${API_BASE_URL}/alerts/refills`);
    if (!response.ok) throw new Error('Failed to fetch refill alerts');
    return response.json();
};

export const fetchAllAlerts = async (limit = 10) => {
    const response = await authFetch(`${API_BASE_URL}/alerts/?page_size=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
};

export const fetchInventoryAlerts = async () => {
    const response = await authFetch(`${API_BASE_URL}/products/low-stock`);
    if (!response.ok) throw new Error('Failed to fetch inventory alerts');
    return response.json();
};

export const fetchExpiryRisk = async () => {
    return apiGet('/products/expiry-risk');
};

export const fetchRecentOrders = async (limit = 5) => {
    const response = await authFetch(`${API_BASE_URL}/orders/?page_size=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent orders');
    return response.json();
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to update order status');
    }
    return data;
};

export const confirmOrder = async (orderId: string) => {
    const response = await authFetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
        method: 'POST',
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to confirm order');
    }
    return data;
};

export const fetchProducts = async (page = 1, pageSize = 20, search = '', category = '') => {
    let url = `${API_BASE_URL}/products/?page=${page}&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const response = await authFetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const searchProducts = async (query = '', barcode = '', limit = 20) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (barcode) params.set('barcode', barcode);
    params.set('limit', String(limit));

    const response = await authFetch(`${API_BASE_URL}/products/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
};

export const addProduct = async (product: any) => {
    const response = await authFetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to add product');
    return response.json();
};

export const bulkAddProducts = async (products: any[]) => {
    const response = await authFetch(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        body: JSON.stringify(products),
    });
    if (!response.ok) throw new Error('Failed to bulk add products');
    return response.json();
};

export const applyStockActions = async (payload: any, idempotencyKey?: string) => {
    const response = await authFetch(`${API_BASE_URL}/products/stock-actions`, {
        method: 'POST',
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Failed to apply stock action');
    }
    return data;
};

export const counterScan = async (payload: any) => {
    const response = await authFetch(`${API_BASE_URL}/products/counter/scan`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Failed to resolve barcode');
    }
    return data;
};

export const confirmCounterSale = async (payload: any, idempotencyKey?: string) => {
    const response = await authFetch(`${API_BASE_URL}/products/counter/confirm-sale`, {
        method: 'POST',
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Failed to confirm counter sale');
    }
    return data;
};

export const fetchProductBatches = async (productId: string) => {
    const response = await authFetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/batches`);
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Failed to fetch product batches');
    }
    return data;
};

export const fetchProductLedger = async (productId: string) => {
    const response = await authFetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/ledger`);
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.detail || data.message || 'Failed to fetch product ledger');
    }
    return data;
};

export const fetchCustomers = async (page = 1, pageSize = 20, search = '') => {
    let url = `${API_BASE_URL}/customers/?page=${page}&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await authFetch(url);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
};

export const fetchAIInsights = async () => {
    const response = await authFetch(`${API_BASE_URL}/dashboard/overview`);
    if (!response.ok) throw new Error('Failed to fetch AI insights');
    return response.json();
};

export const fetchTimeSeries = async (metric = 'orders', period = '30d') => {
    const response = await authFetch(`${API_BASE_URL}/dashboard/timeseries?metric=${metric}&period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch time series data');
    return response.json();
};

export const testAgents = async () => {
    const response = await authFetch(`${API_BASE_URL}/orders/test-agents`, {
        method: 'POST',
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to trigger agent test');
    }
    return response.json();
};
