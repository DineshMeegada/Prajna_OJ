
export interface User {
    pk: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'CODER' | 'MASTER' | 'ADMIN';
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
