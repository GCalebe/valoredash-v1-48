export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  benefits?: string[];
  objections?: string[];
  has_combo: boolean;
  has_upgrade: boolean;
  has_promotion: boolean;
  differentials?: string[];
  success_cases?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProductCombo {
  id: string;
  name: string;
  description?: string;
  discount_percentage?: number;
  created_at: string;
  products?: Product[];
}

export interface ProductFormData {
  name: string;
  price: number;
  description?: string;
  benefits: string[];
  objections: string[];
  has_combo: boolean;
  has_upgrade: boolean;
  has_promotion: boolean;
  differentials: string[];
  success_cases: string[];
}