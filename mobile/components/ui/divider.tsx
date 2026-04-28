import { View, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export default function Divider() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  return <View style={{ height: 1, backgroundColor: theme.border, width: "100%" }} />;
}
