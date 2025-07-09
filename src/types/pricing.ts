export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  ai_products?: string[]; // IDs of AI products included in this plan
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'boleto' | 'bank_transfer';
  last4?: string;
  lastFour?: string; // Add for compatibility
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  status: 'paid' | 'open' | 'overdue' | 'void';
  dueDate: string;
  date?: string; // Add for compatibility
  paidAt?: string;
  createdAt: string;
}