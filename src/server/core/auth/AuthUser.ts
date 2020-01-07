export interface AuthUser {
  id: string;
  permissions: string[];
  roles: string[];
  centreId?: string;
  fullName?: string;
}
