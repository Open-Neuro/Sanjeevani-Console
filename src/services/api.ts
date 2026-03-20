const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const fetchDashboardOverview = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/overview`);
    if (!response.ok) throw new Error('Failed to fetch dashboard overview');
    return response.json();
};

export const fetchRefillAlerts = async () => {
    const response = await fetch(`${API_BASE_URL}/alerts/refills`);
    if (!response.ok) throw new Error('Failed to fetch refill alerts');
    return response.json();
};

export const fetchAllAlerts = async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/alerts/?page_size=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
};

export const fetchInventoryAlerts = async () => {
    const response = await fetch(`${API_BASE_URL}/products/low-stock`);
    if (!response.ok) throw new Error('Failed to fetch inventory alerts');
    return response.json();
};

export const fetchRecentOrders = async (limit = 5) => {
    const response = await fetch(`${API_BASE_URL}/orders/?page_size=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent orders');
    return response.json();
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to update order status');
    }
    return data;
};

export const confirmOrder = async (orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const addProduct = async (product: {
    medicine_name: string;
    category?: string;
    stock?: number;
    generic_name?: string;
    brand_name?: string;
    batch_no?: string;
    expiry_date?: string;
    mrp?: number;
    selling_price?: number;
    schedule?: string;
    prescription_required?: boolean;
}) => {
    const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to add product');
    return response.json();
};

export const bulkAddProducts = async (products: any[]) => {
    const response = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(products),
    });
    if (!response.ok) throw new Error('Failed to bulk add products');
    return response.json();
};

export const fetchCustomers = async (page = 1, pageSize = 20, search = '') => {
    let url = `${API_BASE_URL}/customers/?page=${page}&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
};

export const fetchAIInsights = async () => {
    // This could be from a specific AI endpoint if available
    const response = await fetch(`${API_BASE_URL}/dashboard/overview`);
    if (!response.ok) throw new Error('Failed to fetch AI insights');
    const data = await response.json();
    return data;
};

export const fetchTimeSeries = async (metric = 'orders', period = '30d') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/timeseries?metric=${metric}&period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch time series data');
    return response.json();
};
