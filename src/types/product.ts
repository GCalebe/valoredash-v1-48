// Product interface matching the unified products table
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  benefits?: string[];
  objections?: string[];
  differentials?: string[];
  success_cases?: string[];
  features?: string[];
  icon?: string;
  image?: string;
  has_combo: boolean;
  has_upgrade: boolean;
  has_promotion: boolean;
  new?: boolean;
  popular?: boolean;
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

// Form data interface for creating/updating products
export interface ProductFormData {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  benefits?: string[];
  objections?: string[];
  differentials?: string[];
  success_cases?: string[];
  features?: string[];
  icon?: string;
  image?: string;
  has_combo?: boolean;
  has_upgrade?: boolean;
  has_promotion?: boolean;
  new?: boolean;
  popular?: boolean;
}