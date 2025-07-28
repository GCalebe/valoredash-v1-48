// Temporary type declarations for unknown data during unification
// These should be replaced with proper interfaces once the unification process is complete

export interface AnyObject {
  [key: string]: any;
}

export interface SafeUnknown {
  [key: string]: any;
}

// Temporary user type override
export interface TempUser {
  id?: string;
  email?: string;
  user_metadata?: {
    email?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Temporary settings type override  
export interface TempSettings {
  primaryColor?: string;
  secondaryColor?: string;
  brandName?: string;
  logo?: string;
  [key: string]: any;
}

// Temporary product type override
export interface TempProduct {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  [key: string]: any;
}