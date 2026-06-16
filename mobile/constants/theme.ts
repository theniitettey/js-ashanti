import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#F8FAFC",
    foreground: "#0F172A",
    text: "#0F172A",
    card: "#FFFFFF",
    cardForeground: "#0F172A",
    popover: "#FFFFFF",
    popoverForeground: "#0F172A",
    primary: "#5E6AD2",
    primaryForeground: "#FFFFFF",
    secondary: "#F1F5F9",
    secondaryForeground: "#334155",
    muted: "#F1F5F9",
    mutedForeground: "#64748B",
    accent: "#EEF2FF",
    accentForeground: "#4338CA",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    border: "#E2E8F0",
    input: "#E2E8F0",
    ring: "#5E6AD2",
    success: "#059669",
    warning: "#D97706",
    
    // backwards compatibility for Expo default templates
    tint: "#5E6AD2",
    icon: "#64748B",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#5E6AD2",
    cardBg: "#FFFFFF",
  },
  dark: {
    background: "#050506",
    foreground: "#EDEDEF",
    text: "#EDEDEF",
    card: "#0a0a0c",
    cardForeground: "#EDEDEF",
    popover: "#0a0a0c",
    popoverForeground: "#EDEDEF",
    primary: "#5E6AD2",
    primaryForeground: "#FFFFFF",
    secondary: "#1a1a2e",
    secondaryForeground: "#EDEDEF",
    muted: "#141418",
    mutedForeground: "#8A8F98",
    accent: "#1a1a2e",
    accentForeground: "#A5B4FC",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.08)",
    input: "rgba(255, 255, 255, 0.08)",
    ring: "#5E6AD2",
    success: "#059669",
    warning: "#D97706",
    
    // backwards compatibility for Expo default templates
    tint: "#5E6AD2",
    icon: "#8A8F98",
    tabIconDefault: "#8A8F98",
    tabIconSelected: "#5E6AD2",
    cardBg: "#0a0a0c",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
