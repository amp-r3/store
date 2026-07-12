import { User } from '@supabase/supabase-js';
export interface RegisterFormData {
  email: string
  password: string
  confirm: string
}


export interface StoredUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string | null;
}


export type SessionUser = Omit<StoredUser, 'password'> & {
  accessToken: string;
} & Partial<User>;


export interface LoginFormData {
  email: string
  password: string
}
