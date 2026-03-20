import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Sparkles, CheckCircle2, Bot, ArrowRight, Zap, PhoneCall, Loader2 } from "lucide-react";
import SanjeevaniLogo from "../components/SanjeevaniLogo";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
    const navigate = useNavigate();
    const { token, updateUser } = useAuth();
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        pharmacyName: "",
        ownerName: "",
        licenseNumber: "",
        storeType: "Retail Pharmacy",
        phone: "",
        address: "",
        plan: ""
    });

// Profile check is now handled by SignUp redirection and AuthContext

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const completeOnboarding = async (selectedPlan: string) => {
        setIsSaving(true);
        const finalData = { 
            pharmacy_name: formData.pharmacyName,
            owner_name: formData.ownerName,
            license_number: formData.licenseNumber,
            store_type: formData.storeType,
            phone_number: formData.phone,
            address: formData.address,
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
                navigate("/dashboard");
            } else {
                console.error("Failed to save profile to backend");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error saving onboarding data:", error);
            navigate("/dashboard");
        } finally {
            setIsSaving(false);
        }
    };

    const renderStep1 = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600">
                    <Building2 size={24} />
                </div>
                <h2 className="text-3xl font-bold text-[#0a2e2a] tracking-tight">Tell us about your pharmacy.</h2>
                <p className="text-gray-500 mt-2">This helps us personalize your dashboard experience.</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 object-cover">Pharmacy/Business Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.pharmacyName}
                        onChange={e => setFormData({ ...formData, pharmacyName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold"
                        placeholder="e.g. Sanjeevani Medical Store" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Owner Name</label>
                    <input 
                        type="text" 
                        value={formData.ownerName}
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold"
                        placeholder="e.g. Rahul Sharma" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Drug License Number</label>
                    <input 
                        type="text" 
                        value={formData.licenseNumber}
                        onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-mono tracking-tight"
                        placeholder="e.g. MH-MUM-123456" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Store Type</label>
                    <select 
                        value={formData.storeType}
                        onChange={e => setFormData({ ...formData, storeType: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] transition-all text-sm font-medium"
                    >
                        <option value="Retail Pharmacy">Retail Pharmacy</option>
                        <option value="Wholesale Distributor">Wholesale Distributor</option>
                        <option value="Hospital Pharmacy">Hospital Pharmacy</option>
                        <option value="Clinic Dispensary">Clinic Dispensary</option>
                    </select>
                </div>
                
                <button 
                    onClick={handleNext}
                    disabled={!formData.pharmacyName.trim()}
                    className="w-full mt-6 px-4 py-3.5 bg-[#0a2e2a] text-[#bbed3b] rounded-xl font-bold hover:bg-[#133d39] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                    Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                    <MapPin size={24} />
                </div>
                <h2 className="text-3xl font-bold text-[#0a2e2a] tracking-tight">Contact & Location.</h2>
                <p className="text-gray-500 mt-2">Where do your customers reach you?</p>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Public Phone Number</label>
                    <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold"
                        placeholder="e.g. +91 98765 43210" 
                    />
                    <p className="text-xs text-gray-400 mt-1.5">This number can be integrated with WhatsApp orders later.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Store Address</label>
                    <textarea 
                        rows={3}
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#bbed3b] focus:bg-white transition-all text-sm font-semibold resize-none custom-scrollbar"
                        placeholder="Enter full address for billing and deliveries..." 
                    />
                </div>
                
                <div className="flex gap-4 mt-8">
                    <button 
                        onClick={handleBack}
                        className="flex-1 px-4 py-3.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-sm"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleNext}
                        className="flex-[2] px-4 py-3.5 bg-[#0a2e2a] text-[#bbed3b] rounded-xl font-bold hover:bg-[#133d39] transition-all shadow-lg flex items-center justify-center gap-2 group"
                    >
                        See Premium Plans <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
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
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">₹999</span><span className="text-gray-500 font-medium">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {["Advanced Inventory Dashboard", "Bulk Add & Excel Sync", "Low Stock & Expiry Alerts", "Manual POS Integration"].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                                <CheckCircle2 size={18} className="mt-0.5 text-gray-400 shrink-0" /> {feat}
                            </li>
                        ))}
                    </ul>
                    <button 
                        disabled={isSaving}
                        onClick={() => completeOnboarding("Base")} 
                        className="w-full py-3.5 rounded-xl font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving && <Loader2 size={18} className="animate-spin" />}
                        Select Base
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
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">₹2,499</span><span className="text-gray-500 font-medium">/mo</span>
                    </div>
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
                            disabled={isSaving}
                            onClick={() => completeOnboarding("Pro")} 
                            className="w-full py-3.5 rounded-xl font-bold text-[#bbed3b] bg-[#0a2e2a] hover:bg-[#133d39] transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 size={18} className="animate-spin" />}
                            Start Pro Trial
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
                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">₹7,999</span><span className="text-emerald-100/50 font-medium">/mo</span>
                        </div>
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
                            disabled={isSaving}
                            onClick={() => completeOnboarding("Ultimate")} 
                            className="w-full py-3.5 rounded-xl font-bold text-purple-900 bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-200 hover:to-purple-300 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 size={18} className="animate-spin" />}
                            Go Ultimate
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center mt-8">
                <button onClick={handleBack} className="text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors">
                    ← Back to setup
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 selection:bg-[#bbed3b] selection:text-[#0a2e2a]">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-[#0a2e2a]/5 to-transparent pointer-events-none"></div>
            
            {/* Header/Nav inside wizard */}
            <div className="fixed top-6 left-6 flex items-center gap-2 z-50">
                <SanjeevaniLogo iconColor="#0a2e2a" iconAccent="#bbed3b" textColor="#0a2e2a" height={24} />
            </div>

            {/* Main Content Area */}
            {step === 3 ? (
                // Full width for Step 3
                <div className="w-full pt-16">
                    {renderStep3()}
                </div>
            ) : (
                // Centered card for Step 1 & 2
                <div className="w-full max-w-xl bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-[#0a2e2a]/5 border border-gray-100 relative z-10">
                    {/* Stepper indicator */}
                    <div className="flex gap-2 mb-8 absolute top-8 right-12">
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'w-8 bg-[#0a2e2a]' : 'w-4 bg-gray-200'}`}></div>
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'w-8 bg-[#0a2e2a]' : 'w-4 bg-gray-200'}`}></div>
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 3 ? 'w-8 bg-[#0a2e2a]' : 'w-4 bg-gray-200'}`}></div>
                    </div>
                    
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                </div>
            )}
        </div>
    );
}
