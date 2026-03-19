import React from 'react';
import Logo3DFooter from './effects/Logo3DFooter';

interface SanjeevaniLogoProps {
    className?: string;
    textColor?: string;
    iconColor?: string;
    iconAccent?: string;
    width?: string | number;
    height?: string | number;
    iconScale?: number; // Added to manually control 3D icon size
    textScale?: number; // Added to manually control "Sanjeevani" text size
}

/**
 * SanjeevaniLogo
 * Combines a static 3D flower icon with the hand-drawn SANJEEVANI text.
 */
const SanjeevaniLogo: React.FC<SanjeevaniLogoProps> = ({
    className = "",
    textColor = "#000000",
    iconColor = "#000000",
    iconAccent = "#d4ed66",
    width = 240,
    height = 40,
    iconScale = 1.0, // Default 1.0 (baseline)
    textScale = 1.0, // Default 1.0 (baseline)
}) => {
    // We calculate the icon size based on height and the manual scale factor
    // Baseline icon ratio is 1.6, we multiply by iconScale
    const h = typeof height === 'number' ? height : 40;
    const iconSize = h * 1.6 * iconScale;
    
    // Baseline text height is 70% of total height, we multiply by textScale
    const textHeightAttr = (h * 0.7 * textScale);

    return (
        <div
            className={`flex items-center ${className}`}
            style={{
                height,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                overflow: 'visible'
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

            {/* ── SANJEEVANI Text (SVG) ── */}
            <div style={{ height: textHeightAttr, flexShrink: 0 }}>
                <svg
                    viewBox="230 50 1110 160" // Adjusted to show only text
                    style={{ height: '100%', width: 'auto', display: 'block' }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g
                        stroke={textColor}
                        strokeWidth="19"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                    >
                        {/* S */}
                        <path d="M240 70 H315" />
                        <path d="M240 70 V115" />
                        <path d="M240 115 H315" />
                        <path d="M315 115 V160" />
                        <path d="M240 160 H315" />

                        {/* A */}
                        <path d="M355 160 L400 70" />
                        <path d="M400 70 L445 160" />
                        <path d="M375 122 H425" />

                        {/* N */}
                        <path d="M485 160 V70" />
                        <path d="M485 70 L565 160" />
                        <path d="M565 160 V70" />

                        {/* J */}
                        <path d="M640 70 V165" />
                        <path d="M640 165 Q640 190 608 190" />

                        {/* E */}
                        <path d="M710 70 V160" />
                        <path d="M710 70 H790" />
                        <path d="M710 115 H778" />
                        <path d="M710 160 H790" />

                        {/* E */}
                        <path d="M830 70 V160" />
                        <path d="M830 70 H910" />
                        <path d="M830 115 H898" />
                        <path d="M830 160 H910" />

                        {/* V */}
                        <path d="M950 70 L990 160" />
                        <path d="M1030 70 L990 160" />

                        {/* A */}
                        <path d="M1075 160 L1120 70" />
                        <path d="M1120 70 L1165 160" />
                        <path d="M1095 122 H1145" />

                        {/* N */}
                        <path d="M1210 160 V70" />
                        <path d="M1210 70 L1290 160" />
                        <path d="M1290 160 V70" />

                        {/* I */}
                        <path d="M1330 70 V160" />
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default SanjeevaniLogo;
