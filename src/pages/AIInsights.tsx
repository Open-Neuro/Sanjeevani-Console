import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { BrainCircuit, ShieldAlert, Package, Zap, Activity, Bell, Clock } from 'lucide-react';
import { fetchRefillAlerts, fetchInventoryAlerts, fetchOperationalStatus, fetchExpiryRisk } from '../services/api';

const AIInsights = () => {
    const [refills, setRefills] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [expiryRisk, setExpiryRisk] = useState<any[]>([]);
    const [opsStatus, setOpsStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [refillRes, invRes, expRes, opsRes] = await Promise.all([
                fetchRefillAlerts(),
                fetchInventoryAlerts(),
                fetchExpiryRisk(),
                fetchOperationalStatus(),
            ]);
            setRefills(refillRes.data || []);
            setInventory(invRes.data || []);
            setExpiryRisk(expRes.data || []);
            setOpsStatus(opsRes.data || null);
        } catch (err) {
            console.error('Error loading AI insights:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const engineHealth = opsStatus?.latest_agent_run_status === 'completed' ? 'Healthy' : 'Needs Validation';
    const confidence = opsStatus?.data_presence?.has_orders ? 'Live' : 'Low';

    return (
        <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-y-auto custom-scrollbar">
            <Header title="Sanjeevani AI Intelligence Center" />

            <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard icon={<BrainCircuit size={24} />} title="System Health" value={engineHealth} hint={opsStatus?.latest_agent_run_at ? `Last run ${new Date(opsStatus.latest_agent_run_at).toLocaleString()}` : 'No recorded agent run'} tone="indigo" />
                    <MetricCard icon={<Zap size={24} />} title="Data Confidence" value={confidence} hint={opsStatus?.data_presence?.has_orders ? 'Tenant orders detected' : 'Order data missing'} tone="dark" />
                    <MetricCard icon={<ShieldAlert size={24} />} title="Active Risks" value={String((refills?.length || 0) + (expiryRisk?.length || 0))} hint="Refills plus expiry warnings" tone="rose" />
                    <MetricCard icon={<Activity size={24} />} title="Recorded Agent Runs" value={String(opsStatus?.agent_run_count || 0)} hint="Persisted in backend telemetry" tone="amber" />
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-8 space-y-8">
                        <InsightPanel
                            title="Inventory Optimization Strategy"
                            subtitle="Live low-stock signals from backend"
                            items={inventory}
                            emptyLabel={loading ? 'Loading inventory intelligence...' : 'No low-stock recommendations found.'}
                            renderMeta={(item: any) => item.avg_weekly_sales ? `Avg weekly demand ${Math.round(item.avg_weekly_sales)}` : (item.urgency || 'monitored')}
                            renderTag={(item: any) => item.urgency || 'stable'}
                            nameKey={(item: any) => item.medicine_name || item.product_name || item['Medicine Name']}
                        />

                        <InsightPanel
                            title="Expiry Risk Intelligence"
                            subtitle="Products likely to expire before projected movement"
                            items={expiryRisk}
                            emptyLabel={loading ? 'Loading expiry analysis...' : 'No expiry-risk products found.'}
                            renderMeta={(item: any) => item.days_until_expiry ? `${item.days_until_expiry} days left` : 'expiry not available'}
                            renderTag={(item: any) => item.urgency || 'tracked'}
                            nameKey={(item: any) => item.medicine_name || item.product_name || item['Medicine Name']}
                        />
                    </div>

                    <div className="col-span-4 flex flex-col">
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-50 bg-[#0a2e2a]">
                                <h2 className="text-sm font-bold text-[#bbed3b] flex items-center gap-2 uppercase tracking-widest">
                                    Proactive Outreach Center
                                </h2>
                                <p className="text-[10px] text-gray-300 mt-1 font-medium italic">Driven by recorded refill risk data</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {loading ? (
                                    <div className="text-sm text-gray-400">Loading outreach queue...</div>
                                ) : refills.length > 0 ? refills.map((r, i) => (
                                    <div key={i} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-sm font-black text-gray-800">{r.customer_name || r.patient_name}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.product_name || r.medicine_name}</p>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${r.risk_level === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {r.risk_level || 'Medium'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                                            <span className="inline-flex items-center gap-1"><Bell size={12} /> Refill alert</span>
                                            <span className="inline-flex items-center gap-1"><Clock size={12} /> {r.days_until_refill || 0} days</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-gray-400">No refill outreach cases found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, title, value, hint, tone }: any) => {
    const toneClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        dark: 'bg-[#0a2e2a] text-[#bbed3b]',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    const boxClass = tone === 'dark'
        ? 'bg-[#0a2e2a] p-6 rounded-2xl shadow-sm text-white'
        : 'bg-white border border-gray-100 p-6 rounded-2xl shadow-sm';

    return (
        <div className={boxClass}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${toneClasses[tone]}`}>{icon}</div>
                <h3 className={`text-xs font-black tracking-widest uppercase ${tone === 'dark' ? 'text-gray-200' : 'text-gray-400'}`}>{title}</h3>
            </div>
            <p className={`text-3xl font-black ${tone === 'dark' ? 'text-[#bbed3b]' : 'text-gray-800'}`}>{value}</p>
            <p className={`text-[10px] font-bold mt-1 ${tone === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{hint}</p>
        </div>
    );
};

const InsightPanel = ({ title, subtitle, items, emptyLabel, renderMeta, renderTag, nameKey }: any) => (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div>
                <h2 className="text-lg font-bold text-[#0a2e2a] flex items-center gap-2">
                    <Package className="text-[#bbed3b]" /> {title}
                </h2>
                <p className="text-xs text-gray-500 mt-1 uppercase font-semibold tracking-wide">{subtitle}</p>
            </div>
        </div>
        <div className="p-8">
            <div className="space-y-4">
                {items.length > 0 ? items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[20px] hover:border-[#bbed3b] transition-all group">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#0a2e2a] group-hover:bg-[#bbed3b] transition-colors font-bold">
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="font-extrabold text-[#0a2e2a]">{nameKey(item)}</h4>
                                <p className="text-sm text-gray-500 font-semibold">{renderMeta(item)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase tracking-tighter bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
                                {renderTag(item)}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="text-sm text-gray-400">{emptyLabel}</div>
                )}
            </div>
        </div>
    </div>
);

export default AIInsights;
