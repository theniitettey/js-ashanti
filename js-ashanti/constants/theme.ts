/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const AppColors = {
  primary: "#EA580C",
  primaryLight: "#F97316",
  primaryDark: "#C2410C",
  white: "#FFFFFF",
  background: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceElevated: "#F5F5F5",
  border: "#E5E5E5",
  text: "#1C1917",
  textSecondary: "#78716C",
  textMuted: "#A8A29E",
  success: "#16A34A",
  warning: "#EAB308",
  error: "#DC2626",
  live: "#22C55E",
  offline: "#EF4444",
};

const tintLight = AppColors.textSecondary;
const tintDark = "#A8A29E";

export const Colors = {
  light: {
    text: AppColors.text,
    background: AppColors.background,
    tint: tintLight,
    icon: AppColors.primary,
    tabIconDefault: AppColors.textMuted,
    cardBg: AppColors.surface,
    tabIconSelected: AppColors.primary,
    primary: AppColors.primary,
    white: AppColors.white,
    surface: AppColors.surface,
    textSecondary: AppColors.textSecondary,
  },
  dark: {
    text: "#FAFAFA",
    background: "#1C1917",
    tint: tintDark,
    icon: AppColors.primaryLight,
    tabIconDefault: "#A8A29E",
    cardBg: "#292524",
    tabIconSelected: AppColors.primaryLight,
    primary: AppColors.primaryLight,
    white: AppColors.white,
    surface: "#292524",
    textSecondary: "#A8A29E",
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
