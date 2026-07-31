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


export type SessionUser = StoredUser & {
  accessToken: string;
  /** Only the field the app reads off Supabase's `User.app_metadata` — see PROVIDER_CONFIG. */
  app_metadata?: {
    providers?: string[];
  };
};


export interface LoginFormData {
  email: string
  password: string
}

/** Editable profile fields; the edit form's schema resolves to a compatible shape. */
export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
