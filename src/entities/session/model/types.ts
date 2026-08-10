import type { Database } from '@/shared/api';

export interface RegisterFormData {
  email: string;
  password: string;
  confirm: string;
}

/** Derived from the generated enum rather than hand-mirrored — the DB is the
 * source of truth and a new role value becomes a type error here. */
export type UserRole = Database['public']['Enums']['user_role'];

export interface StoredUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string | null;
  /** `null` = not resolved yet. useSessionSync dispatches setSession once
   * immediately with blank fields before the `profiles` row lands, so a
   * non-null role is the signal that the profile has actually loaded. */
  role: UserRole | null;
}

export type SessionUser = StoredUser & {
  accessToken: string;
  /** Only the field the app reads off Supabase's `User.app_metadata` — see PROVIDER_CONFIG. */
  app_metadata?: {
    providers?: string[];
  };
};

export interface LoginFormData {
  email: string;
  password: string;
}

/** Editable profile fields; the edit form's schema resolves to a compatible shape. */
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
