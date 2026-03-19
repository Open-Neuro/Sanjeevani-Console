import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the shape of our User data based on what the backend provides
export interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    picture?: string;
    provider?: string;
    role?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: UserProfile | null;
    token: string | null;
    login: (token: string, profile: UserProfile) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: fetch with a timeout so Render.com cold starts don't hang forever
const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
};

// Loading spinner shown while auth state is resolving
const AuthLoadingScreen = () => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0C3831 0%, #0f5145 100%)',
    }}>
        {/* Animated logo mark */}
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

        {/* Brand name */}
        <p style={{
            color: '#ffffff', fontSize: 20, fontWeight: 700,
            letterSpacing: 1, marginBottom: 6, fontFamily: 'system-ui, sans-serif'
        }}>SanjeevaniRxAI</p>
        <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: 13,
            fontFamily: 'system-ui, sans-serif', fontWeight: 500
        }}>Loading your workspace…</p>

        {/* Animated dots */}
        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#d4ed66',
                    display: 'inline-block',
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
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            let currentToken = localStorage.getItem('sanjeevani_token');

            // 1. Check if token is in the URL (from Google OAuth callback)
            const params = new URLSearchParams(window.location.search);
            const urlToken = params.get('token');

            if (urlToken) {
                currentToken = urlToken;
                localStorage.setItem('sanjeevani_token', urlToken);

                // Clean the URL without reloading the page
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // 2. If token exists, fetch current user profile (with 5s timeout)
            if (currentToken) {
                setToken(currentToken);
                try {
                    const response = await fetchWithTimeout(
                        'https://sanjeevanirxai-system.onrender.com/api/v1/auth/me',
                        { headers: { 'Authorization': `Bearer ${currentToken}` } },
                        5000
                    );

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData.user || userData);
                    } else {
                        // Unauthorized or token expired, clear invalid session
                        localStorage.removeItem('sanjeevani_token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (e) {
                    console.error("Failed to fetch user session (timeout or network error)", e);
                    // On timeout/error, keep the token but don't block — redirect to login
                    localStorage.removeItem('sanjeevani_token');
                    setToken(null);
                    setUser(null);
                }
            } else {
                setToken(null);
                setUser(null);
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (newToken: string, profile: UserProfile) => {
        setToken(newToken);
        setUser(profile);
        localStorage.setItem('sanjeevani_token', newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('sanjeevani_token');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
