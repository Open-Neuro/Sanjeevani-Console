import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Box,
    ShoppingCart,
    LineChart,
    Users,
    CreditCard,
    BrainCircuit,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Settings,
    LogOut,
    Shield,
    Database,
    ExternalLink,
    Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SanjeevaniLogo from './SanjeevaniLogo';

/* ─── Nav items ─────────────────────────────────────── */
const NAV_MAIN = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/products', icon: Box, label: 'Products' },
    { to: '/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/dashboard/sales', icon: LineChart, label: 'Sales' },
    { to: '/dashboard/customers', icon: Users, label: 'Customers' },
    { to: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
];

const NAV_AI = [
    { to: '/dashboard/ai-insights', icon: BrainCircuit, label: 'AI Insights' },
];

/* ─── Sidebar ───────────────────────────────────────── */
const Sidebar = () => {
    const location = useLocation();
    const [expanded, setExpanded] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <div
            style={{
                width: expanded ? 220 : 68,
                transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '2px 0 16px rgba(0,0,0,0.06)',
            }}
            className="relative h-screen flex flex-col shrink-0 overflow-visible z-30 bg-white border-r border-gray-200"
        >
            {/* ── Logo + Brand ── */}
            <div className={`flex items-center h-[60px] shrink-0 border-b border-gray-100 overflow-hidden ${expanded ? 'px-4' : 'px-0 justify-center'}`}>
                <div
                    style={{
                        width: expanded ? 160 : 36,
                        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    className="flex items-center justify-center"
                >
                    <SanjeevaniLogo
                        iconColor="#000000"
                        iconAccent="#d4ed66"
                        textColor="#000000"
                        width={expanded ? 160 : 36}
                        height={expanded ? 32 : 26}
                    />
                </div>
            </div>

            {/* ── Expand / Collapse Toggle Button ── */}
            <button
                onClick={() => setExpanded(e => !e)}
                title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                className="absolute -right-3 top-[72px] z-50 w-6 h-6 rounded-full bg-white border border-gray-200
                    shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800
                    hover:border-gray-300 transition-all duration-150"
            >
                {expanded
                    ? <ChevronLeft size={13} strokeWidth={2.5} />
                    : <ChevronRight size={13} strokeWidth={2.5} />}
            </button>

            {/* ── Nav ── */}
            <nav className="flex-1 flex flex-col px-2 pt-4 gap-0.5 overflow-hidden">
                {/* Main section label */}
                <div
                    className="overflow-hidden mb-2"
                    style={{
                        height: expanded ? 18 : 0,
                        opacity: expanded ? 1 : 0,
                        transition: 'height 0.22s ease, opacity 0.18s ease',
                    }}
                >
                    <span className="px-2 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Main Menu
                    </span>
                </div>

                {NAV_MAIN.map(({ to, icon: Icon, label }) => (
                    <NavItem
                        key={to}
                        to={to}
                        icon={<Icon size={17} strokeWidth={1.8} />}
                        label={label}
                        active={location.pathname === to}
                        expanded={expanded}
                    />
                ))}

                {/* Divider */}
                <div className="my-3 mx-1 h-px bg-gray-100" />

                {/* Intelligence label */}
                <div
                    className="overflow-hidden mb-2"
                    style={{
                        height: expanded ? 18 : 0,
                        opacity: expanded ? 1 : 0,
                        transition: 'height 0.22s ease, opacity 0.18s ease',
                    }}
                >
                    <span className="px-2 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Sparkles size={8} className="text-[#16a34a]" />
                        Intelligence
                    </span>
                </div>

                {NAV_AI.map(({ to, icon: Icon, label }) => (
                    <NavItem
                        key={to}
                        to={to}
                        icon={<Icon size={17} strokeWidth={1.8} />}
                        label={label}
                        active={location.pathname === to}
                        expanded={expanded}
                        badge
                    />
                ))}


            </nav>

            {/* ── Profile Card ── */}
            <div className="px-2 pb-3 pt-2 border-t border-gray-100 shrink-0 relative">
                <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-full flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                    style={{
                        padding: expanded ? '8px 10px' : '6px',
                        justifyContent: expanded ? 'flex-start' : 'center',
                        transition: 'padding 0.28s cubic-bezier(0.4,0,0.2,1)',
                    }}
                >
                    <div className="relative shrink-0">
                        <img
                            src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
                            alt={user?.name || "User"}
                            referrerPolicy="no-referrer"
                            className="rounded-full object-cover border-2 border-white shadow-sm"
                            style={{ width: 34, height: 34, minWidth: 34 }}
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16a34a] rounded-full border-2 border-white" />
                    </div>

                    <div
                        className="overflow-hidden text-left"
                        style={{
                            opacity: expanded ? 1 : 0,
                            maxWidth: expanded ? 130 : 0,
                            width: 130,
                            whiteSpace: 'nowrap',
                            transition: 'opacity 0.16s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1)',
                        }}
                    >
                        <p className="text-[12px] font-bold text-gray-800 leading-tight truncate">{user?.name || "Sanjeevani Admin"}</p>
                        <p className="text-[10px] text-gray-500 leading-tight truncate">{user?.email || "admin@sanjeevanirx.ai"}</p>
                    </div>
                </button>

                {/* Big Detailed Profile Dropdown Menu */}
                {profileOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[90]"
                            onClick={() => setProfileOpen(false)}
                        />
                        <div className="absolute bottom-[calc(100%+12px)] left-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[100] transform transition-all duration-200">
                            {/* Profile Header Block */}
                            <div className="bg-gradient-to-r from-[#0a2e2a] to-[#133d39] p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#bbed3b] opacity-[0.05] blur-3xl rounded-full"></div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <img
                                        src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
                                        alt={user?.name || "User"}
                                        referrerPolicy="no-referrer"
                                        className="rounded-full border-[3px] border-white/20 shadow-lg object-cover w-12 h-12"
                                    />
                                    <div className="text-white overflow-hidden">
                                        <h3 className="font-bold text-sm truncate">{user?.name || "Sanjeevani Admin"}</h3>
                                        <p className="text-[11px] text-gray-300 truncate">{user?.email || "admin@sanjeevanirx.ai"}</p>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="bg-[#bbed3b] text-[#0a2e2a] text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">PRO</span>
                                            <span className="text-[9px] font-medium text-gray-400 font-mono tracking-tight">ID: {user?.id?.slice(0, 8) || "S-55928XA"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Actions */}
                            <div className="p-2 space-y-0.5">
                                <p className="px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">System Config</p>
                                <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg group transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-gray-400 group-hover:text-[#0a2e2a] transition-colors" />
                                        <span className="font-medium">Access Controls & IAM</span>
                                    </div>
                                </button>
                                <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg group transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Database size={16} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                                        <span className="font-medium">MongoDB Sync Setup</span>
                                    </div>
                                </button>
                                <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg group transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="font-medium">Agentic Trace Logs</span>
                                    </div>
                                    <ExternalLink size={12} className="text-gray-300" />
                                </button>
                                <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg group transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Settings size={16} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                                        <span className="font-medium">Account Settings</span>
                                    </div>
                                </button>
                            </div>

                            <div className="p-2 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setProfileOpen(false);
                                        if (logout) {
                                            logout();
                                        } else {
                                            localStorage.removeItem('sanjeevani_token');
                                            window.location.href = '/login';
                                        }
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                                >
                                    <LogOut size={16} />
                                    Secure Logout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─── Nav Item ──────────────────────────────────────── */
const NavItem = ({
    to, icon, label, active, expanded, badge = false,
}: {
    to: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    expanded: boolean;
    badge?: boolean;
}) => {
    return (
        <Link
            to={to}
            title={!expanded ? label : undefined}
            className="group relative flex items-center rounded-lg transition-colors duration-150"
            style={{
                height: 40,
                padding: expanded ? '0 10px' : '0',
                justifyContent: expanded ? 'flex-start' : 'center',
                transition: 'padding 0.28s cubic-bezier(0.4,0,0.2,1), background 0.12s',
                background: active
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                    : 'transparent',
            }}
        >
            {/* Active left bar */}
            {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#16a34a]" />
            )}

            {/* Hover bg */}
            <span
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ background: active ? 'transparent' : 'rgba(22,163,74,0.05)' }}
            />

            {/* Icon */}
            <span
                className="relative shrink-0 flex items-center justify-center rounded-md"
                style={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    color: active ? '#15803d' : '#6b7280',
                    background: active ? 'rgba(22,163,74,0.1)' : 'transparent',
                }}
            >
                {icon}
                {badge && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                )}
            </span>

            {/* Label */}
            <span
                className="ml-2.5 overflow-hidden"
                style={{
                    opacity: expanded ? 1 : 0,
                    maxWidth: expanded ? 160 : 0,
                    width: 160,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? '#15803d' : '#374151',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.16s ease, max-width 0.28s cubic-bezier(0.4,0,0.2,1)',
                    letterSpacing: '0.01em',
                }}
            >
                {label}
            </span>

            {/* Tooltip when collapsed */}
            {!expanded && (
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg
                    text-[11px] font-semibold bg-gray-800 text-white shadow-lg
                    opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                    transition-all duration-150 z-[999] whitespace-nowrap">
                    {label}
                </span>
            )}
        </Link>
    );
};

export default Sidebar;
