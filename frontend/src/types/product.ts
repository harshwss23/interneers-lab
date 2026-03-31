export interface Product {
    id: string;
    name: string;
    description: string;
    brand: string;
    category_id?: string;
    category_name?: string;
    price: number;
    quantity: number;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}