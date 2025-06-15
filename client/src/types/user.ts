export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isVerified: boolean;
  isAdmin: boolean;
  hasActiveListings?: boolean;
  createdAt: string;
  updatedAt: string;
} 