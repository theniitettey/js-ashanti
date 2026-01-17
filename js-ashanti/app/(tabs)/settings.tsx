import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Typography from "@/constants/typography";
import { useState } from "react";
import { SFSymbol } from "expo-symbols";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS, apiRequestWithAuth } from "@/lib/api";

interface SettingsItemProps {
  icon: SFSymbol;
  iconColor: string;
  iconBgColor: string;
  title: string;
  subtitle?: string;
  hasArrow?: boolean;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingsItem = ({
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
}: SettingsItemProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasToggle}
      style={styles.settingsItem}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <IconSymbol name={icon} size={20} color={iconColor} />
        </View>
        <Text style={[styles.settingsItemTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {subtitle && (
          <Text style={[styles.settingsItemSubtitle, { color: theme.icon }]}>
            {subtitle}
          </Text>
        )}
        {hasToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: "#3e3e3e", true: "#34C759" }}
            thumbColor="#ffffff"
          />
        ) : hasArrow ? (
          <IconSymbol name="chevron.right" size={20} color={theme.icon} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Text style={[styles.sectionHeader, { color: theme.icon }]}>{title}</Text>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleLogout = async () => {
    try {
      // Mobile app uses local token storage, so we just clear it locally
      // No need to call the backend logout endpoint since better-auth
      // expects sessions, not bearer tokens
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and auth state
      await logout();
      router.replace("/login");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ACCOUNT Section */}
      <SectionHeader title="ACCOUNT" />
      <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
        <SettingsItem
          icon="person.circle.fill"
          iconColor="#A855F7"
          iconBgColor="#2D1B4E"
          title="Profile Settings"
          onPress={() => {}}
        />
        <SettingsItem
          icon="key.fill"
          iconColor="#EF4444"
          iconBgColor="#4A1D1D"
          title="Change Password"
          onPress={() => {}}
        />
        <SettingsItem
          icon="envelope.fill"
          iconColor="#10B981"
          iconBgColor="#1A3D2F"
          title="Email Notifications"
          onPress={() => {}}
        />
      </View>

      {/* PREFERENCES Section */}
      <SectionHeader title="PREFERENCES" />
      <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
        <SettingsItem
          icon="paintpalette.fill"
          iconColor="#A855F7"
          iconBgColor="#2D1B4E"
          title="Theme Selection"
          onPress={() => {}}
        />
        <SettingsItem
          icon="moon.fill"
          iconColor="#9CA3AF"
          iconBgColor="#374151"
          title="Dark Mode"
          hasToggle
          toggleValue={darkMode}
          onToggleChange={setDarkMode}
          hasArrow={false}
        />
        <SettingsItem
          icon="globe"
          iconColor="#3B82F6"
          iconBgColor="#1E3A5F"
          title="Language"
          subtitle="English"
          onPress={() => {}}
        />
        <SettingsItem
          icon="dollarsign.circle.fill"
          iconColor="#F59E0B"
          iconBgColor="#4A3410"
          title="Currency"
          subtitle="USD ($)"
          onPress={() => {}}
        />
      </View>

      {/* BUSINESS Section */}
      <SectionHeader title="BUSINESS" />
      <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
        <SettingsItem
          icon="storefront.fill"
          iconColor="#A855F7"
          iconBgColor="#2D1B4E"
          title="Store Information"
          onPress={() => {}}
        />
        <SettingsItem
          icon="creditcard.fill"
          iconColor="#10B981"
          iconBgColor="#1A3D2F"
          title="Payment Methods"
          onPress={() => {}}
        />
        <SettingsItem
          icon="shippingbox.fill"
          iconColor="#06B6D4"
          iconBgColor="#1A3D47"
          title="Shipping Options"
          onPress={() => {}}
        />
      </View>

      {/* SECURITY Section */}
      <SectionHeader title="SECURITY" />
      <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
        <SettingsItem
          icon="checkmark.shield.fill"
          iconColor="#EF4444"
          iconBgColor="#4A1D1D"
          title="Two-Factor Authentication"
          onPress={() => {}}
        />
        <SettingsItem
          icon="clock.fill"
          iconColor="#A855F7"
          iconBgColor="#2D1B4E"
          title="Login History"
          onPress={() => {}}
        />
        <SettingsItem
          icon="touchid"
          iconColor="#3B82F6"
          iconBgColor="#1E3A5F"
          title="Privacy Settings"
          onPress={() => {}}
        />
      </View>

      {/* NOTIFICATIONS Section */}
      <SectionHeader title="NOTIFICATIONS" />
      <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
        <SettingsItem
          icon="bell.fill"
          iconColor="#3B82F6"
          iconBgColor="#1E3A5F"
          title="Push Notifications"
          hasToggle
          toggleValue={pushNotifications}
          onToggleChange={setPushNotifications}
          hasArrow={false}
        />
        <SettingsItem
          icon="envelope.fill"
          iconColor="#10B981"
          iconBgColor="#1A3D2F"
          title="Email Alerts"
          hasToggle
          toggleValue={emailAlerts}
          onToggleChange={setEmailAlerts}
          hasArrow={false}
        />
        <SettingsItem
          icon="message.fill"
          iconColor="#F97316"
          iconBgColor="#4A2910"
          title="SMS Alerts"
          hasToggle
          toggleValue={smsAlerts}
          onToggleChange={setSmsAlerts}
          hasArrow={false}
        />
      </View>

      {/* SUPPORT Section */}
      <SectionHeader title="SUPPORT" />
      <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
        <SettingsItem
          icon="lifepreserver.fill"
          iconColor="#06B6D4"
          iconBgColor="#1A3D47"
          title="Help Center"
          onPress={() => {}}
        />
        <SettingsItem
          icon="headphones"
          iconColor="#F97316"
          iconBgColor="#4A2910"
          title="Contact Support"
          onPress={() => {}}
        />
        <SettingsItem
          icon="doc.text.fill"
          iconColor="#6B7280"
          iconBgColor="#374151"
          title="Terms of Service"
          onPress={() => {}}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <IconSymbol
          name="rectangle.portrait.and.arrow.right"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: Typography.xs,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  section: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#222222",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsItemTitle: {
    fontSize: Typography.md,
    fontWeight: "500",
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsItemSubtitle: {
    fontSize: Typography.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.md,
    fontWeight: "600",
  },
});
