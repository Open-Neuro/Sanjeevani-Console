import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
    Building2, 
    ArrowRight, 
    MapPin, 
    PhoneCall, 
    Sparkles, 
    CheckCircle2, 
    Loader2, 
    Zap, 
    Bot 
} from "lucide-react";
import SanjeevaniLogo from "../components/SanjeevaniLogo";


// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

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
        lat: "",
        lng: "",
        plan: ""
    });

// Profile check is now handled by SignUp redirection and AuthContext

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.pharmacyName.trim()) newErrors.pharmacyName = "Pharmacy name is required";
            if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";
            if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";
        } else if (currentStep === 2) {
            if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
            if (!formData.address.trim()) newErrors.address = "Store address is required";
            if (!formData.lat || !formData.lng) newErrors.location = "Please select your location on the map";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };
    const handleBack = () => {
        setErrors({});
        setStep(step - 1);
    };

    const completeOnboarding = async (selectedPlan: string) => {
        setIsSaving(true);
        const finalData = { 
            pharmacy_name: formData.pharmacyName,
            owner_name: formData.ownerName,
            license_number: formData.licenseNumber,
            store_type: formData.storeType,
            phone_number: formData.phone,
            address: formData.address,
            lat: formData.lat ? parseFloat(formData.lat) : null,
            lng: formData.lng ? parseFloat(formData.lng) : null,
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
        <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Building2 size={12} /> Pharmacy Profile
                </div>
                <h2 className="text-4xl font-black text-[#0a2e2a] tracking-tight">Tell us about your pharmacy.</h2>
                <p className="text-gray-500 mt-3 text-lg">We'll use this to set up your digital storefront and billing systems.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="group">
                    <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-2 group-focus-within:text-[#bbed3b] transition-colors">Pharmacy/Business Name</label>
                    <div className="relative">
                        <input 
                            required
                            type="text" 
                            value={formData.pharmacyName}
                            onChange={e => setFormData({ ...formData, pharmacyName: e.target.value })}
                            className={`w-full px-5 py-4 bg-white border-2 ${errors.pharmacyName ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:outline-none focus:border-[#0a2e2a] transition-all text-base font-bold text-[#0a2e2a] placeholder:text-gray-300`}
                            placeholder="e.g. Sanjeevani Medical Store" 
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a2e2a]">
                            <Building2 size={20} />
                        </div>
                    </div>
                    {errors.pharmacyName && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors.pharmacyName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-2 group-focus-within:text-[#bbed3b] transition-colors">Owner Name</label>
                        <input 
                            type="text" 
                            value={formData.ownerName}
                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                            className={`w-full px-5 py-4 bg-white border-2 ${errors.ownerName ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:outline-none focus:border-[#0a2e2a] transition-all text-base font-bold text-[#0a2e2a] placeholder:text-gray-300`}
                            placeholder="e.g. Rahul Sharma" 
                        />
                        {errors.ownerName && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors.ownerName}</p>}
                    </div>
                    <div className="group">
                        <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-2 group-focus-within:text-[#bbed3b] transition-colors">Store Type</label>
                        <select 
                            value={formData.storeType}
                            onChange={e => setFormData({ ...formData, storeType: e.target.value })}
                            className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#0a2e2a] transition-all text-base font-bold text-[#0a2e2a] appearance-none"
                        >
                            <option value="Retail Pharmacy">Retail Pharmacy</option>
                            <option value="Wholesale Distributor">Wholesale Distributor</option>
                            <option value="Hospital Pharmacy">Hospital Pharmacy</option>
                            <option value="Clinic Dispensary">Clinic Dispensary</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-2 group-focus-within:text-[#bbed3b] transition-colors">Drug License Number</label>
                        <input 
                            type="text" 
                            value={formData.licenseNumber}
                            onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                            className={`w-full px-5 py-4 bg-white border-2 ${errors.licenseNumber ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:outline-none focus:border-[#0a2e2a] transition-all text-base font-mono font-bold text-[#0a2e2a] placeholder:text-gray-300 tracking-wider`}
                            placeholder="e.g. MH-MUM-123456" 
                        />
                        {errors.licenseNumber && <p className="text-red-500 text-[10px] font-bold uppercase mt-1.5 ml-1">{errors.licenseNumber}</p>}
                    </div>
                    <div className="group">
                        <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-2 group-focus-within:text-[#bbed3b] transition-colors">Drug License Photo</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                className="hidden" 
                                id="license-upload"
                                accept="image/*"
                            />
                            <label 
                                htmlFor="license-upload"
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:border-[#0a2e2a] hover:bg-white transition-all text-sm font-bold text-gray-500"
                            >
                                <Sparkles size={16} /> Click to upload photo
                            </label>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={handleNext}
                    className="w-full mt-4 px-8 py-5 bg-[#0a2e2a] text-[#bbed3b] rounded-2xl font-black text-lg hover:bg-[#133d39] transition-all shadow-xl shadow-[#0a2e2a]/20 flex items-center justify-center gap-3 group"
                >
                    Continue to Location <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-700 h-full flex flex-col">
            <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                    <MapPin size={12} /> Contact Details
                </div>
                <h2 className="text-3xl font-black text-[#0a2e2a] tracking-tight">Where can we find you?</h2>
                <p className="text-gray-500 mt-2 text-base">Accurate location is crucial for AI delivery tracking.</p>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="group">
                    <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-1.5 group-focus-within:text-[#bbed3b] transition-colors">Public Phone Number</label>
                    <div className="relative">
                        <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-5 py-3 bg-white border-2 ${errors.phone ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#0a2e2a] transition-all text-base font-bold text-[#0a2e2a] placeholder:text-gray-300`}
                            placeholder="e.g. +91 98765 43210" 
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a2e2a]">
                            <PhoneCall size={18} />
                        </div>
                    </div>
                    {errors.phone && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-1">{errors.phone}</p>}
                </div>

                <div className="group">
                    <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-1.5 group-focus-within:text-[#bbed3b] transition-colors">Store Address</label>
                    <textarea 
                        rows={2}
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full px-5 py-3 bg-white border-2 ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#0a2e2a] transition-all text-base font-bold text-[#0a2e2a] placeholder:text-gray-300 resize-none custom-scrollbar`}
                        placeholder="Enter full address..." 
                    />
                    {errors.address && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-1">{errors.address}</p>}
                </div>
                
                <div className="group flex-1 flex flex-col min-h-0">
                    <label className="block text-xs font-black text-[#0a2e2a] uppercase tracking-widest mb-1.5 group-focus-within:text-[#bbed3b] transition-colors">
                        Pharmacy Location — {formData.lat ? <span className="text-green-600">Location Locked</span> : <span className="text-orange-500">Click on Map to Set</span>}
                    </label>
                    <div className={`flex-1 w-full bg-gray-100 border-2 ${errors.location ? 'border-red-500' : 'border-gray-200'} rounded-2xl overflow-hidden relative shadow-inner`}>
                        <MapContainer 
                            center={[19.1380, 77.3180]} 
                            zoom={13} 
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {formData.lat && formData.lng && (
                                <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
                            )}
                            <MapEvents onLocationSelect={(lat, lng) => {
                                setFormData({ ...formData, lat: lat.toFixed(6), lng: lng.toFixed(6) });
                            }} />
                        </MapContainer>
                        
                        {!formData.lat && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-[#0a2e2a]/5 z-[1000]">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-xl flex items-center gap-2">
                                    <MapPin size={16} className="text-[#0a2e2a] animate-bounce" />
                                    <span className="text-[10px] font-black text-[#0a2e2a] uppercase tracking-widest">Select your store on the map</span>
                                </div>
                            </div>
                        )}
                    </div>
                    {errors.location && <p className="text-red-500 text-[9px] font-bold uppercase mt-1 ml-1">{errors.location}</p>}
                </div>
                
                <div className="flex gap-4 mt-2">
                    <button 
                        onClick={handleBack}
                        className="flex-1 px-8 py-3 bg-white text-[#0a2e2a] border-2 border-gray-200 rounded-xl font-black text-sm hover:bg-gray-50 transition-all shadow-sm"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleNext}
                        className="flex-[2] px-8 py-3 bg-[#0a2e2a] text-[#bbed3b] rounded-xl font-black text-sm hover:bg-[#133d39] transition-all shadow-xl shadow-[#0a2e2a]/20 flex items-center justify-center gap-3 group"
                    >
                        Choose Plan <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-in fade-in zoom-in-95 duration-700 max-w-7xl mx-auto w-full h-full flex flex-col justify-center">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#bbed3b]/10 text-[#0a2e2a] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                    <Sparkles size={12} className="text-[#bbed3b]" /> Scale Your Operations
                </div>
                <h2 className="text-4xl font-black text-[#0a2e2a] tracking-tight mb-2">Choose your Sanjeevani OS Plan</h2>
                <p className="text-gray-500 text-base max-w-xl mx-auto">Select a plan to automate your pharmacy instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* 1. Base Plan */}
                <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-6 flex flex-col hover:border-[#bbed3b]/30 transition-all hover:shadow-xl group">
                    <div className="mb-4">
                        <h3 className="text-xl font-black text-[#0a2e2a] mb-1">Sanjeevani Base</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Free for startups</p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                        {["Advanced Inventory", "Bulk Excel Sync", "Low Stock Alerts", "Manual POS Sync"].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-600 font-bold text-xs leading-tight">
                                <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                                    <CheckCircle2 size={12} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button 
                        disabled={isSaving}
                        onClick={() => completeOnboarding("Base")} 
                        className="w-full py-4 rounded-xl font-black text-[#0a2e2a] bg-gray-50 hover:bg-[#bbed3b] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-sm"
                    >
                        {isSaving && <Loader2 size={18} className="animate-spin" />}
                        Get Started
                    </button>
                </div>

                {/* 2. Pro Plan */}
                <div className="bg-[#0a2e2a] border-2 border-[#bbed3b] rounded-[2rem] p-6 flex flex-col shadow-2xl relative z-10 transform lg:-translate-y-4">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#bbed3b] text-[#0a2e2a] text-[8px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                        Recommended
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="text-[#bbed3b]" size={20} />
                            <h3 className="text-xl font-black text-white">Sanjeevani Pro</h3>
                        </div>
                        <p className="text-emerald-100/30 text-[10px] font-bold uppercase tracking-wider">Custom Pricing</p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                        {[
                            "WhatsApp & Telegram Orders",
                            "AI Insights & Forecasting",
                            "Patient Refill Reminders",
                            "Everything in Base Plan"
                        ].map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-emerald-50 font-bold text-xs leading-tight">
                                <div className="w-5 h-5 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={12} className="text-[#bbed3b]" />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button 
                        disabled={isSaving}
                        onClick={() => completeOnboarding("Pro")} 
                        className="w-full py-4 rounded-xl font-black text-[#0a2e2a] bg-[#bbed3b] hover:bg-white transition-all shadow-[0_15px_30px_-5px_rgba(187,237,59,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                    >
                        {isSaving && <Loader2 size={18} className="animate-spin" />}
                        Process Activation
                    </button>
                </div>

                {/* 3. Ultimate Plan */}
                <div className="bg-gradient-to-br from-[#131313] to-[#0a2e2a] border border-purple-500/30 rounded-[2rem] p-6 flex flex-col shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Bot className="text-purple-400" size={20} />
                                <h3 className="text-xl font-black text-white tracking-tight">ULTIMATE EDGE</h3>
                            </div>
                            <p className="text-purple-100/20 text-[10px] font-bold uppercase tracking-wider">Enterprise</p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex flex-col gap-1">
                                <div className="flex items-start gap-3 text-purple-200 font-black text-xs leading-tight">
                                    <PhoneCall size={14} className="text-purple-400 shrink-0 mt-0.5" /> AI Calling Assistant
                                </div>
                            </li>
                            {["Predictive Restocking", "Multi-Store Management", "Dedicated Manager"].map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-emerald-50/70 font-bold text-xs leading-tight">
                                    <div className="w-5 h-5 rounded-full bg-purple-900/30 flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={12} className="text-purple-400" />
                                    </div>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <button 
                            disabled={isSaving}
                            onClick={() => completeOnboarding("Ultimate")} 
                            className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                        >
                            {isSaving && <Loader2 size={18} className="animate-spin" />}
                            Process Request
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <button onClick={handleBack} className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-[#0a2e2a] transition-colors flex items-center gap-2 mx-auto">
                    <span className="text-base">←</span> Go back to setup
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white selection:bg-[#bbed3b] selection:text-[#0a2e2a] flex flex-col md:flex-row overflow-hidden">
            {/* Left Side - Visual Panel (Hidden on small screens for Steps 1 & 2) */}
            {step < 3 && (
                <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-[#0a2e2a] relative overflow-hidden flex-col justify-between p-12">
                    <div className="relative z-10">
                        <SanjeevaniLogo iconColor="#bbed3b" iconAccent="#ffffff" textColor="#ffffff" height={32} />
                        <div className="mt-20">
                            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight">
                                Transform your <br />
                                <span className="text-[#bbed3b]">Pharmacy</span> experience.
                            </h1>
                            <p className="text-emerald-100/70 mt-6 text-xl max-w-md leading-relaxed">
                                Join thousands of modern pharmacies using Sanjeevani OS to automate operations and grow faster.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
                            <h3 className="text-white font-black text-lg mb-2 uppercase tracking-widest">Premium Intelligence</h3>
                            <p className="text-emerald-100/40 text-sm leading-relaxed">
                                Our OS is built for pharmacies that value speed and accuracy. Automate your inventory and grow your customer base with Sanjeevani.
                            </p>
                        </div>
                    </div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                        <img 
                            src="/pharmacy_onboarding_visual_1777213268882.png" 
                            alt="Background" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0a2e2a] via-[#0a2e2a]/80 to-transparent"></div>
                </div>
            )}

            {/* Right Side - Form Panel */}
            <div className={`flex-1 flex flex-col ${step === 3 ? 'w-full' : 'md:w-3/5 lg:w-1/2'} h-screen overflow-y-auto custom-scrollbar`}>
                {/* Mobile/Step3 Header */}
                {(step === 3 || window.innerWidth < 768) && (
                    <div className="p-6 md:px-12 flex justify-between items-center">
                        <SanjeevaniLogo iconColor="#0a2e2a" iconAccent="#bbed3b" textColor="#0a2e2a" height={24} />
                        {step < 3 && (
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-[#0a2e2a]' : 'w-3 bg-gray-200'}`}></div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className={`flex-1 flex flex-col ${step === 3 ? 'justify-center py-4' : 'justify-center'} px-6 md:px-16 lg:px-24 max-w-4xl mx-auto w-full h-full overflow-hidden`}>
                    {/* Stepper for Desktop */}
                    {step < 3 && (
                        <div className="hidden md:flex items-center gap-6 mb-12">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-[#0a2e2a] text-[#bbed3b]' : 'bg-gray-100 text-gray-400'}`}>1</div>
                                <span className={`text-sm font-bold ${step >= 1 ? 'text-[#0a2e2a]' : 'text-gray-400'}`}>Business Info</span>
                            </div>
                            <div className="h-px w-12 bg-gray-200"></div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-[#0a2e2a] text-[#bbed3b]' : 'bg-gray-100 text-gray-400'}`}>2</div>
                                <span className={`text-sm font-bold ${step >= 2 ? 'text-[#0a2e2a]' : 'text-gray-400'}`}>Contact & Location</span>
                            </div>
                            <div className="h-px w-12 bg-gray-200"></div>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-[#0a2e2a] text-[#bbed3b]' : 'bg-gray-100 text-gray-400'}`}>3</div>
                                <span className={`text-sm font-bold ${step >= 3 ? 'text-[#0a2e2a]' : 'text-gray-400'}`}>Finalize</span>
                            </div>
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>
            </div>
        </div>
    );
}
