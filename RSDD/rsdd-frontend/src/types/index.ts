export interface UserProfile {
  id: number;
  role?: string | null;
  address?: string | null;
  university?: string | null;
  email?: string | null;
  profile_picture?: string | null;
  initials?: string | null;
  academic_department?: any | null;
  administrative_department?: any | null;
  titles?: any[];
}

export interface User {
  id: number;
  username: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string | null;
  last_login?: string | null;
  profile?: UserProfile | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string; // "Bearer"
  expires_in: number;
  user: User;
}
