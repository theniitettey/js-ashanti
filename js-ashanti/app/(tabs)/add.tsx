import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AddScreen() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <IconSymbol
        size={96}
        name="plus.circle.fill"
        color={Colors[colorScheme ?? "light"].tabIconSelected}
      />
      <Text style={styles.label}>Add</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  label: {
    marginTop: 12,
    fontSize: 18,
  },
});
