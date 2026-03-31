import { useState } from "react";
import { Sparkles, CheckCircle2, Bot, Zap, PhoneCall, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Plans() {
    const { token, user, updateUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const updatePlan = async (selectedPlan: string) => {
        setIsSaving(true);
        const finalData = { 
            subscription_plan: selectedPlan.toLowerCase() 
        };

        try {
            const authBaseUrl = import.meta.env.VITE_AUTH_API_URL || 'https://sanjeevani-auth.onrender.com';
            const response = await fetch(`${authBaseUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(finalData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                updateUser(updatedUser);
            } else {
                console.error("Failed to save profile to backend");
            }
        } catch (error) {
            console.error("Error saving plan data:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const currentPlan = user?.subscription_plan?.toLowerCase();

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto p-8">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                    <Sparkles size={14} /> Power Up Your Pharmacy
                </div>
                <h2 className="text-3xl font-black text-[#0a2e2a] tracking-tight mb-2">Choose your Sanjeevani OS Plan</h2>
                <p className="text-gray-500">Pick the perfect plan to grow your business instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* 1. Base Plan */}
                <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 flex flex-col hover:border-gray-200 transition-colors shadow-sm relative">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Sanjeevani Base</h3>
                    <p className="text-sm text-gray-500 mb-6 h-10">Essential tools for digital inventory management.</p>

                    <ul className="space-y-4 mb-8 flex-1">
                        {["Advanced Inventory Dashboard", "Bulk Add & Excel Sync", "Low Stock & Expiry Alerts", "Manual POS Integration"].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                                <CheckCircle2 size={18} className="mt-0.5 text-gray-400 shrink-0" /> {feat}
                            </li>
                        ))}
                    </ul>
                    <button 
                        disabled={isSaving || currentPlan === 'base'}
                        onClick={() => updatePlan("Base")} 
                        className="w-full py-3.5 rounded-xl font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving && <Loader2 size={18} className="animate-spin" />}
                        {currentPlan === 'base' ? 'Current Plan' : 'Select Base'}
                    </button>
                </div>

                {/* 2. Pro Plan */}
                <div className="bg-white border-2 border-[#bbed3b] rounded-3xl p-8 flex flex-col shadow-2xl shadow-[#bbed3b]/10 relative z-10 transform md:-translate-y-4">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0a2e2a] text-[#bbed3b] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                        Most Popular
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-orange-500 shrink-0" size={24} />
                        <h3 className="text-xl font-bold text-[#0a2e2a]">Sanjeevani Pro</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 h-10">Everything you need to automate orders and grow.</p>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-sm text-gray-800 font-bold">
                            <CheckCircle2 size={18} className="mt-0.5 text-green-500 shrink-0" /> WhatsApp & Telegram Orders
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-800 font-bold">
                            <CheckCircle2 size={18} className="mt-0.5 text-green-500 shrink-0" /> AI Insights & Demand Forecasting
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                            <CheckCircle2 size={18} className="mt-0.5 text-green-500 shrink-0" /> Automated Patient Refill Reminders
                        </li>
                        <li className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                            <CheckCircle2 size={18} className="mt-0.5 text-green-500 shrink-0" /> Everything in Base Plan
                        </li>
                    </ul>
                        <button 
                            disabled={isSaving || currentPlan === 'pro'}
                            onClick={() => updatePlan("Pro")} 
                            className="w-full py-3.5 rounded-xl font-bold text-[#bbed3b] bg-[#0a2e2a] hover:bg-[#133d39] transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 size={18} className="animate-spin" />}
                            {currentPlan === 'pro' ? 'Current Plan' : 'Select Pro'}
                        </button>
                </div>

                {/* 3. Ultimate Plan */}
                <div className="bg-gradient-to-b from-[#0a2e2a] to-[#124f46] border border-[#1a665b] rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="text-purple-400 shrink-0" size={24} />
                            <h3 className="text-xl font-bold text-white">Ultimate Edge</h3>
                        </div>
                        <p className="text-sm text-emerald-100/70 mb-6 h-10">For elite pharmacies running on full auto-pilot.</p>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm text-[#bbed3b] font-black">
                                <PhoneCall size={18} className="mt-0.5 shrink-0" /> AI Calling Assistant
                            </li>
                            <li className="flex items-start gap-3 text-xs text-emerald-100/80 leading-relaxed font-medium pl-8 -mt-2 mb-2">
                                Customers can actually call a phone number and talk to our AI voice bot to place orders or check stock instantly!
                            </li>
                            <li className="flex items-start gap-3 text-sm text-emerald-100 font-medium">
                                <CheckCircle2 size={18} className="mt-0.5 text-purple-400 shrink-0" /> Predictive Stock Restocking
                            </li>
                            <li className="flex items-start gap-3 text-sm text-emerald-100 font-medium">
                                <CheckCircle2 size={18} className="mt-0.5 text-purple-400 shrink-0" /> Multi-Store Management
                            </li>
                            <li className="flex items-start gap-3 text-sm text-emerald-100 font-medium">
                                <CheckCircle2 size={18} className="mt-0.5 text-purple-400 shrink-0" /> Dedicated Account Manager
                            </li>
                        </ul>
                        <button 
                            disabled={isSaving || currentPlan === 'ultimate'}
                            onClick={() => updatePlan("Ultimate")} 
                            className="w-full py-3.5 rounded-xl font-bold text-purple-900 bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-200 hover:to-purple-300 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 size={18} className="animate-spin" />}
                            {currentPlan === 'ultimate' ? 'Current Plan' : 'Select Ultimate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
