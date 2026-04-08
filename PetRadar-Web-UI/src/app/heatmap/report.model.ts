export interface ReportViewModel {
  id: number;
  userId: number;
  userPetId?: number | null;
  species?: string | null;
  breed?: string | null;
  color?: string | null;
  sex?: string | null;
  size?: string | null;
  approximateAge?: number | null;
  weight?: number | null;
  description?: string | null;
  photoURL?: string | null;
  additionalPhotosURL?: string | null;
  isNeutered?: boolean | null;
  reportType?: 'Lost' | 'Found' | 'Stray' | string | null;
  reportStatus?: 'Active' | 'Resolved' | 'Adopted' | 'Cancelled' | string | null;
  hasCollar?: boolean | null;
  hasTag?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  addressText?: string | null;
  searchRadiusMeters?: number | null;
  incidentDate?: string | null;
}