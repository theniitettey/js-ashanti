import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#ffffff",
    foreground: "#1f1f22",
    text: "#1f1f22",
    card: "#ffffff",
    cardForeground: "#1f1f22",
    popover: "#ffffff",
    popoverForeground: "#1f1f22",
    primary: "#252525",
    primaryForeground: "#fafafa",
    secondary: "#f4f4f5",
    secondaryForeground: "#252525",
    muted: "#f4f4f5",
    mutedForeground: "#71717a",
    accent: "#f4f4f5",
    accentForeground: "#252525",
    destructive: "#ef4444",
    destructiveForeground: "#fafafa",
    border: "#e4e4e7",
    input: "#e4e4e7",
    ring: "#a1a1aa",
    success: "#10B981",
    warning: "#F59E0B",
    
    // backwards compatibility for Expo default templates
    tint: "#252525",
    icon: "#71717a",
    tabIconDefault: "#71717a",
    tabIconSelected: "#252525",
    cardBg: "#ffffff",
  },
  dark: {
    background: "#09090b",
    foreground: "#ffffff",
    text: "#ffffff",
    card: "#18181b",
    cardForeground: "#ffffff",
    popover: "#18181b",
    popoverForeground: "#ffffff",
    primary: "#fafafa",
    primaryForeground: "#1f1f22",
    secondary: "#27272a",
    secondaryForeground: "#ffffff",
    muted: "#27272a",
    mutedForeground: "#a1a1aa",
    accent: "#27272a",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#27272a",
    input: "#27272a",
    ring: "#52525b",
    success: "#10B981",
    warning: "#F59E0B",
    
    // backwards compatibility for Expo default templates
    tint: "#fafafa",
    icon: "#a1a1aa",
    tabIconDefault: "#a1a1aa",
    tabIconSelected: "#fafafa",
    cardBg: "#18181b",
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
