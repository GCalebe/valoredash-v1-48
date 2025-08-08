export interface SettingsFormData {
  fullName: string;
  email: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  theme: string;
  language: string;
  timezone: string;
  autoBackup: boolean;
  analytics: boolean;
  betaFeatures: boolean;
}


