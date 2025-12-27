export const colors = {
    // Base - Dark, Deep Blue/Black for OLED
    background: '#0a0a0f',
    surface: '#13131a',
    surfaceHighlight: '#1c1c26',

    // Primary - Vivid Purple/Blue Gradient feel
    primary: '#6366f1', // Indigo 500
    primaryDark: '#4f46e5', // Indigo 600
    primaryLight: '#818cf8', // Indigo 400

    // Accents
    accent: '#8b5cf6', // Violet 500
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#9ca3af', // Gray 400
    textTertiary: '#6b7280', // Gray 500

    // Borders & Dividers
    border: '#27272a', // Zinc 800
    borderLight: '#3f3f46', // Zinc 700
};

export const typography = {
    fontFamily: {
        regular: 'Inter-Regular', // Fallback to system if not loaded
        medium: 'Inter-Medium',
        bold: 'Inter-Bold',
        semiBold: 'Inter-SemiBold',
    },
    size: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
        xxxl: 40,
    },
    lineHeight: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 28,
        xl: 32,
        xxl: 40,
    },
};

export const layout = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 8,    // Increased from 6
        md: 16,   // Increased from 12
        lg: 20,   // Increased from 16
        xl: 28,   // Increased from 24
        xxl: 32,  // New value for extra rounded
        full: 9999,
    },
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    glow: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
};
