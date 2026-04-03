import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'extracting' | 'syncing' | 'finalizing'>('extracting');
    const [showManualProceed, setShowManualProceed] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    const handleAuth = useCallback(async () => {
        try {
            setDebugInfo('Extracting token from URL...');
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
                setStatus('syncing');
                setDebugInfo('Token found. Saving session and fetching user profile...');
                
                // Show manual proceed button after 6 seconds if sync is slow
                const timer = setTimeout(() => setShowManualProceed(true), 6000);

                // This now sets token immediately and then fetches profile
                const user = await login(token, {}); 
                
                clearTimeout(timer);
                
                if (user) {
                    setStatus('finalizing');
                    setDebugInfo('Profile fetched! Redirecting to dashboard...');
                    setTimeout(() => navigate('/dashboard', { replace: true }), 300);
                } else {
                    console.error('AuthCallback: Failed to fetch user profile.');
                    setDebugInfo('Profile fetch failed or timed out. You might be offline or the server is waking up.');
                    setError('We received your login, but could not load your profile details from the server.');
                    setShowManualProceed(true);
                }
            } else {
                console.error('AuthCallback: No token found in URL.');
                setDebugInfo('No token was found in the redirection URL.');
                setError('Authentication failed. No secure token received from the login service.');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        } catch (err) {
            console.error('AuthCallback: Unexpected error:', err);
            setDebugInfo(`Technical error: ${err instanceof Error ? err.message : String(err)}`);
            setError('A technical error occurred during sign in. Please check your internet connection.');
            setTimeout(() => navigate('/login', { replace: true }), 5000);
        }
    }, [login, navigate]);

    useEffect(() => {
        handleAuth();
    }, [handleAuth]);

    const handleManualProceed = () => {
        console.log('User triggered manual proceed');
        navigate('/', { replace: true });
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#f4f7f6] font-sans">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
                    
                    {!error ? (
                        <>
                            <div className="relative w-20 h-20 mx-auto mb-8">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                                <Loader2 className="w-20 h-20 text-[#0C3831] animate-spin relative z-10" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-[#0C3831] mb-2">
                                {status === 'extracting' ? 'Identifying Session' : 
                                 status === 'syncing' ? 'Synchronizing Data' : 'Rounding Up'}
                            </h2>
                            
                            <p className="text-gray-500 mb-6 px-4">
                                {status === 'extracting' ? 'Reading your secure credentials...' : 
                                 status === 'syncing' ? 'Connecting to Sanjeevani Secure Cloud...' : 'Preparing your workspace...'}
                            </p>

                            <div className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-400 text-left overflow-hidden whitespace-nowrap text-ellipsis border border-gray-100">
                                <span className="text-[#16a34a] mr-2">➜</span> {debugInfo}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Auth Sync Halted</h2>
                            <p className="text-red-500 font-medium mb-6">{error}</p>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0C3831] text-white rounded-xl font-semibold hover:bg-[#0f4a41] transition-all"
                                >
                                    <RefreshCw size={18} /> Retry Synchronization
                                </button>
                                
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </>
                    )}

                    {showManualProceed && !error && (
                        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <p className="text-sm text-gray-400 mb-4 italic">
                                Sync taking longer than expected? This usually means the server is waking up.
                            </p>
                            <button 
                                onClick={handleManualProceed}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#d4ed66] text-[#0C3831] rounded-xl font-bold hover:brightness-105 transition-all shadow-sm"
                            >
                                Proceed to Dashboard Anyway <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
                
                <p className="mt-8 text-center text-gray-400 text-sm">
                    SanjeevaniRxAI Secure Authentication Layer v2.1
                </p>
            </div>
        </div>
    );
};

export default AuthCallback;
