import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Get the full URL
                const urlParams = new URLSearchParams(window.location.search);
                let token = urlParams.get('token');

                // If no token in query params, try to get it from hash
                if (!token && window.location.hash) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    token = hashParams.get('token');
                }

                // If still no token, try to parse from the URL state parameter
                if (!token) {
                    const stateParam = urlParams.get('state');
                    if (stateParam) {
                        try {
                            const decodedState = decodeURIComponent(stateParam);
                            const stateUrl = new URL(decodedState);
                            token = stateUrl.searchParams.get('token');
                        } catch (e) {
                            console.error('Failed to parse state parameter', e);
                        }
                    }
                }

                if (token) {
                    console.log('AuthCallback: Token found, attempting login...');
                    // Store token and trigger context update
                    // Note: AuthContext will now fetch and wait for the real profile
                    const user = await login(token, {}); 
                    
                    if (user) {
                        console.log('AuthCallback: Login successful, navigating to dashboard');
                        // Redirect to root, where App.tsx routing will handle the logic
                        navigate('/', { replace: true });
                    } else {
                        console.error('AuthCallback: Failed to fetch user profile.');
                        setError('We received your login, but could not load your profile. The server might be slow (cold start).');
                        setTimeout(() => {
                            navigate('/login', { replace: true });
                        }, 5000);
                    }
                } else {
                    // No token found, redirect to login
                    console.error('AuthCallback: No token found in URL.');
                    setError('Authentication failed. No token received from the login service.');
                    setTimeout(() => {
                        navigate('/login', { replace: true });
                    }, 3000);
                }
            } catch (err) {
                console.error('AuthCallback: Unexpected error during handling:', err);
                setError('A technical error occurred during sign in. Please check your internet connection.');
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 4000);
            }
        };

        handleAuth();
    }, [navigate]);

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                {error ? (
                    <>
                        <div className="text-red-500 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">{error}</p>
                        <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C3831] mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Completing sign in...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
