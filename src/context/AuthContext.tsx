import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
    provider?: string;
    role?: string;
    global_role?: string;
    subscription_plan?: string;
    
    // Pharmacy Details
    pharmacy_name?: string;
    owner_name?: string;
    license_number?: string;
    store_type?: string;
    phone_number?: string;
    address?: string;
    
    [key: string]: any;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    login: (token: string, profile: UserProfile) => void;
    logout: () => void;
    updateUser: (data: Partial<UserProfile>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

const AuthLoadingScreen = () => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0C3831 0%, #0f5145 100%)',
    }}>
        <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4ed66, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(212,237,102,0.35)',
            animation: 'rxPulse 1.6s ease-in-out infinite',
            marginBottom: 24,
        }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#0C3831', letterSpacing: -1 }}>Rx</span>
        </div>
        <p style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SanjeevaniRxAI</p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Synchronizing user data...</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#d4ed66',
                    animation: `rxBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
            ))}
        </div>
        <style>{`
            @keyframes rxPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(212,237,102,0.35); }
                50% { transform: scale(1.08); box-shadow: 0 0 60px rgba(212,237,102,0.55); }
            }
            @keyframes rxBounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
                40% { transform: translateY(-10px); opacity: 1; }
            }
        `}</style>
    </div>
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('sanjeevani_token'));
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (authToken: string) => {
        console.log("AuthProvider: Fetching profile...");
        try {
            const authBaseUrl = import.meta.env.VITE_AUTH_API_URL || 'https://sanjeevani-auth.onrender.com';
            const response = await fetchWithTimeout(
                `${authBaseUrl}/auth/me`,
                { headers: { 'Authorization': `Bearer ${authToken}` } },
                8000
            );

            if (response.ok) {
                const userData = await response.json();
                const finalUser = userData.user || userData;
                console.log("AuthProvider: Profile fetched:", finalUser.email);
                setUser(finalUser);
                return finalUser;
            } else if (response.status === 401 || response.status === 403 || response.status === 404) {
                console.warn(`AuthProvider: Session invalid or user not found (${response.status}). Clearing.`);
                logout();
            }
        } catch (e) {
            console.error("AuthProvider: Profile fetch failed:", e);
        }
        return null;
    }, []);

    // Initial load
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                await fetchProfile(token);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (newToken: string, profile: UserProfile) => {
        console.log("AuthProvider: Login triggered");
        localStorage.setItem('sanjeevani_token', newToken);
        setToken(newToken);
        
        if (profile && Object.keys(profile).length > 0) {
            setUser(profile);
            setLoading(false);
        } else {
            setLoading(true);
            await fetchProfile(newToken);
            setLoading(false);
        }
    };

    const updateUser = (data: Partial<UserProfile>) => {
        setUser(prev => prev ? { ...prev, ...data } : null);
    };

    const logout = () => {
        console.log("AuthProvider: Logging out...");
        localStorage.removeItem('sanjeevani_token');
        setToken(null);
        setUser(null);
        setTimeout(() => {
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }, 100);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {loading ? <AuthLoadingScreen /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
