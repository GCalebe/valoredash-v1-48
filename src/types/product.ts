// Interface for objection with question and answer
export interface ProductObjection {
  id?: string;
  question: string;
  answer: string;
}

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
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  benefits?: string[];
  objections?: string[];
  differentials?: string[];
  success_cases?: string[];
  icon?: string;
  image?: string;
  has_combo?: boolean;
  has_upgrade?: boolean;
  has_promotion?: boolean;
  new?: boolean;
  popular?: boolean;
  // Campos condicionais para promoção
  promotion_name?: string;
  promotion_description?: string;
  discount_type?: "percentage" | "fixed";
  discount_percentage?: number;
  discount_amount?: number;
  promotion_start_date?: string;
  promotion_end_date?: string;
  // Campos condicionais para combo
  combo_name?: string;
  combo_description?: string;
  combo_products?: string[];
  combo_benefit?: string;
  combo_discount_percentage?: number;
  // Campos condicionais para upgrade
  upgrade_name?: string;
  upgrade_description?: string;
  upgrade_price?: number;
  upgrade_benefits?: string[];
  upgrade_target_product?: string;
  // Campos para recorrência
  is_recurring?: boolean;
  // Campos para upsell
  has_upsell?: boolean;
  upsell_product?: string;
  // Campos para downsell
  has_downsell?: boolean;
  downsell_product?: string;
}