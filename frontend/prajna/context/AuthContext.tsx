
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/axios";
import { AuthState, User, AuthResponse } from "@/types/auth";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";


// Define the shape of the Context
interface AuthContextType extends AuthState {
    login: (tokens: { access: string; refresh?: string; user?: User }) => void;
    logout: () => void;
    googleLogin: (idToken: string) => Promise<void>;
    loginWithCredentials: (username: string, password: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // const router = useRouter(); // Removed router dependency
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

    // Fetch user details from backend using the current token
    const fetchUser = async () => {
        try {
            const { data } = await api.get<User>("/user/");
            setState((prev) => ({
                ...prev,
                user: data,
                isAuthenticated: true,
                isLoading: false,
            }));
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("access_token");
            if (token) {
                try {
                    // Check if token is expired
                    const decoded: any = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        // Token expired, let axios interceptor try refresh on next call
                        // We will try fetching user which is a protected route
                        await fetchUser();
                    } else {
                        await fetchUser();
                    }
                } catch (error) {
                    console.error("Token invalid", error);
                    logout();
                }
            } else {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        initializeAuth();
    }, []);

    const setAuthCookie = () => {
        document.cookie = "is_authenticated=true; path=/; max-age=86400; SameSite=Lax";
    };

    const removeAuthCookie = () => {
        document.cookie = "is_authenticated=; path=/; max-age=0";
    };

    const login = async (data: { access: string; refresh?: string; user?: User }) => {
        localStorage.setItem("access_token", data.access);
        // Only set refresh token if provided and not empty
        // If empty (HttpOnly cookie flow), we don't clear existing one as it might be in cookie
        if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
        }

        if (data.user) {
            setState({
                user: data.user,
                isAuthenticated: true,
                isLoading: false
            })
        } else {
            await fetchUser();
        }
        setAuthCookie();
        // router.push("/dashboard"); // Decoupled routing from context
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Also call logout endpoint to clear cookies if needed
        // api.post('/logout/'); 
        setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
        // router.push("/login"); // Optional: component can handle redirect, or we can keep it here if we want global logout redirect.
        // For strict decoupling, we should remove it, but logout usually implies going to public page.
        // Let's remove it to be consistent and handle in components.
        if (typeof window !== 'undefined') {
            removeAuthCookie();
            window.location.href = '/login'; // Force full reload/redirect for logout to clear states cleaner
        }
    };

    const googleLogin = async (accessToken: string) => {
        try {
            const { data } = await api.post("/google/", {
                access_token: accessToken
            });

            await login({
                access: data.access,
                refresh: data.refresh,
                user: data.user
            });
        } catch (error) {
            console.error("Google login failed", error);
            throw error;
        }
    };

    const loginWithCredentials = async (username: string, password: string) => {
        try {
            const { data } = await api.post("/login/", { username, password });
            console.log("LOGIN RESPONSE DATA:", data); // Debugging
            await login({
                access: data.access || data.key || data.token, // try fallbacks
                refresh: data.refresh,
                user: data.user
            });
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const signup = async (signupData: any) => {
        try {
            const { data } = await api.post("/signup/", signupData);
            await login({
                access: data.access,
                refresh: data.refresh,
                user: data.user
            });
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    }

    const updateUser = async () => {
        await fetchUser();
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthContext.Provider value={{ ...state, login, logout, googleLogin, loginWithCredentials, signup, updateUser }}>
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
