import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
    id?: string;
    pharmacy_id?: string;
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
    login: (token: string, profile: UserProfile) => Promise<UserProfile | null>;
    logout: () => void;
    updateUser: (data: Partial<UserProfile>) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractTokenFromUrl = (): string | null => {
    try {
        const searchToken = new URLSearchParams(window.location.search).get('token');
        if (searchToken) return searchToken;

        const hash = window.location.hash || '';
        const hashQueryIndex = hash.indexOf('?');
        if (hashQueryIndex >= 0) {
            const hashQuery = hash.substring(hashQueryIndex + 1);
            const hashToken = new URLSearchParams(hashQuery).get('token');
            if (hashToken) return hashToken;
        }
    } catch (e) {
        console.error('AuthProvider: failed to parse token from URL', e);
    }
    return null;
};

const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs = 25000) => {
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
    const urlToken = extractTokenFromUrl();
    const [user, setUser] = useState<UserProfile | null>(() => {
        const cachedUser = localStorage.getItem('sanjeevani_user');
        try {
            return cachedUser ? JSON.parse(cachedUser) : null;
        } catch (e) {
            console.error("AuthProvider: Failed to parse cached user", e);
            return null;
        }
    });
    const [token, setToken] = useState<string | null>(() => {
        const localToken = localStorage.getItem('sanjeevani_token');
        const activeToken = localToken || urlToken;
        if (activeToken && activeToken !== localToken) {
            localStorage.setItem('sanjeevani_token', activeToken);
        }
        return activeToken;
    });
    const [loading, setLoading] = useState(Boolean(localStorage.getItem('sanjeevani_token') || urlToken));

    const fetchProfile = useCallback(async (authToken: string) => {
        const authBaseUrl = import.meta.env.VITE_AUTH_API_URL || 'https://sanjeevani-auth.onrender.com';
        const url = `${authBaseUrl}/auth/me`;
        console.log(`AuthProvider: Fetching profile from ${url}...`);
        try {
            const response = await fetchWithTimeout(
                url,
                { headers: { 'Authorization': `Bearer ${authToken}` } },
                25000
            );

            if (response.ok) {
                const userData = await response.json();
                const finalUser = userData.user || userData;
                console.log("AuthProvider: Profile fetched successfully for:", finalUser.email);
                setUser(finalUser);
                localStorage.setItem('sanjeevani_user', JSON.stringify(finalUser));
                return finalUser;
            } else if (response.status === 401 || response.status === 403 || response.status === 404) {
                console.error(`AuthProvider: Session invalid (HTTP ${response.status}) at ${url}. Clearing storage.`);
                logout();
            } else {
                console.error(`AuthProvider: API error ${response.status} at ${url}`);
            }
        } catch (e) {
            console.error(`AuthProvider: Profile fetch failed at ${url}:`, e);
        }
        return null;
    }, []);

    // Initial load
    useEffect(() => {
        let mounted = true;
        const watchdog = window.setTimeout(() => {
            if (mounted) {
                console.warn("AuthProvider: loading watchdog triggered. Releasing UI.");
                setLoading(false);
            }
        }, 8000);

        const initAuth = async () => {
            try {
                if (token) {
                    await fetchProfile(token);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        return () => {
            mounted = false;
            window.clearTimeout(watchdog);
        };
    }, [token, fetchProfile]);

    const login = async (newToken: string, profile: UserProfile): Promise<UserProfile | null> => {
        console.log("AuthProvider: Login triggered - Setting token immediately");
        localStorage.setItem('sanjeevani_token', newToken);
        setToken(newToken);
        
        if (profile && Object.keys(profile).length > 0) {
            setUser(profile);
            localStorage.setItem('sanjeevani_user', JSON.stringify(profile));
            setLoading(false);
            return profile;
        } else {
            // We set loading true to show the sync screen, but token is already in state
            setLoading(true);
            const fetchedUser = await fetchProfile(newToken);
            setLoading(false);
            return fetchedUser;
        }
    };

    const updateUser = (data: Partial<UserProfile>) => {
        setUser(prev => {
            const newUser = prev ? { ...prev, ...data } : null;
            if (newUser) {
                localStorage.setItem('sanjeevani_user', JSON.stringify(newUser));
            }
            return newUser;
        });
    };

    const logout = () => {
        console.log("AuthProvider: Logging out...");
        localStorage.removeItem('sanjeevani_token');
        localStorage.removeItem('sanjeevani_user');
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
