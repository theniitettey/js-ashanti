import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { IconSymbol } from "./icon-symbol";
import { Colors } from "@/constants/theme";
import { SFSymbol } from "expo-symbols";

export interface SettingsItemProps {
  icon: SFSymbol | any;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  hasArrow?: boolean;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
}

export function SettingsItem({
  icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  hasArrow = true,
  hasToggle = false,
  toggleValue = false,
  onToggleChange,
  onPress,
  isLast = false,
}: SettingsItemProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const activeIconColor = iconColor || theme.foreground;
  const activeIconBg = iconBgColor || theme.muted;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasToggle}
      style={[
        styles.settingsItem,
        { borderBottomColor: theme.border },
        isLast && { borderBottomWidth: 0 },
      ]}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: activeIconBg }]}>
          <IconSymbol name={icon} size={20} color={activeIconColor} />
        </View>
        <Text style={[styles.settingsItemTitle, { color: theme.foreground }]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {subtitle && (
          <Text style={[styles.settingsItemSubtitle, { color: theme.mutedForeground }]}>
            {subtitle}
          </Text>
        )}
        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.background}
          />
        ) : hasArrow ? (
          <IconSymbol name="chevron.right" size={18} color={theme.mutedForeground} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export const SettingsSectionHeader = ({ title }: { title: string }) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <Text style={[styles.sectionHeader, { color: theme.mutedForeground }]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingsItemSubtitle: {
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 1,
  },
});
