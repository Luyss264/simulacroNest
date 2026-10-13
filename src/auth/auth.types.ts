export type UserRole = 'admin' | 'supervisor' | 'asesor'

export interface AuthUser {
    username: string;
    role: UserRole;
}