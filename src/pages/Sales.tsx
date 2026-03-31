import Header from '../components/Header';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const demandData = [
    { name: 'Mon', predicted: 400, actual: 450 },
    { name: 'Tue', predicted: 300, actual: 320 },
    { name: 'Wed', predicted: 550, actual: 500 },
    { name: 'Thu', predicted: 450, actual: 480 },
    { name: 'Fri', predicted: 600, actual: 590 },
    { name: 'Sat', predicted: 700, actual: 750 },
    { name: 'Sun', predicted: 850, actual: 900 },
];

const Sales = () => {
    return (
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
            <Header title="Sales & BI (Business Intelligence)" />

            <div className="px-8 pb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard icon={<DollarSign size={20} className="text-green-600" />} title="Daily Revenue" value="$4,209" subtext="+12% from yesterday" bg="bg-green-50" />
                    <StatCard icon={<Activity size={20} className="text-blue-600" />} title="Repeat Purchases" value="68%" subtext="Driven by AI reminders" bg="bg-blue-50" />
                    <StatCard icon={<TrendingUp size={20} className="text-purple-600" />} title="Refill Conversion" value="45%" subtext="AI outreach success rate" bg="bg-purple-50" />
                    <StatCard icon={<DollarSign size={20} className="text-[#0a2e2a]" />} title="Predicted Diff" value="+$890" subtext="Expected revenue increase" bg="bg-[#bbed3b]/30" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Charts Area */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col h-[340px]">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-blue-500" /> Predicted vs Actual Demand
                        </h3>
                        <div className="flex-1 w-full min-h-0 relative z-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar dataKey="actual" name="Actual Sales" fill="#0a2e2a" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="predicted" name="AI Prediction" fill="#bbed3b" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Selling Medicines */}
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col h-[340px]">
                        <h3 className="font-semibold text-gray-800 mb-4">Top Selling Medicines</h3>
                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-3">
                            {[
                                { name: 'Paracetamol 500mg', units: '120 units sold', trend: '↑ 14%', c: 'text-green-600 bg-green-50 max-w-[fit-content]' },
                                { name: 'Amoxicillin Syrup', units: '85 units sold', trend: '↑ 5%', c: 'text-green-600 bg-green-50 max-w-[fit-content]' },
                                { name: 'Cough Syrup (Gen)', units: '60 units sold', trend: '↓ 2%', c: 'text-red-600 bg-red-50 max-w-[fit-content]' },
                                { name: 'Vitamin C Tabs', units: '150 units sold', trend: '↑ 20%', c: 'text-green-600 bg-green-50 max-w-[fit-content]' },
                                { name: 'Lisinopril 10mg', units: '45 units sold', trend: '↑ 3%', c: 'text-green-600 bg-green-50 max-w-[fit-content]' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-[#fcfdfa] p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-semibold text-[#0a2e2a] text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{item.units}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.c}`}>{item.trend}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtext, bg = "bg-white" }: { icon: React.ReactNode, title: string, value: string, subtext: string, bg?: string }) => (
    <div className={`p-4 rounded-xl shadow-sm border border-gray-100 bg-white`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${bg}`}>
                {icon}
            </div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        </div>
        <div>
            <p className="text-2xl font-extrabold text-[#0a2e2a] leading-none mb-1">{value}</p>
            <p className="text-xs text-gray-500 font-medium">{subtext}</p>
        </div>
    </div>
);

export default Sales;
