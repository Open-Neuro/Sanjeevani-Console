import Header from '../components/Header';
import { CreditCard, Download, Search, CheckCircle, Clock, Activity, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis } from 'recharts';

const revenueData = [
    { day: 'Mon', revenue: 1200 }, { day: 'Tue', revenue: 1900 }, { day: 'Wed', revenue: 1500 },
    { day: 'Thu', revenue: 2200 }, { day: 'Fri', revenue: 2800 }, { day: 'Sat', revenue: 3500 }, { day: 'Sun', revenue: 3100 }
];

const Payments = () => {
    const payments = [
        { id: '#ORD-1029', amount: '$45.00', status: 'Completed', method: 'Credit Card (Stripe)', date: 'Oct 24, 14:30', aiRisk: 'Low' },
        { id: '#ORD-1030', amount: '$12.50', status: 'Completed', method: 'Cash on Delivery', date: 'Oct 24, 13:15', aiRisk: 'Low' },
        { id: '#ORD-1031', amount: '$105.00', status: 'Pending', method: 'Bank Transfer', date: 'Oct 24, 11:45', aiRisk: 'Flagged' },
        { id: '#ORD-1032', amount: '$8.99', status: 'Completed', method: 'Wallet (Apple Pay)', date: 'Oct 24, 09:20', aiRisk: 'Low' },
        { id: '#ORD-1033', amount: '$210.00', status: 'Failed', method: 'Credit Card (Stripe)', date: 'Oct 23, 16:00', aiRisk: 'High' },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
            <Header title="Payments & AI Financial Intelligence" />

            <div className="px-8 pb-8 space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0a2e2a] p-5 rounded-xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#bbed3b] opacity-10 blur-2xl rounded-full"></div>
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2 relative z-10">Total Revenue</p>
                        <p className="text-3xl font-black text-white relative z-10 mb-2">$12,450.00</p>
                        <div className="flex items-center gap-2 text-[#bbed3b] text-sm font-bold relative z-10"><ArrowUpRight size={16} /> +14.5%</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Payments</p>
                            <p className="text-2xl font-black text-orange-500">$845.00</p>
                        </div>
                        <div className="flex items-center gap-2 text-orange-500 text-sm font-bold bg-orange-50 px-3 py-1.5 rounded-lg w-fit mt-3"><Clock size={14} /> 12 Orders</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI Fraud Prevented</p>
                            <p className="text-2xl font-black text-blue-600">$1,200.00</p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg w-fit mt-3"><CheckCircle size={14} /> 3 Transactions</div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Processing Fees</p>
                            <p className="text-2xl font-black text-red-500">$340.50</p>
                        </div>
                        <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg w-fit mt-3"><ArrowDownRight size={14} /> -2.5% vs avg</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transaction History (Left 2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[#0a2e2a] text-lg flex items-center gap-2">
                                <CreditCard size={20} className="text-[#bbed3b]" /> Transaction Ledger
                            </h3>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" placeholder="Search by ID, Name..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-56 text-sm focus:outline-none focus:ring-2 focus:ring-[#bbed3b]" />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#0a2e2a] rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"><Download size={16} /> Export</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs border-y border-gray-200 uppercase tracking-wider">
                                        <th className="py-3 px-4 font-bold">Transaction</th>
                                        <th className="py-3 px-4 font-bold">Amount</th>
                                        <th className="py-3 px-4 font-bold">Status</th>
                                        <th className="py-3 px-4 font-bold">Method</th>
                                        <th className="py-3 px-4 font-bold">AI Risk Check</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700">
                                    {payments.map((p, i) => (
                                        <tr key={i} className={`border-b border-gray-100 hover:bg-[#fcfdfa] transition-all ${p.aiRisk === 'Flagged' ? 'bg-yellow-50/20' : p.aiRisk === 'High' ? 'bg-red-50/20' : ''}`}>
                                            <td className="py-4 px-4 font-bold text-[#0a2e2a]">
                                                <p>{p.id}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{p.date}</p>
                                            </td>
                                            <td className="py-4 px-4 font-black">{p.amount}</td>
                                            <td className="py-4 px-4">
                                                <span className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded w-max text-xs
                                                        ${p.status === 'Completed' ? 'bg-green-50 text-green-700' : p.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                                                    {p.status === 'Completed' ? <CheckCircle size={14} /> : p.status === 'Pending' ? <Clock size={14} /> : <Activity size={14} />} {p.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-medium text-gray-600 flex items-center gap-2">
                                                <Wallet size={14} className="text-gray-400" /> {p.method}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                                                        ${p.aiRisk === 'Low' ? 'border-green-200 text-green-600 bg-green-50' :
                                                        p.aiRisk === 'Flagged' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                                            'border-red-200 text-red-600 bg-red-50'}`}>
                                                    {p.aiRisk} Risk
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Revenue Chart (Right col) */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
                        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" /> Weekly AI Revenue Forecast
                        </h3>
                        <div className="flex-1 w-full relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Predicted Weekend Surge</span>
                                <span className="text-[#0a2e2a] font-black">+$1,200</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
