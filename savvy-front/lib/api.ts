import axios from 'axios';
import { BudgetCreate } from '@/types/budget';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: เพิ่ม access token ในทุก request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const loginUser = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await apiClient.post('/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData: {
    username: string,
    email: string,
    password: string,
    full_name?: string,
}) => {
    try {
        const response = await apiClient.post('/users', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/users/me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getReceipts = async (params: {
    skip?: number,
    limit?: number,
    vendor?: string,
    category_id?: number,
    start_date?: string,
    end_date?: string,
    min_amount?: number,
    max_amount?: number,
}) => {
    try {
        const response = await apiClient.get('/receipts', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getReceiptById = async (receiptId: number) => {
    try {
        const response = await apiClient.get(`/receipts/${receiptId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateReceiptCategory = async (receiptId: number, categoryId: number) => {
    try {
        const response = await apiClient.put(`/receipts/${receiptId}/category`, { category_id: categoryId });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createImapSetting = async (imapData: {
    email: string,
    server: string,
    port: number,
    username: string,
    password: string,
    use_ssl: boolean,
    folder: string,
}) => {
    try {
        const response = await apiClient.post('/imap-settings', imapData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getImapSettings = async () => {
    try {
        const response = await apiClient.get('/imap-settings');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const syncEmails = async (imapSettingId: number, daysBack: number = 30, limit: number = 50) => {
    try {
        const response = await apiClient.post(`/imap-settings/${imapSettingId}/sync`, null, {
            params: { days_back: daysBack, limit }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAnalyticsSummary = async () => {
    try {
        const response = await apiClient.get('/analytics/summary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMonthlyExpenses = async (year?: number, months: number = 12) => {
    try {
        const response = await apiClient.get('/analytics/monthly', {
            params: { year, months }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCategoryExpenses = async (startDate?: string, endDate?: string) => {
    try {
        const response = await apiClient.get('/analytics/categories-summary', {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// All-time spending grouped by category (used by the dashboard breakdown).
export const getCategoryBreakdown = async (limit = 8) => {
    const response = await apiClient.get('/analytics/categories', { params: { limit } });
    return response.data;
};

export const getVendorExpenses = async (limit?: number) => {
    try {
        const response = await apiClient.get('/analytics/vendors', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getBudgets = async (month?: number, year?: number) => {
    try {
        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const response = await apiClient.get('/budgets', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createBudget = async (budgetData: BudgetCreate) => {
    try {
        const response = await apiClient.post('/budgets', budgetData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBudget = async (budgetId: number, budgetData: Partial<BudgetCreate>) => {
    try {
        const response = await apiClient.put(`/budgets/${budgetId}`, budgetData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBudget = async (budgetId: number) => {
    try {
        const response = await apiClient.delete(`/budgets/${budgetId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getBudgetComparisons = async (month?: number, year?: number) => {
    try {
        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const response = await apiClient.get('/analytics/budget-comparison', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default apiClient;