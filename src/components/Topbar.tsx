import { NavLink } from 'react-router-dom';
import { Settings, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SanjeevaniLogo from './SanjeevaniLogo';

const Topbar = () => {
    const { user } = useAuth();
    const navItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Products', path: '/dashboard/products' },
        { label: 'Orders', path: '/dashboard/orders' },
        { label: 'Sales', path: '/dashboard/sales' },
        { label: 'Customers', path: '/dashboard/customers' },
        { label: 'Payments', path: '/dashboard/payments' },
        { label: 'AI Insights', path: '/dashboard/ai-insights' },
    ];

    return (
        <nav className="flex flex-col md:flex-row items-center justify-between py-1.5 w-full mb-2 gap-2 md:gap-0 shrink-0">
            {/* Logo and Right Icons Row on Mobile */}
            <div className="flex items-center justify-between w-full md:w-auto">
                {/* Logo area */}
                <div className="flex items-center group px-4">
                    <SanjeevaniLogo iconColor="#000000" iconAccent="#d4ed66" textColor="#000000" height={24} />
                </div>

                {/* Right Icons (Visible on mobile header row) */}
                <div className="flex items-center gap-1.5 md:hidden relative">
                    <button className="flex items-center gap-1 px-2.5 py-1 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors shadow-sm border border-black/5 text-gray-600 font-medium text-[11px]">
                        <Settings size={13} />
                        <span>Setting</span>
                    </button>
                    <button className="p-1.5 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors shadow-sm border border-black/5 text-gray-600">
                        <Bell size={13} />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => {
                                const dropdown = document.getElementById('topbar-mobile-dropdown');
                                if (dropdown) dropdown.classList.toggle('hidden');
                            }}
                            className="p-0.5 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors shadow-sm border border-black/5 text-gray-600 overflow-hidden" style={{ width: 28, height: 28 }}
                        >
                            {user?.picture ? (
                                <img src={user.picture} referrerPolicy="no-referrer" alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><User size={13} /></div>
                            )}
                        </button>
                        {/* Topbar Mobile Dropdown */}
                        <div id="topbar-mobile-dropdown" className="hidden absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[100]">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('sanjeevani_token');
                                        window.location.href = '/';
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-0.5 bg-white/50 backdrop-blur-md rounded-full px-1 py-0.5 shadow-sm border border-black/5 overflow-x-auto w-full md:w-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${isActive
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-900'
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* Right Icons (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 relative">
                <button className="flex items-center gap-1 px-2.5 py-1 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors shadow-sm border border-black/5 text-gray-600 font-medium text-[11px]">
                    <Settings size={13} />
                    <span>Setting</span>
                </button>
                <button className="p-1.5 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors shadow-sm border border-black/5 text-gray-600">
                    <Bell size={13} />
                </button>
                <div className="relative">
                    <button
                        onClick={() => {
                            const dropdown = document.getElementById('topbar-profile-dropdown');
                            if (dropdown) dropdown.classList.toggle('hidden');
                        }}
                        className="p-0.5 bg-white/60 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors shadow-sm border border-black/5 text-gray-600 overflow-hidden" style={{ width: 28, height: 28 }}
                    >
                        {user?.picture ? (
                            <img src={user.picture} referrerPolicy="no-referrer" alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><User size={13} /></div>
                        )}
                    </button>
                    {/* Topbar Desktop Dropdown */}
                    <div id="topbar-profile-dropdown" className="hidden absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-[100]">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('sanjeevani_token');
                                    window.location.href = '/';
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
