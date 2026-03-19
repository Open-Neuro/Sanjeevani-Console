import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Box, LineChart } from 'lucide-react';
import Logo3DFooter from '../components/effects/Logo3DFooter';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    // If user is already authenticated, redirect to dashboard
    useEffect(() => {
        if (user || token) {
            navigate('/dashboard');
        }
    }, [user, token, navigate]);

    const handleGoogleLogin = () => {
        // Open Google OAuth in a popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            'https://sanjeevanirxai-system.onrender.com/api/v1/auth/login',
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll the popup to check if it has navigated to callback
        const pollTimer = setInterval(() => {
            try {
                if (popup && popup.location.href.includes('/callback')) {
                    // Try to get the token from the popup URL
                    const popupUrl = new URL(popup.location.href);
                    const token = popupUrl.searchParams.get('token');

                    if (token) {
                        localStorage.setItem('sanjeevani_token', token);
                        popup.close();
                        clearInterval(pollTimer);
                        navigate('/dashboard');
                    }
                }
            } catch (e) {
                // Cross-origin error - popup is still on Google's domain
                // This is expected, keep polling
            }

            // Check if popup was closed
            if (popup && popup.closed) {
                clearInterval(pollTimer);
            }
        }, 500);
    };

    const handleLogin = () => {
        navigate('/dashboard');
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50 overflow-hidden text-pharmlyTextDark">
            <div className="flex w-full h-full max-w-[1600px] mx-auto bg-white shadow-2xl relative">
                {/* Left Section - Branding & Feature Info */}
                <div className="hidden lg:flex w-1/2 bg-[#0C3831] p-12 xl:p-20 flex-col relative overflow-hidden shrink-0">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d4ed66] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 hover:opacity-30 transition-opacity duration-1000"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0f5145] rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>

                    <div className="relative z-10 w-full flex flex-col h-full justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold tracking-widest uppercase mb-10 w-max backdrop-blur-md">
                            <Sparkles size={14} className="text-[#d4ed66]" />
                            NEXT-GEN PHARMACY OS
                        </div>

                        <h1 className="text-4xl xl:text-6xl lg:text-5xl font-black text-white leading-[1.15] mb-6 tracking-tight">
                            Empowering<br />
                            Pharmacies with <span className="text-[#d4ed66]">AI-driven Insights.</span>
                        </h1>

                        <p className="text-[#a1b8b3] text-lg max-w-md leading-relaxed mb-16 font-medium">
                            Manage inventory, forecast demand, and improve patient outcomes with the world's most intelligent pharmacy operating system.
                        </p>

                        <div className="grid grid-cols-2 gap-6 max-w-lg mt-auto">
                            <div className="flex items-start gap-4">
                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-md">
                                    <Box size={24} className="text-[#d4ed66]" />
                                </div>
                                <div className="flex flex-col justify-center h-full pt-0.5">
                                    <h3 className="text-white font-bold text-sm mb-1 tracking-wide">Smart Inventory</h3>
                                    <p className="text-[#a1b8b3] text-xs leading-relaxed">Real-time stock tracking</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-md">
                                    <LineChart size={24} className="text-[#d4ed66]" />
                                </div>
                                <div className="flex flex-col justify-center h-full pt-0.5">
                                    <h3 className="text-white font-bold text-sm mb-1 tracking-wide">Demand Forecast</h3>
                                    <p className="text-[#a1b8b3] text-xs leading-relaxed">AI-powered predictions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Form */}
                <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center relative h-full">

                    {/* Content Container */}
                    <div className="w-full max-w-sm sm:max-w-md xl:max-w-lg px-6 flex flex-col items-center">

                        {/* Centered 3D Logo */}
                        <div className="relative w-56 h-56 xl:w-64 xl:h-64 -mt-8 mb-6 flex items-center justify-center">
                            <Logo3DFooter color="#16a34a" highlightColor="#d4ed66" />
                        </div>

                        <div className="text-center mb-10 w-full">
                            <h1 className="text-3xl lg:text-4xl font-bold mb-4 font-sans tracking-tight">Get Started</h1>
                            <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-6">
                                Log in or create an account to transform your pharmacy operations.
                            </p>
                            <a 
                                 href="https://sanjeevanirxaidashboard.netlify.app/" 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#16a34a] text-white text-sm font-bold hover:bg-[#138a3e] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                             >
                                <Sparkles size={14} className="text-[#d4ed66]" />
                                Visit Live Website
                            </a>
                        </div>

                        {/* OAuth Buttons List */}
                        <div className="flex flex-col gap-4 mb-8 w-full">
                            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3.5 px-6 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-semibold text-gray-700 shadow-sm transform">
                                {/* Google SVG */}
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="whitespace-nowrap">Continue with Google</span>
                            </button>

                            <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 py-3.5 px-6 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-semibold text-gray-700 shadow-sm transform">
                                {/* Facebook SVG */}
                                <svg className="w-5 h-5 text-[#1877F2] shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span className="whitespace-nowrap">Continue with Facebook</span>
                            </button>

                            <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 py-3.5 px-6 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-semibold text-gray-700 shadow-sm transform">
                                {/* Apple SVG */}
                                <svg className="w-5 h-5 text-black shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.67.62 3.48 1.48-2.6 1.49-2.03 4.9.46 5.86-.68 1.87-1.54 3.65-2.59 5.67zm-3.64-15.01c.21-1.79-1-3.37-2.6-3.77-.38 1.77 1.05 3.41 2.6 3.77z" />
                                </svg>
                                <span className="whitespace-nowrap">Continue with Apple</span>
                            </button>
                        </div>

                        <div className="mt-6 text-center px-4">
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                By continuing, you agree to our <br />
                                <a href="#" className="font-bold text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-black transition-colors">Terms of Service</a> & <a href="#" className="font-bold text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-black transition-colors">Privacy Policy</a>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
