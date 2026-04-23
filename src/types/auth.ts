export interface RegisterFormData {
  firstName: string
  lastName:  string
  username: string
  email:     string
  password:  string
  confirm:   string
}

export interface StoredUser {
  id:        string
  firstName: string
  lastName:  string
  username: string
  email:     string
  password:  string
}

export type SessionUser = Omit<StoredUser, 'password'> & {
  accessToken: string
}

export interface LoginFormData {
  username: string
  email:    string
  password: string
}
