import { useState, useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Sparkles } from "lucide-react";
import SanjeevaniLogo from "../components/SanjeevaniLogo";

// ── Sanjeevani Brand Colors (matches Dashboard) ────────
const C = {
    darkGreen: "#0C3831",
    midGreen: "#16a34a",
    lime: "#d4ed66",
    // Dashboard background & card colors
    pageBg: "#f4f7f6",
    cardBg: "#ffffff",
    inputBg: "#f8faf9",
    border: "#e2e8e5",
    textDark: "#0C3831",
    textMid: "#4b6b63",
    textMuted: "#94a3a0",
};

// ── Slider Data (AI-generated clean images, no overlays) ─
const SLIDES = [
    {
        bg: "/slide1.png",
        tagline: "AI-Powered\nPharmacy Management",
        sub: "Real-time inventory insights at your fingertips",
    },
    {
        bg: "/slide2.png",
        tagline: "Smart Demand\nForecasting",
        sub: "Predict and prevent stockouts before they happen",
    },
    {
        bg: "/slide3.png",
        tagline: "Better Patient\nOutcomes",
        sub: "Improve care with data-driven intelligence",
    },
];

// ── Typed Styles ───────────────────────────────────────
const S: Record<string, CSSProperties> = {
    page: {
        height: "100vh",
        background: C.pageBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: 20,
        boxSizing: "border-box",
        overflow: "hidden",
    },
    card: {
        display: "flex",
        width: "100%",
        maxWidth: 1000,
        height: "min(680px, 90vh)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(12,56,49,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        border: `1px solid ${C.border}`,
        background: C.cardBg,
    },

    /* ── LEFT PANEL (Image Slider) ── */
    leftPanel: {
        position: "relative",
        width: "48%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: C.darkGreen,
    },
    slideImg: {
        position: "absolute",
        inset: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0,
        transition: "opacity 0.6s ease",
    },
    slideOverlay: {
        position: "absolute",
        inset: 0,
        // Lighter gradient just at the bottom for text readability only
        background: "linear-gradient(to top, rgba(12,56,49,0.92) 0%, rgba(12,56,49,0.1) 50%, transparent 100%)",
        zIndex: 1,
    },
    topBar: {
        position: "relative",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        padding: "28px 32px 0",
    },
    logoRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    logoBox: {
        width: 38,
        height: 38,
        background: C.lime,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    logoText: {
        color: "#fff",
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: 0.2,
    },
    logoAccent: {
        color: C.lime,
    },
    captionBox: {
        position: "relative",
        zIndex: 2,
        padding: "80px 48px 48px", // Added top padding to push content down
        marginTop: "auto", // Align to bottom of the flex area
    },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(212,237,102,0.15)",
        border: "1px solid rgba(212,237,102,0.3)",
        borderRadius: 99,
        padding: "5px 12px",
        color: C.lime,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 14,
    },
    tagline: {
        color: C.lime, // Using brand lime instead of white
        fontSize: 32,
        fontWeight: 800,
        lineHeight: 1.2,
        margin: "0 0 10px",
        textShadow: "0 2px 24px rgba(0,0,0,0.6)",
    },
    taglineSub: {
        color: "rgba(255,255,255,0.9)", // Increased opacity for better readability
        fontSize: 15,
        fontWeight: 500,
        margin: "0 0 24px",
        maxWidth: "400px",
    },
    dotsRow: {
        display: "flex",
        gap: 6,
        alignItems: "center",
    },

    /* ── RIGHT PANEL (White — matches dashboard card style) ── */
    rightPanel: {
        width: "52%",
        background: C.cardBg,
        padding: "48px 48px 36px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
    },
    topBrand: {
        marginBottom: 42,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    topBrandRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Centered for vertical logo
        width: "100%",
    },
    topBrandDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: C.midGreen,
    },
    topBrandText: {
        fontSize: 12,
        fontWeight: 700,
        color: C.textMuted,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    heading: {
        color: C.textDark,
        fontSize: 32,
        fontWeight: 800,
        margin: "0 0 8px",
        letterSpacing: -0.5,
        textAlign: "center",
    },
    subText: {
        color: C.textMuted,
        fontSize: 15,
        margin: "0 auto 36px",
        lineHeight: 1.5,
        textAlign: "center",
        maxWidth: "420px",
    },
    googleBtn: {
        width: "100%",
        background: C.cardBg,
        border: `2px solid ${C.border}`,
        borderRadius: 14,
        color: C.textDark,
        fontSize: 15,
        fontWeight: 700,
        padding: "15px 0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "inherit",
        boxShadow: "0 2px 8px rgba(12,56,49,0.06)",
        transition: "all 0.25s ease",
    },
    trustBox: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(22,163,74,0.06)",
        border: `1px solid rgba(22,163,74,0.15)`,
        borderRadius: 12,
        padding: "12px 16px",
        marginTop: 20,
    },
    trustText: {
        color: C.textMid,
        fontSize: 12,
        lineHeight: 1.5,
    },
    terms: {
        color: C.textMuted,
        fontSize: 12,
        textAlign: "center",
        marginTop: 20,
        lineHeight: 1.7,
    },
    termsLink: {
        color: C.textMid,
        fontWeight: 700,
        textDecoration: "underline",
        textDecorationColor: C.border,
    },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "32px 0 0",
    },
    divLine: {
        flex: 1,
        height: 1,
        background: C.border,
    },
    divText: {
        color: C.textMuted,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
};

