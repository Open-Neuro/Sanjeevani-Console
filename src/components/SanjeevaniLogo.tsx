import React, { memo } from 'react';
import Logo3DFooter from './effects/Logo3DFooter';

interface SanjeevaniLogoProps {
    className?: string;
    textColor?: string;
    iconColor?: string;
    iconAccent?: string;
    height?: string | number;
    iconScale?: number; // Added to manually control 3D icon size
    textScale?: number; // Added to manually control "Sanjeevani" text size
    isExpanded?: boolean; // Control text visibility
}

/**
 * SanjeevaniLogo
 * Combines a static 3D flower icon with the typography text.
 * Memoized to prevent re-renders (and 3D context re-init) during navigation.
 */
const SanjeevaniLogo: React.FC<SanjeevaniLogoProps> = memo(({
    className = "",
    textColor = "#000000",
    iconColor = "#000000",
    iconAccent = "#d4ed66",
    height = 40,
    iconScale = 1.0, // Default 1.0 (baseline)
    textScale = 1.0, // Default 1.0 (baseline)
    isExpanded = true,
}) => {
    // We calculate the icon size based on height and the manual scale factor
    // Reduced multiplier to 1.15 for better balance with modern typography
    const h = typeof height === 'number' ? height : 40;
    const iconSize = h * 1.15 * iconScale;
    
    // Baseline text height is 70% of total height, we multiply by textScale
    const textHeightAttr = (h * 0.7 * textScale);

    return (
        <div
            className={`flex items-center ${className}`}
            style={{
                height,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6, // Tighter gap for modern look
                overflow: 'visible',
                justifyContent: 'flex-start' // Ensure left alignment
            }}
        >
            {/* ── 3D Static Icon ── */}
            <div style={{ width: iconSize, height: iconSize, flexShrink: 0, position: 'relative' }}>
                <Logo3DFooter
                    isStatic={true}
                    color={iconColor}
                    highlightColor={iconAccent}
                    rotationY={0} // Exact front-facing
                />
            </div>

            {/* ── SANJEEVANI Text (Modern Typography) ── */}
            <div 
                style={{ 
                    height: textHeightAttr, 
                    display: isExpanded ? 'flex' : 'none', // Hide text when sidebar is collapsed
                    alignItems: 'center',
                    flexShrink: 0,
                    marginLeft: 0
                }}
            >
                <span style={{
                    fontSize: Math.max(h * 0.55 * textScale, 14), // Use textScale factor
                    fontWeight: 700,
                    color: textColor,
                    fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif",
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    textTransform: 'lowercase', // Modern minimalist approach
                }}>
                    sanjeevani
                </span>
            </div>
        </div>
    );
});

export default SanjeevaniLogo;
