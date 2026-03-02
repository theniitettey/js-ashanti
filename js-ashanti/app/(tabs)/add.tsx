import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Typography from "@/constants/typography";
import { API_ENDPOINTS, apiRequestWithAuth } from "@/lib/api";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

const palette = {
  background: "#000000",
  card: "#1A1F2E",
  navy: "#0F141E",
  primary: "#6B5FED",
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  inputBorder: "#1F2937",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};

const Label = ({ label, required }: { label: string; required?: boolean }) => (
  <View style={styles.labelRow}>
    <Text style={styles.label}>{label}</Text>
    {required ? <Text style={styles.required}>*</Text> : null}
  </View>
);

export default function AddScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories] = useState([
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports & Outdoors",
    "Books & Media",
    "Toys & Games",
    "Health & Beauty",
    "Jewelry",
  ]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    sku: "",
    subcategories: "",
    colors: "",
  });

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const handleSelectCategory = (category: string) => {
    handleInputChange("category", category);
    setCategoryModalVisible(false);
    setCustomCategory("");
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      handleInputChange("category", customCategory);
      setCategoryModalVisible(false);
      setCustomCategory("");
    } else {
      Alert.alert("Error", "Please enter a category name");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await apiRequestWithAuth(API_ENDPOINTS.MOBILE.PRODUCTS.CREATE, {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category,
          sku: formData.sku,
          subcategories: formData.subcategories.split(",").map((s) => s.trim()).filter(Boolean),
          colors: formData.colors.split(",").map((c) => c.trim()).filter(Boolean),
        }),
      });

      Alert.alert("Success", "Product added successfully", [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)/stock");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error adding product:", error);
      if (error.message.includes("No authentication token")) {
        Alert.alert("Login Required", "Please log in to add products.", [
          {
            text: "Go to Login",
            onPress: () => router.push("/login"),
          },
          {
            text: "Cancel",
          },
        ]);
      } else {
        Alert.alert("Error", error.message || "Failed to add product");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            name="chevron.left"
            size={22}
            color={palette.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <TouchableOpacity
          style={styles.headerSaveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <IconSymbol
            name={loading ? "hourglass" : "checkmark"}
            size={20}
            color={palette.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload */}
        <View style={styles.card}>
          <View style={styles.imagePlaceholderWrapper}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
            ) : (
              <View style={styles.imagePlaceholderBox}>
                <IconSymbol
                  name="photo.on.rectangle.angled"
                  size={40}
                  color="#6B7280"
                />
                <View style={styles.plusBadge}>
                  <IconSymbol
                    name="plus"
                    size={14}
                    color={palette.textPrimary}
                  />
                </View>
              </View>
            )}
          </View>
          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickImageFromCamera}
            >
              <IconSymbol name="camera" size={16} color={palette.textPrimary} />
              <Text style={styles.secondaryButtonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickImageFromGallery}
            >
              <IconSymbol name="photo" size={16} color={palette.textPrimary} />
              <Text style={styles.secondaryButtonText}>Gallery</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Recommended size: 800x800px</Text>
        </View>

        {/* Form */}
        <View style={styles.formGroup}>
          <Label label="Product Name" required />
          <TextInput
            placeholder="Enter product name"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Label label="SKU / Product Code" required />
          <TextInput
            placeholder="e.g., PRD-12345"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={formData.sku}
            onChangeText={(text) => handleInputChange("sku", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Label label="Subcategories (comma separated)" />
          <TextInput
            placeholder="e.g. Smartphones, Tablets"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={formData.subcategories}
            onChangeText={(text) => handleInputChange("subcategories", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Label label="Colors (comma separated)" />
          <TextInput
            placeholder="e.g. Red, Blue, Black"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            value={formData.colors}
            onChangeText={(text) => handleInputChange("colors", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Label label="Category" required />
          <TouchableOpacity
            style={[styles.input, styles.dropdown]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.inputPlaceholder}>
              {formData.category || "Select category"}
            </Text>
            <IconSymbol
              name="chevron.down"
              size={16}
              color={palette.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.formGroup, styles.row, { gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Label label="Price" required />
            <View style={styles.inputWithIcon}>
              <IconSymbol
                name="dollarsign"
                size={16}
                color={palette.textSecondary}
              />
              <TextInput
                value={formData.price}
                onChangeText={(text) => handleInputChange("price", text)}
                placeholderTextColor={palette.textSecondary}
                style={styles.inputBare}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Label label="Cost Price" required />
            <View style={styles.inputWithIcon}>
              <IconSymbol
                name="dollarsign"
                size={16}
                color={palette.textSecondary}
              />
              <TextInput
                defaultValue="0.00"
                placeholderTextColor={palette.textSecondary}
                style={styles.inputBare}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Label label="Quantity / Stock Level" required />
          <TextInput
            placeholder="Enter quantity"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
            keyboardType="number-pad"
            value={formData.stock}
            onChangeText={(text) => handleInputChange("stock", text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Label label="Description" />
          <TextInput
            placeholder="Enter product description..."
            placeholderTextColor={palette.textSecondary}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
          />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIcon}>
            <IconSymbol name="info" size={16} color={palette.textPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Required Fields</Text>
            <Text style={styles.infoText}>
              All fields marked with * are mandatory to add a product to
              inventory.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.row, { gap: 12, marginTop: 12 }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <IconSymbol name="circle" size={16} color={palette.textPrimary} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <IconSymbol name="plus" size={16} color={palette.textPrimary} />
            <Text style={styles.primaryText}>
              {loading ? "Adding..." : "Add Product"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={palette.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    formData.category === cat && styles.categoryItemActive,
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      formData.category === cat &&
                        styles.categoryItemTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  {formData.category === cat && (
                    <IconSymbol
                      name="checkmark"
                      size={20}
                      color={palette.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* Custom Category Section */}
              <View style={styles.customCategorySection}>
                <Text style={styles.customCategoryLabel}>
                  Or create your own
                </Text>
                <View style={styles.customCategoryInput}>
                  <TextInput
                    placeholder="Enter custom category"
                    placeholderTextColor={palette.textSecondary}
                    style={styles.customInputField}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                </View>
                <TouchableOpacity
                  style={styles.addCustomButton}
                  onPress={handleAddCustomCategory}
                  disabled={!customCategory.trim()}
                >
                  <IconSymbol
                    name="plus"
                    size={16}
                    color={palette.textPrimary}
                  />
                  <Text style={styles.addCustomButtonText}>Add Custom</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.navy,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  headerSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  imagePlaceholderWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  imagePlaceholderBox: {
    width: 180,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  selectedImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
  },
  plusBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: palette.primary,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  uploadButtonsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.navy,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontSize: Typography.sm,
    fontWeight: "600",
  },
  helperText: {
    textAlign: "center",
    color: palette.textSecondary,
    fontSize: Typography.xs,
  },
  formGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  label: {
    color: palette.textPrimary,
    fontSize: Typography.sm,
    fontWeight: "600",
  },
  required: {
    color: palette.danger,
    fontSize: Typography.sm,
    fontWeight: "700",
  },
  input: {
    backgroundColor: palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: palette.textPrimary,
    fontSize: Typography.md,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputPlaceholder: {
    color: palette.textSecondary,
    fontSize: Typography.md,
  },
  row: {
    flexDirection: "row",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  inputBare: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: Typography.md,
  },
  textArea: {
    height: 120,
  },
  infoBanner: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTitle: {
    color: palette.textPrimary,
    fontSize: Typography.sm,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoText: {
    color: palette.textSecondary,
    fontSize: Typography.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: palette.navy,
    borderWidth: 1,
    borderColor: palette.inputBorder,
  },
  cancelText: {
    color: palette.textPrimary,
    fontSize: Typography.sm,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  primaryText: {
    color: palette.textPrimary,
    fontSize: Typography.sm,
    fontWeight: "700",
  },
  bottomNav: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: "#0B0F17",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  navLabel: {
    color: palette.textSecondary,
    fontSize: Typography.xs,
    fontWeight: "600",
  },
  centerFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -32,
    shadowColor: palette.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.inputBorder,
  },
  modalTitle: {
    fontSize: Typography.lg,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: palette.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryItemActive: {
    backgroundColor: palette.navy,
    borderColor: palette.primary,
  },
  categoryItemText: {
    fontSize: Typography.md,
    color: palette.textSecondary,
    fontWeight: "500",
  },
  categoryItemTextActive: {
    color: palette.primary,
    fontWeight: "700",
  },
  customCategorySection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: palette.inputBorder,
  },
  customCategoryLabel: {
    fontSize: Typography.sm,
    fontWeight: "600",
    color: palette.textSecondary,
    marginBottom: 12,
  },
  customCategoryInput: {
    marginBottom: 12,
  },
  customInputField: {
    backgroundColor: palette.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.textPrimary,
    fontSize: Typography.md,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.primary,
    borderRadius: 12,
    marginBottom: 20,
  },
  addCustomButtonText: {
    fontSize: Typography.sm,
    fontWeight: "700",
    color: palette.textPrimary,
  },
});
