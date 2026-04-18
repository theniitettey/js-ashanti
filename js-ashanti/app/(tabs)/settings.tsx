import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import Typography from "@/constants/typography";
import { useState } from "react";
import { SFSymbol } from "expo-symbols";
import { SettingsItem, SettingsSectionHeader as SectionHeader } from "@/components/ui/settings-item";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { logout } = useAuth();
  const router = useRouter();
  
  const [darkMode, setDarkMode] = useState(colorScheme === "dark");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ACCOUNT Section */}
        <SectionHeader title="ACCOUNT" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="person.fill" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Profile Settings"
          />
          <SettingsItem
            icon="key.fill" iconColor={theme.destructive} iconBgColor={theme.destructive + "20"}
            title="Change Password"
          />
          <SettingsItem
            icon="envelope.fill" iconColor={theme.success} iconBgColor={theme.success + "20"}
            title="Email Notifications" isLast
          />
        </View>

        {/* PREFERENCES Section */}
        <SectionHeader title="PREFERENCES" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="moon.fill" iconColor={theme.foreground} iconBgColor={theme.muted}
            title="Dark Mode" hasToggle toggleValue={darkMode} onToggleChange={setDarkMode} hasArrow={false}
          />
          <SettingsItem
            icon="globe" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Language" subtitle="English"
          />
          <SettingsItem
            icon="dollarsign.circle.fill" iconColor={theme.warning} iconBgColor={theme.warning + "20"}
            title="Currency" subtitle="USD ($)" isLast
          />
        </View>

        {/* NOTIFICATIONS Section */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="bell.fill" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Push Notifications" hasToggle toggleValue={pushNotifications} onToggleChange={setPushNotifications} hasArrow={false}
          />
          <SettingsItem
            icon="envelope.fill" iconColor={theme.success} iconBgColor={theme.success + "20"}
            title="Email Alerts" hasToggle toggleValue={emailAlerts} onToggleChange={setEmailAlerts} hasArrow={false}
          />
          <SettingsItem
            icon="message.fill" iconColor={theme.warning} iconBgColor={theme.warning + "20"}
            title="SMS Alerts" hasToggle toggleValue={smsAlerts} onToggleChange={setSmsAlerts} hasArrow={false} isLast
          />
        </View>

        {/* SUPPORT Section */}
        <SectionHeader title="SUPPORT" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="lifepreserver.fill" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Help Center"
          />
          <SettingsItem
            icon="headphones" iconColor={theme.warning} iconBgColor={theme.warning + "20"}
            title="Contact Support"
          />
          <SettingsItem
            icon="doc.text.fill" iconColor={theme.mutedForeground} iconBgColor={theme.muted}
            title="Terms of Service" isLast
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.destructive + "15" }]} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={theme.destructive} />
          <Text style={[styles.logoutButtonText, { color: theme.destructive }]}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    fontSize: Typography.xs,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 1,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
