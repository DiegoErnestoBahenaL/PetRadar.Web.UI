export interface User {
  id: number;
  email: string;

  password?: string;
  salt?: string;

  name: string;
  lastName: string;
  phoneNumber: string;

  profilePhotoURL?: string | null;
  role: number;

  organizationName?: string | null;
  organizationAddress?: string | null;
  organizationPhone?: string | null;

  emailVerified: boolean;
  isActive: boolean;

  createdBy: number;
  createdAt: string;
  updatedBy: number;
  updatedAt: string;
  deletedBy?: number | null;
  deletedAt?: string | null;
}