// ══════════════════════════════════════════════════════
export default function SignUp() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user || token) navigate("/dashboard");
    }, [user, token, navigate]);

    // Auto-advance slider
    useEffect(() => {
        const timer = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
                setFadeIn(true);
            }, 400);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        const width = 500, height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            "https://sanjeevanirxai-system.onrender.com/api/v1/auth/login",
            "Google Sign In",
            `width=${width},height=${height},left=${left},top=${top}`
        );

        const pollTimer = setInterval(() => {
            try {
                if (popup && popup.location.href.includes("/callback")) {
                    const url = new URL(popup.location.href);
                    const t = url.searchParams.get("token");
                    if (t) {
                        localStorage.setItem("sanjeevani_token", t);
                        popup.close();
                        clearInterval(pollTimer);
                        navigate("/dashboard");
                    }
                }
            } catch (_) { /* cross-origin – keep polling */ }
            if (popup && popup.closed) {
                clearInterval(pollTimer);
                setIsLoading(false);
            }
        }, 500);
    };

    const slide = SLIDES[currentSlide];

    return (
        <div style={S.page}>
            <div style={S.card}>

                {/* ══ LEFT: Image Slider ══ */}
                <div style={S.leftPanel}>
                    {/* Background image */}
                    <div
                        style={{
                            ...S.slideImg,
                            backgroundImage: `url(${slide.bg})`,
                            opacity: fadeIn ? 1 : 0,
                        }}
                    />
                    <div style={S.slideOverlay} />

                    <div style={S.slideOverlay} />

                    {/* Bottom caption + dots */}
                    <div style={S.captionBox}>
                        <div style={S.badge}>
                            <Sparkles size={10} /> Next-Gen Pharmacy OS
                        </div>
                        <p style={S.tagline}>
                            {slide.tagline.split("\n").map((line, i) => (
                                <span key={i}>{line}{i === 0 && <br />}</span>
                            ))}
                        </p>
                        <p style={S.taglineSub}>{slide.sub}</p>
                        <div style={S.dotsRow}>
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentSlide(i); setFadeIn(true); }}
                                    style={{
                                        height: 6,
                                        width: i === currentSlide ? 28 : 8,
                                        borderRadius: 3,
                                        border: "none",
                                        background: i === currentSlide ? C.lime : "rgba(255,255,255,0.3)",
                                        cursor: "pointer",
                                        padding: 0,
                                        transition: "width 0.35s, background 0.35s",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══ RIGHT: Clean White Form (matches dashboard) ══ */}
                <div style={S.rightPanel}>

                    {/* Brand Section */}
                    <div style={S.topBrand as any}>
                        <div style={S.topBrandRow as any}>
                            <SanjeevaniLogo
                                iconColor="#000000"
                                iconAccent="#d4ed66"
                                textColor="#000000"
                                height={34}
                                iconScale={1.2} // Matched branding
                                textScale={1.2} // Matched branding
                            />
                        </div>
                    </div>

                    {/* Heading */}
                    <h1 style={S.heading}>Welcome back</h1>
                    <p style={S.subText}>
                        Sign in to your Sanjeevani dashboard to manage your pharmacy operations.
                    </p>

                    {/* ─── The ONLY button: Continue with Google ─── */}
                    <button
                        id="google-signin-btn"
                        style={S.googleBtn}
                        onClick={handleGoogleLogin}
                        type="button"
                        disabled={isLoading}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.borderColor = C.midGreen;
                            el.style.background = "rgba(22,163,74,0.04)";
                            el.style.boxShadow = `0 4px 20px rgba(22,163,74,0.15)`;
                            el.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.borderColor = C.border;
                            el.style.background = C.cardBg;
                            el.style.boxShadow = "0 2px 8px rgba(12,56,49,0.06)";
                            el.style.transform = "none";
                        }}
                    >
                        {isLoading ? (
                            <span
                                style={{
                                    display: "inline-block",
                                    width: 20, height: 20,
                                    border: `2px solid ${C.border}`,
                                    borderTopColor: C.midGreen,
                                    borderRadius: "50%",
                                    animation: "spin 0.8s linear infinite",
                                    flexShrink: 0,
                                }}
                            />
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                        )}
                        <span>{isLoading ? "Opening Google Sign-in..." : "Continue with Google"}</span>
                    </button>

                    {/* HIPAA Trust badge */}
                    <div style={S.trustBox}>
                        <Shield size={15} color={C.midGreen} style={{ flexShrink: 0 }} />
                        <p style={S.trustText}>
                            Your data is <strong>encrypted</strong> and never shared.&nbsp;
                            HIPAA compliant · SOC 2 certified platform.
                        </p>
                    </div>

                    {/* Divider */}
                    <div style={S.divider}>
                        <div style={S.divLine} />
                        <span style={S.divText}>Sanjeevani AI &nbsp;·&nbsp; v2.0</span>
                        <div style={S.divLine} />
                    </div>

                    {/* Terms */}
                    <p style={S.terms}>
                        By continuing, you agree to our&nbsp;
                        <a href="#" style={S.termsLink}>Terms of Service</a>
                        &nbsp;&amp;&nbsp;
                        <a href="#" style={S.termsLink}>Privacy Policy</a>
                    </p>
                </div>
            </div>

            {/* Spinner animation */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}