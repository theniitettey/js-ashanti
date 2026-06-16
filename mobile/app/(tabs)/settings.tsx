import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useColorScheme,
  Alert,
  Linking,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import Typography from "@/constants/typography";
import { useState, useEffect } from "react";
import { SFSymbol } from "expo-symbols";
import { SettingsItem, SettingsSectionHeader as SectionHeader } from "@/components/ui/settings-item";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "app_preferences";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { logout, userEmail } = useAuth();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(colorScheme === "dark");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem(PREFS_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.pushNotifications !== undefined) setPushNotifications(prefs.pushNotifications);
        if (prefs.emailAlerts !== undefined) setEmailAlerts(prefs.emailAlerts);
        if (prefs.smsAlerts !== undefined) setSmsAlerts(prefs.smsAlerts);
        if (prefs.darkMode !== undefined) setDarkMode(prefs.darkMode);
      }
    } catch {}
  };

  const savePreference = async (key: string, value: boolean) => {
    try {
      const saved = await AsyncStorage.getItem(PREFS_KEY);
      const prefs = saved ? JSON.parse(saved) : {};
      prefs[key] = value;
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  };

  const togglePush = (val: boolean) => { setPushNotifications(val); savePreference("pushNotifications", val); };
  const toggleEmail = (val: boolean) => { setEmailAlerts(val); savePreference("emailAlerts", val); };
  const toggleSms = (val: boolean) => { setSmsAlerts(val); savePreference("smsAlerts", val); };
  const toggleDark = (val: boolean) => { setDarkMode(val); savePreference("darkMode", val); };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, "This feature is coming soon.");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Settings</Text>
        {userEmail && (
          <Text style={[styles.headerEmail, { color: theme.mutedForeground }]}>{userEmail}</Text>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <SectionHeader title="ACCOUNT" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="person.fill" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Profile Settings"
            onPress={() => showComingSoon("Profile Settings")}
          />
          <SettingsItem
            icon="key.fill" iconColor={theme.destructive} iconBgColor={theme.destructive + "20"}
            title="Change Password"
            onPress={() => showComingSoon("Change Password")}
          />
          <SettingsItem
            icon="envelope.fill" iconColor={theme.success} iconBgColor={theme.success + "20"}
            title="Email Notifications" isLast
            onPress={() => showComingSoon("Email Notifications")}
          />
        </View>

        <SectionHeader title="PREFERENCES" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="moon.fill" iconColor={theme.foreground} iconBgColor={theme.muted}
            title="Dark Mode" hasToggle toggleValue={darkMode} onToggleChange={toggleDark} hasArrow={false}
          />
          <SettingsItem
            icon="globe" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Language" subtitle="English"
            onPress={() => showComingSoon("Language")}
          />
          <SettingsItem
            icon="dollarsign.circle.fill" iconColor={theme.warning} iconBgColor={theme.warning + "20"}
            title="Currency" subtitle="GHS (₵)" isLast
            onPress={() => showComingSoon("Currency")}
          />
        </View>

        <SectionHeader title="NOTIFICATIONS" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="bell.fill" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Push Notifications" hasToggle toggleValue={pushNotifications} onToggleChange={togglePush} hasArrow={false}
          />
          <SettingsItem
            icon="envelope.fill" iconColor={theme.success} iconBgColor={theme.success + "20"}
            title="Email Alerts" hasToggle toggleValue={emailAlerts} onToggleChange={toggleEmail} hasArrow={false}
          />
          <SettingsItem
            icon="message.fill" iconColor={theme.warning} iconBgColor={theme.warning + "20"}
            title="SMS Alerts" hasToggle toggleValue={smsAlerts} onToggleChange={toggleSms} hasArrow={false} isLast
          />
        </View>

        <SectionHeader title="SUPPORT" />
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsItem
            icon="lifepreserver.fill" iconColor={theme.primary} iconBgColor={theme.primary + "20"}
            title="Help Center"
            onPress={() => Linking.openURL("https://jsashanti.vercel.app")}
          />
          <SettingsItem
            icon="headphones" iconColor={theme.warning} iconBgColor={theme.warning + "20"}
            title="Contact Support"
            onPress={() => Linking.openURL("mailto:support@jsashanti.com")}
          />
          <SettingsItem
            icon="doc.text.fill" iconColor={theme.mutedForeground} iconBgColor={theme.muted}
            title="Terms of Service" isLast
            onPress={() => Linking.openURL("https://jsashanti.vercel.app")}
          />
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.destructive + "15" }]} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={theme.destructive} />
          <Text style={[styles.logoutButtonText, { color: theme.destructive }]}>Logout</Text>
        </TouchableOpacity>
        {/* App Info Footer */}
        <View style={styles.appFooter}>
          <View style={[styles.appFooterIcon, { backgroundColor: theme.primary + "15" }]}>
            <IconSymbol name="bag.fill" size={20} color={theme.primary} />
          </View>
          <Text style={[styles.appName, { color: theme.foreground }]}>JS Ashanti</Text>
          <Text style={[styles.appVersion, { color: theme.mutedForeground }]}>Version 1.0.0 • Admin Dashboard</Text>
          <Text style={[styles.appCopyright, { color: theme.mutedForeground }]}>Built with Expo & React Native</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  headerEmail: { fontSize: 13, marginTop: 4 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 16, marginTop: 32, gap: 10 },
  logoutButtonText: { fontSize: 16, fontWeight: "600" },
  appFooter: { alignItems: "center", marginTop: 40, gap: 8 },
  appFooterIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  appName: { fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  appVersion: { fontSize: 12 },
  appCopyright: { fontSize: 11, marginTop: 2 },
});
