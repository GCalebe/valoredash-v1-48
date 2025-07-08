export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  last_sign_in_at: string | null;
  ai_access: string[]; // IDs of AI products the user has access to
}

export interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'user';
  ai_access: string[];
}