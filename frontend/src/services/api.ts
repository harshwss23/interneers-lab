import { Product } from "../types/product";

const BASE_URL = "http://localhost:8000/api";

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
};

export interface ProductFilters {
    search?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    created_by?: string;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category_id) params.append("category_id", filters.category_id);
    if (filters.min_price) params.append("min_price", filters.min_price.toString());
    if (filters.max_price) params.append("max_price", filters.max_price.toString());
    if (filters.created_by) params.append("created_by", filters.created_by);

    const url = `${BASE_URL}/products/?${params.toString()}`;
    const res = await fetch(url, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
};

export const getCategories = async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/categories/`, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
};

export const createProduct = async (data: Partial<Product>) => {
    const res = await fetch(`${BASE_URL}/products/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create product');
    return json.data;
};

export const createCategory = async (title: string, description: string = "") => {
    const res = await fetch(`${BASE_URL}/categories/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title, description }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create category');
    return json.data;
};

export const getProductById = async (id: string): Promise<Product> => {
    const res = await fetch(`${BASE_URL}/products/${id}/`, { headers: getHeaders() });
    const json = await res.json();
    return json.data;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
    const res = await fetch(`${BASE_URL}/products/${id}/`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update product');
    return json.data;
};

export const deleteProduct = async (id: string) => {
    const res = await fetch(`${BASE_URL}/products/${id}/`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete product');
    return json;
};

export const bulkUploadProducts = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const headers = getHeaders();
    // Remove Content-Type to let fetch set the boundary
    delete (headers as any)["Content-Type"];

    const res = await fetch(`${BASE_URL}/products/bulk-upload/`, {
        method: "POST",
        headers: headers,
        body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to bulk upload products');
    return json;
};

// Warehouse APIs
export interface Warehouse {
    id: string;
    name: string;
    location: string;
    manager_id: string;
    capacity: number;
}

export interface InventoryStock {
    product_id: string;
    warehouse_id: string;
    quantity: number;
    reorder_threshold: number;
}

export const getWarehouses = async (): Promise<Warehouse[]> => {
    const res = await fetch(`${BASE_URL}/warehouses/`, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
};

export const getWarehouse = async (warehouseId: string): Promise<Warehouse> => {
    const res = await fetch(`${BASE_URL}/warehouses/${warehouseId}/`, { headers: getHeaders() });
    const json = await res.json();
    return json.data;
};

export const getWarehouseStock = async (warehouseId: string): Promise<InventoryStock[]> => {
    const res = await fetch(`${BASE_URL}/warehouses/${warehouseId}/stock/`, { headers: getHeaders() });
    const json = await res.json();
    return json.data || [];
};

export const adjustStock = async (warehouseId: string, productId: string, quantity: number, type: 'IN' | 'OUT', remarks: string = "") => {
    const res = await fetch(`${BASE_URL}/warehouses/${warehouseId}/stock/adjust/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ product_id: productId, quantity, movement_type: type, remarks })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to adjust stock');
    return json.data;
};