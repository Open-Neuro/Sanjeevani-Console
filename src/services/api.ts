const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

export const fetchDashboardOverview = async () => {
    const response = await authFetch(`${API_BASE_URL}/dashboard/overview`);
    if (!response.ok) throw new Error('Failed to fetch dashboard overview');
    return response.json();
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
