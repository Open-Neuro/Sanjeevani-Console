import { useState, useEffect } from 'react';
import { 
    Users, ShoppingBag, Package, TrendingUp, 
    AlertTriangle, ShieldAlert, Clock, ArrowUpRight, 
    ArrowDownRight, MoreVertical, Search, Filter, 
    CheckCircle2, Info, Loader2, Sparkles, Zap, BrainCircuit,
    LayoutDashboard, ClipboardList, CreditCard, UserCircle,
    Settings, LogOut, ChevronRight, MessageSquare, Bell,
    ArrowLeft, Plus, Download, Calendar
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const DemoOverview = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('overview'); // overview, inventory, orders, intelligence
    const [searchQuery, setSearchQuery] = useState('');
    void [TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Filter, CheckCircle2, Info, ClipboardList, UserCircle, LogOut, ArrowLeft, Download, Calendar, BarChart, Bar, Cell, searchQuery, setSearchQuery];

    // ── MOCK DATA ───────────────────────────────────────────────────────────
    
    const mockOverview = {
        total_patients: 1248,
        total_orders: 854,
        total_products: 4120,
        total_revenue: 420500.50,
        monthly_growth: 15.4,
        active_alerts: 12,
    };

    const mockInventory = [
        { id: 1, name: "Augmentin 625 Duo", category: "Antibiotics", stock: 5, price: 210, status: "Critical", expiry: "2024-08-12" },
        { id: 2, name: "Pan D Capsule", category: "Antacids", stock: 12, price: 185, status: "Low", expiry: "2025-01-20" },
        { id: 3, name: "Dolo 650mg", category: "Analgesics", stock: 450, price: 30, status: "Good", expiry: "2025-06-15" },
        { id: 4, name: "Zifi 200mg", category: "Antibiotics", stock: 18, price: 155, status: "Low", expiry: "2024-11-30" },
        { id: 5, name: "Lipitor 10mg", category: "Statins", stock: 8, price: 450, status: "Critical", expiry: "2024-05-10" },
        { id: 6, name: "Metformin 500", category: "Anti-Diabetic", stock: 200, price: 15, status: "Good", expiry: "2025-12-01" },
        { id: 7, name: "Amoxicillin 500", category: "Antibiotics", stock: 150, price: 85, status: "Good", expiry: "2025-03-22" },
    ];

    const mockOrders = [
        { id: "ORD-9921", customer: "Rahul Sharma", items: "Metformin x3, Dolo x1", amount: 1250, status: "Delivered", type: "WhatsApp" },
        { id: "ORD-9920", customer: "Priya Singh", items: "Amlodipine x2", amount: 450, status: "Pending", type: "AI Voice" },
        { id: "ORD-9919", customer: "Anita Verma", items: "Atorvastatin x1", amount: 890, status: "Shipped", type: "WhatsApp" },
        { id: "ORD-9918", customer: "Vikram Malhotra", items: "Losartan x5, Pan D x2", amount: 3200, status: "Delivered", type: "Dashboard" },
        { id: "ORD-9917", customer: "Sanjay Gupta", items: "Levothyroxine x1", amount: 210, status: "Cancelled", type: "AI Voice" },
    ];

    const mockTimeSeries = [
        { date: 'Feb 1', value: 45 }, { date: 'Feb 5', value: 52 },
        { date: 'Feb 10', value: 48 }, { date: 'Feb 15', value: 65 },
        { date: 'Feb 20', value: 88 }, { date: 'Feb 25', value: 95 },
        { date: 'Feb 28', value: 110 }
    ];

    const mockAiInsights = [
        { type: "Refill Risk", message: "5 Chronic patients have high probability of missing refills next week.", priority: "High" },
        { type: "Inventory", message: "Augmentin stock velocity increased by 40%. Restock recommended by Friday.", priority: "Critical" },
        { type: "Market", message: "Trending: High demand for Antivirals detected in your pincode area (431601).", priority: "Medium" },
    ];

    // ──────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a2e2a]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="animate-spin text-[#bbed3b]" size={64} />
                        <Sparkles className="absolute -top-4 -right-4 text-blue-400 animate-pulse" size={32} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-white tracking-widest uppercase">Sanjeevani Intelligence</h2>
                        <p className="text-[#bbed3b] font-bold mt-2 animate-pulse tracking-wide italic">Booting Isolated Demo Environment... 🚀</p>
                    </div>
                </div>
            </div>
        );
    }

    const NavItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => (
        <button 
            onClick={() => setActiveView(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group
                ${activeView === id ? 'bg-[#bbed3b] text-[#0a2e2a]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <Icon size={20} className={`${activeView === id ? 'scale-110' : 'group-hover:translate-x-1'} transition-transform`} />
            <span className={`text-sm font-black tracking-wide uppercase ${activeView === id ? 'opacity-100' : 'opacity-70'}`}>
                {label}
            </span>
            {activeView === id && <ChevronRight size={16} className="ml-auto" />}
        </button>
    );

    return (
        <div className="h-screen w-full bg-[#fafbfd] flex overflow-hidden font-sans">
            
            {/* ── MOCK SIDEBAR ── */}
            <aside className="w-72 bg-[#0a2e2a] border-r border-[#1a3e3a] flex flex-col shrink-0">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#bbed3b] rounded-xl text-[#0a2e2a] shadow-lg shadow-[#bbed3b]/10">
                            <Sparkles size={22} />
                        </div>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">Sanjeevani<span className="text-[#bbed3b]">AI</span></h1>
                    </div>
                    <div className="mt-2 text-[10px] font-black text-[#bbed3b]/50 tracking-[0.2em] uppercase">Enterprise Demo v2.0</div>
                </div>

                <nav className="flex-1 mt-4">
                    <NavItem icon={LayoutDashboard} label="Live Monitoring" id="overview" />
                    <NavItem icon={Package} label="Smart Inventory" id="inventory" />
                    <NavItem icon={ShoppingBag} label="Order Streams" id="orders" />
                    <NavItem icon={BrainCircuit} label="AI Intelligence" id="intelligence" />
                    <NavItem icon={Users} label="Chronic Patients" id="patients" />
                    
                    <div className="mx-6 my-8 border-t border-white/5"></div>
                    
                    <NavItem icon={CreditCard} label="Settlements" id="payments" />
                    <NavItem icon={Settings} label="System Config" id="settings" />
                </nav>

                <div className="p-6">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group cursor-default">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#bbed3b] flex items-center justify-center text-[#0a2e2a] font-black text-lg">
                                {user?.name?.charAt(0) || 'D'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-black text-white truncate uppercase tracking-tight">{user?.name || 'Demo Merchant'}</p>
                                <p className="text-[10px] text-[#bbed3b] font-bold truncate opacity-60">ADMIN PRIVILEGES</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* ── Mock Header ── */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 py-5 shrink-0 z-20 sticky top-0">
                    <div className="flex items-center gap-8 flex-1">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            {activeView === 'overview' && 'Live Ecosystem'}
                            {activeView === 'inventory' && 'Inventory Cloud'}
                            {activeView === 'orders' && 'Transactional Stream'}
                            {activeView === 'intelligence' && 'AI Lab'}
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] rounded-full uppercase font-black">Isolated</span>
                        </h2>
                        
                        <div className="relative max-w-md w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0a2e2a] transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder={`Search through ${activeView}...`}
                                className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#0a2e2a]/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 text-xs font-black">
                            <Zap size={14} /> SYSTEM: NOMINAL
                        </div>
                        <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#0a2e2a] transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* ── Scrollable View Area ── */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    
                    {/* View: OVERVIEW */}
                    {activeView === 'overview' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-6">
                                {[
                                    { id:1, label: 'Live Patients', val: mockOverview.total_patients, icon: Users, color: 'blue', growth: '+12%' },
                                    { id:2, label: 'Today\'s Orders', val: mockOverview.total_orders, icon: ShoppingBag, color: 'green', growth: '+8%' },
                                    { id:3, label: 'Active Catalog', val: mockOverview.total_products, icon: Package, color: 'purple', growth: '+4k' },
                                    { id:4, label: 'Gross Revenue', val: `₹${(mockOverview.total_revenue/1000).toFixed(1)}K`, icon: CreditCard, color: 'yellow', growth: `${mockOverview.monthly_growth}%` }
                                ].map((s) => (
                                    <div key={s.id} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative border-b-4 border-b-[#0a2e2a]/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 bg-${s.color}-50 text-${s.color}-600 rounded-2xl group-hover:rotate-6 transition-transform`}>
                                                <s.icon size={24} />
                                            </div>
                                            <div className="text-[10px] font-black text-green-600 px-2 py-1 bg-green-50 rounded-lg">{s.growth}</div>
                                        </div>
                                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{s.label}</p>
                                        <h3 className="text-3xl font-black text-gray-900 mt-2">{s.val}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                {/* Chart */}
                                <div className="col-span-2 bg-white p-8 rounded-[36px] border border-gray-100 shadow-sm relative overflow-hidden">
                                     <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900">Demand Trajectory</h4>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Cross-channel engagement velocity</p>
                                        </div>
                                        <div className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-800 border border-gray-100">LAST 30 DAYS</div>
                                    </div>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockTimeSeries}>
                                                <defs>
                                                    <linearGradient id="demoGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#bbed3b" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#bbed3b" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                                                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(10,46,42,0.1)', background: '#0a2e2a', color: 'white'}} />
                                                <Area type="monotone" dataKey="value" stroke="#0a2e2a" strokeWidth={5} fillOpacity={1} fill="url(#demoGradient)" animationDuration={2500} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Feed */}
                                <div className="bg-[#0a2e2a] p-8 rounded-[36px] text-white flex flex-col shadow-2xl shadow-[#0a2e2a]/20 group">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-[#bbed3b] text-[#0a2e2a] rounded-2xl">
                                            <BrainCircuit size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-[#bbed3b]">AI Summary</h4>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Scan Active</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar-light">
                                        {mockAiInsights.map((insight, idx) => (
                                            <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-[20px] transition-all hover:bg-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg
                                                        ${insight.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-[#bbed3b]/20 text-[#bbed3b]'} `}>
                                                        {insight.type}
                                                    </span>
                                                    <span className="text-[10px] text-white/40 font-bold">12:00 PM</span>
                                                </div>
                                                <p className="text-xs leading-relaxed font-bold italic">"{insight.message}"</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-4 bg-[#bbed3b] text-[#0a2e2a] rounded-2xl font-black text-xs hover:scale-[1.02] shadow-lg shadow-[#bbed3b]/10 transition-all uppercase tracking-widest">
                                        Full Engine Logs
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: INVENTORY */}
                    {activeView === 'inventory' && (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                             <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tight line-clamp-1 italic">Stock Health Center</h4>
                                        <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Optimization level: 94%</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm border border-gray-100 hover:bg-gray-100">Export CSV</button>
                                    <button className="px-6 py-3 bg-[#0a2e2a] text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-[#0a2e2a]/10">
                                        <Plus size={18} /> Add New Asset
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] border-b border-gray-100">
                                            <th className="py-6 px-8 text-left">SKU Product Identity</th>
                                            <th className="py-6 px-6 text-left">Classification</th>
                                            <th className="py-6 px-6 text-center">Unit Price</th>
                                            <th className="py-6 px-6 text-center">In-Stock Quant</th>
                                            <th className="py-6 px-6 text-center">Health Status</th>
                                            <th className="py-6 px-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {mockInventory.map((item) => (
                                            <tr key={item.id} className="group hover:bg-orange-50/30 transition-all">
                                                <td className="py-6 px-8">
                                                    <div>
                                                        <p className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Exp: {item.expiry}</p>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase">{item.category}</span>
                                                </td>
                                                <td className="py-6 px-6 text-center font-black text-gray-900">₹{item.price}</td>
                                                <td className="py-6 px-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-black text-gray-900">{item.stock}</span>
                                                        <div className="w-16 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                            <div className={`h-full transition-all duration-1000 ${item.status === 'Critical' ? 'w-1/5 bg-red-500' : item.status === 'Low' ? 'w-2/5 bg-orange-500' : 'w-4/5 bg-green-500'}`}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 text-center">
                                                     <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter border-2
                                                        ${item.status === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                          item.status === 'Low' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                                          'bg-green-50 text-green-600 border-green-100'}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-8 text-right">
                                                    <button className="p-2 hover:bg-white rounded-xl text-gray-300 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm">
                                                        <MoreVertical size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* View: ORDERS */}
                    {activeView === 'orders' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-[#0a2e2a] p-8 rounded-[40px] text-white overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 text-[#bbed3b] animate-bounce"><Zap size={40} /></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bbed3b] mb-1">Queue Priority</p>
                                    <h4 className="text-3xl font-black italic">Live Pipeline</h4>
                                    <div className="mt-8 flex items-baseline gap-3">
                                        <span className="text-5xl font-black">24</span>
                                        <span className="text-xs font-bold text-white/50 tracking-widest uppercase">Orders Processing</span>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-2">Channel Split</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase text-gray-700">WhatsApp AI</span>
                                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">65%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 w-[65%] h-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-2">Average Cycle</p>
                                    <div className="flex items-center gap-4 text-green-600">
                                        <Clock size={40} />
                                        <div>
                                            <p className="text-2xl font-black tracking-tight tracking-widest inline uppercase">4.2 min</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order to confirm</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] border-b border-gray-100">
                                            <th className="py-6 px-10 text-left">Log ID Key</th>
                                            <th className="py-6 px-6 text-left">Customer Lead</th>
                                            <th className="py-6 px-6 text-left">Artifact Detail</th>
                                            <th className="py-6 px-6 text-center">Value</th>
                                            <th className="py-6 px-6 text-center">Channel</th>
                                            <th className="py-6 px-10 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {mockOrders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-blue-50/30 transition-all">
                                                <td className="py-7 px-10">
                                                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-1.5 rounded-xl border border-blue-100">{order.id}</span>
                                                </td>
                                                <td className="py-7 px-6">
                                                     <p className="font-black text-gray-900 text-sm">{order.customer}</p>
                                                     <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Nanded, MH</p>
                                                </td>
                                                <td className="py-7 px-6">
                                                    <p className="text-xs font-bold text-gray-500 truncate max-w-xs">{order.items}</p>
                                                </td>
                                                <td className="py-7 px-6 text-center">
                                                    <p className="font-black text-gray-900">₹{order.amount}</p>
                                                </td>
                                                <td className="py-7 px-6 text-center">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
                                                        {order.type === 'WhatsApp' ? <MessageSquare size={12} className="text-green-500" /> : <BrainCircuit size={12} className="text-purple-500" />}
                                                        <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">{order.type}</span>
                                                    </div>
                                                </td>
                                                <td className="py-7 px-10 text-right">
                                                     <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter
                                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                                                          'bg-blue-100 text-blue-700'}`}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Demo Warning Banner ── */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-[0.03] select-none z-0">
                    <h1 className="text-[200px] font-black whitespace-nowrap uppercase tracking-tighter">DEMO MODE</h1>
                </div>

                {/* ── Global Floating Actions ── */}
                <div className="absolute bottom-10 right-10 flex flex-col gap-4 z-50">
                    <button className="p-5 bg-white text-[#0a2e2a] rounded-[30px] shadow-2xl border-4 border-white hover:scale-110 active:scale-90 transition-all group">
                        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    <button className="flex items-center gap-3 pl-4 pr-6 py-4 bg-[#bbed3b] text-[#0a2e2a] rounded-[30px] shadow-2xl border-4 border-white hover:scale-105 active:scale-95 transition-all group">
                        <div className="p-3 bg-[#0a2e2a] text-[#bbed3b] rounded-[22px] group-hover:-rotate-12 transition-transform">
                            <Sparkles size={24} />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest italic group-hover:tracking-tight transition-all">Ask Intelligence</span>
                    </button>
                </div>

            </main>
        </div>
    );
};

export default DemoOverview;
