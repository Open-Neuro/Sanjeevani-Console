import { useEffect, useState } from 'react';
import {
    Users, MessageSquare, Star, Building2, Search, RefreshCw,
    ChevronDown, ChevronUp, X, CheckCircle, AlertTriangle,
    Phone, MapPin, Calendar, Eye, EyeOff, Trash2,
    Wifi, WifiOff, ToggleLeft, ToggleRight, Shield,
    ShieldCheck, TrendingUp
} from 'lucide-react';

const AUTH_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8001'
    : 'https://sanjeevan-auth.onrender.com';

interface Pharmacy {
    email: string; name: string; pharmacy_id: string; picture: string;
    pharmacy_name: string; owner_name: string; license_number: string;
    store_type: string; phone_number: string; address: string;
    global_role: string; subscription_plan: string; is_active: boolean;
    created_at: string; last_login: string;
    whatsapp_enabled: boolean; whatsapp_display_number: string;
    whatsapp_bot_name: string; whatsapp_meta_phone_number_id: string;
    whatsapp_meta_access_token_masked: string; whatsapp_configured_at: string;
}
interface Stats {
    total_pharmacies: number; active_pharmacies: number;
    whatsapp_bots_live: number; paid_subscribers: number;
}
interface WaForm {
    phone_number_id: string; access_token: string;
    display_number: string; bot_name: string;
}

const planBadge = (plan: string) => {
    if (plan === 'ultra' || plan === 'enterprise') return 'bg-purple-100 text-purple-700';
    if (plan === 'pro') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-500';
};

export default function AdminPanel() {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'whatsapp'>('all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [setupModal, setSetupModal] = useState<Pharmacy | null>(null);
    const [waForm, setWaForm] = useState<WaForm>({ phone_number_id: '', access_token: '', display_number: '', bot_name: '' });
    const [showToken, setShowToken] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    };

    const load = async () => {
        setLoading(true);
        try {
            const [p, s] = await Promise.all([
                fetch(`${AUTH_BASE}/admin/pharmacies`).then(r => r.json()),
                fetch(`${AUTH_BASE}/admin/stats`).then(r => r.json()),
            ]);
            setPharmacies(p.data || []);
            setStats(s);
        } catch { showToast('Failed to load', 'err'); }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = pharmacies.filter(p => {
        const q = search.toLowerCase();
        const m = !q || [p.pharmacy_name, p.email, p.pharmacy_id, p.phone_number].some(v => v?.toLowerCase().includes(q));
        const f = filter === 'all' ? true : filter === 'active' ? p.is_active : filter === 'inactive' ? !p.is_active : p.whatsapp_enabled;
        return m && f;
    });

    const openSetup = (p: Pharmacy) => {
        setWaForm({ phone_number_id: p.whatsapp_meta_phone_number_id || '', access_token: '', display_number: p.whatsapp_display_number || '', bot_name: p.whatsapp_bot_name || `${p.pharmacy_name || 'Sanjeevani'} Bot` });
        setSetupModal(p);
        setShowToken(false);
    };

    const saveWa = async () => {
        if (!setupModal) return;
        if (!waForm.phone_number_id || !waForm.access_token || !waForm.display_number) { showToast('All fields required', 'err'); return; }
        setSaving(true);
        try {
            const r = await fetch(`${AUTH_BASE}/admin/pharmacies/${setupModal.pharmacy_id}/whatsapp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(waForm),
            });
            const d = await r.json();
            if (d.status === 'ok') { showToast('WhatsApp configured ✓'); setSetupModal(null); load(); }
            else showToast(d.detail || 'Failed', 'err');
        } catch { showToast('Network error', 'err'); }
        setSaving(false);
    };

    const removeWa = async (p: Pharmacy) => {
        if (!confirm(`Remove WhatsApp from ${p.pharmacy_name}?`)) return;
        await fetch(`${AUTH_BASE}/admin/pharmacies/${p.pharmacy_id}/whatsapp`, { method: 'DELETE' });
        showToast('WhatsApp removed'); load();
    };

    const toggleActive = async (p: Pharmacy) => {
        await fetch(`${AUTH_BASE}/admin/pharmacies/${p.pharmacy_id}/toggle`, { method: 'PATCH' });
        showToast(`${p.pharmacy_name} ${p.is_active ? 'deactivated' : 'activated'}`); load();
    };

    return (
        <div className="min-h-screen bg-[#f8faf9]">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'ok' ? 'bg-[#0a2e2a] text-[#bbed3b]' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'ok' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0a2e2a] flex items-center justify-center">
                        <Shield size={17} className="text-[#bbed3b]" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">Sanjeevani Admin</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Super Admin Panel</p>
                    </div>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Pharmacies', value: stats.total_pharmacies, icon: Building2, color: '#6366f1', bg: '#eff6ff' },
                            { label: 'Active Accounts', value: stats.active_pharmacies, icon: Users, color: '#16a34a', bg: '#f0fdf4' },
                            { label: 'WhatsApp Bots Live', value: stats.whatsapp_bots_live, icon: MessageSquare, color: '#0a2e2a', bg: '#f0fdf4' },
                            { label: 'Paid Subscribers', value: stats.paid_subscribers, icon: Star, color: '#d97706', bg: '#fffbeb' },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                                    <Icon size={19} style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900">{value}</p>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-tight">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search pharmacy name, email, ID, phone…"
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0a2e2a] transition-colors" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'active', 'inactive', 'whatsapp'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-[#0a2e2a] text-[#bbed3b] shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                {f === 'whatsapp' ? '📱 WhatsApp' : f}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-gray-400 font-medium">{filtered.length} pharmacies</p>

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-24 text-gray-400 gap-2 text-sm">
                        <RefreshCw size={16} className="animate-spin" /> Loading pharmacies…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">No pharmacies found</div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(p => (
                            <div key={p.pharmacy_id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                                {/* Row */}
                                <div className="flex items-center gap-4 px-5 py-4">
                                    <img src={p.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.pharmacy_name || p.email)}&background=0a2e2a&color=bbed3b`}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-gray-900 truncate">{p.pharmacy_name || p.name || '—'}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${planBadge(p.subscription_plan)}`}>{p.subscription_plan}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {p.is_active ? '● Active' : '● Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{p.email}</p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                                        {p.whatsapp_enabled
                                            ? <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 font-semibold"><Wifi size={12} /> Bot Live</span>
                                            : <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-400 font-semibold"><WifiOff size={12} /> Not Setup</span>
                                        }
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => openSetup(p)}
                                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0a2e2a] text-[#bbed3b] hover:opacity-90 transition-opacity">
                                            {p.whatsapp_enabled ? 'Edit WA' : 'Setup WA'}
                                        </button>
                                        <button onClick={() => setExpanded(expanded === p.pharmacy_id ? null : p.pharmacy_id)}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
                                            {expanded === p.pharmacy_id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded */}
                                {expanded === p.pharmacy_id && (
                                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Pharmacy Info */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pharmacy Info</p>
                                            {[
                                                { icon: Building2, label: 'Owner', val: p.owner_name },
                                                { icon: Phone, label: 'Phone', val: p.phone_number },
                                                { icon: MapPin, label: 'Address', val: p.address },
                                                { icon: ShieldCheck, label: 'License', val: p.license_number },
                                                { icon: TrendingUp, label: 'Store Type', val: p.store_type },
                                            ].filter(i => i.val).map(({ icon: Icon, label, val }) => (
                                                <div key={label} className="flex items-start gap-2">
                                                    <Icon size={12} className="text-gray-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] text-gray-400">{label}</p>
                                                        <p className="text-xs text-gray-700 font-medium">{val}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Account */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Account</p>
                                            {[
                                                { label: 'Pharmacy ID', val: p.pharmacy_id },
                                                { label: 'Role', val: p.global_role },
                                                { label: 'Joined', val: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—' },
                                                { label: 'Last Login', val: p.last_login ? new Date(p.last_login).toLocaleDateString('en-IN') : 'Never' },
                                            ].map(({ label, val }) => (
                                                <div key={label}>
                                                    <p className="text-[9px] text-gray-400">{label}</p>
                                                    <p className="text-xs text-gray-700 font-mono font-medium break-all">{val || '—'}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* WhatsApp */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">WhatsApp Bot</p>
                                            {p.whatsapp_enabled ? (
                                                <>
                                                    {[
                                                        { label: 'Bot Name', val: p.whatsapp_bot_name },
                                                        { label: 'Number', val: p.whatsapp_display_number },
                                                        { label: 'Phone Number ID', val: p.whatsapp_meta_phone_number_id },
                                                        { label: 'Token', val: p.whatsapp_meta_access_token_masked },
                                                        { label: 'Configured', val: p.whatsapp_configured_at ? new Date(p.whatsapp_configured_at).toLocaleDateString('en-IN') : '—' },
                                                    ].map(({ label, val }) => (
                                                        <div key={label}>
                                                            <p className="text-[9px] text-gray-400">{label}</p>
                                                            <p className="text-xs text-gray-700 font-mono break-all">{val || '—'}</p>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => removeWa(p)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1 transition-colors">
                                                        <Trash2 size={11} /> Remove WhatsApp
                                                    </button>
                                                </>
                                            ) : (
                                                <p className="text-xs text-gray-400">Not configured.
                                                    <button onClick={() => openSetup(p)} className="ml-1 text-[#0a2e2a] font-bold hover:underline">Setup →</button>
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions bar */}
                                        <div className="md:col-span-3 pt-3 border-t border-gray-100 flex gap-3">
                                            <button onClick={() => toggleActive(p)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${p.is_active ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                                {p.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                                {p.is_active ? 'Deactivate Account' : 'Activate Account'}
                                            </button>
                                            <div className="flex items-center gap-2 ml-auto text-[10px] text-gray-400">
                                                <Calendar size={11} />
                                                ID: <span className="font-mono text-gray-600">{p.pharmacy_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* WhatsApp Setup Modal */}
            {setupModal && (
                <div className="fixed inset-0 z-[200] bg-[#0a2e2a]/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
                        <div className="bg-[#0a2e2a] rounded-t-2xl px-6 py-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-white text-sm">WhatsApp Bot Setup</h2>
                                <p className="text-[10px] text-[#bbed3b]/80 mt-0.5">{setupModal.pharmacy_name || setupModal.email}</p>
                            </div>
                            <button onClick={() => setSetupModal(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            {[
                                { label: 'Meta Phone Number ID *', key: 'phone_number_id', placeholder: '997405606786963', mono: true },
                                { label: 'Display Number *', key: 'display_number', placeholder: '+91 98765 43210', mono: false },
                                { label: 'Bot Name', key: 'bot_name', placeholder: 'Sharma Medical WhatsApp Bot', mono: false },
                            ].map(({ label, key, placeholder, mono }) => (
                                <div key={key}>
                                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                                    <input value={(waForm as any)[key]}
                                        onChange={e => setWaForm(f => ({ ...f, [key]: e.target.value }))}
                                        placeholder={placeholder}
                                        className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0a2e2a] transition-colors ${mono ? 'font-mono' : ''}`} />
                                </div>
                            ))}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Permanent Access Token *</label>
                                <div className="relative">
                                    <input type={showToken ? 'text' : 'password'} value={waForm.access_token}
                                        onChange={e => setWaForm(f => ({ ...f, access_token: e.target.value }))}
                                        placeholder="EAAcOUt4Kn7g…"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-800 focus:outline-none focus:border-[#0a2e2a] transition-colors pr-11" />
                                    <button onClick={() => setShowToken(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                        {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                                <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-amber-700">Token is stored securely and will never be shown in full after saving.</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={() => setSetupModal(null)} className="px-5 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={saveWa} disabled={saving}
                                className="px-6 py-2 rounded-xl text-sm font-bold bg-[#0a2e2a] text-[#bbed3b] hover:opacity-90 transition-opacity disabled:opacity-50">
                                {saving ? 'Saving…' : '✓ Save & Enable'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
