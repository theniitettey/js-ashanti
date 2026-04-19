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
  useColorScheme,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Typography from "@/constants/typography";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Colors } from "@/constants/theme";
import { useCreateProduct } from "@/hooks/use-products";

const Label = ({ label, required, theme }: { label: string; required?: boolean; theme: any }) => (
  <View style={styles.labelRow}>
    <Text style={[styles.label, { color: theme.foreground }]}>{label}</Text>
    {required ? <Text style={[styles.required, { color: theme.destructive }]}>*</Text> : null}
  </View>
);

export default function AddScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  // TanStack mutation — handles loading state and cache invalidation automatically
  const { createProduct, isPending } = useCreateProduct();
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
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    try {
      await createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        sku: formData.sku,
        subcategories: formData.subcategories.split(",").map((s) => s.trim()).filter(Boolean),
        colors: formData.colors.split(",").map((c) => c.trim()).filter(Boolean),
      });

      Alert.alert("Success", "Product added successfully", [
        { text: "OK", onPress: () => router.push("/(tabs)/stock") },
      ]);
    } catch (error: any) {
      if (error.message?.includes("No authentication token")) {
        Alert.alert("Login Required", "Please log in to add products.", [
          { text: "Go to Login", onPress: () => router.push("/login") },
          { text: "Cancel" },
        ]);
      } else {
        Alert.alert("Error", error.message || "Failed to add product");
      }
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.headerIconButton, { backgroundColor: theme.muted }]}
          onPress={() => router.back()}
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={theme.foreground}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.foreground }]}>Add Product</Text>
        <TouchableOpacity
          style={[styles.headerSaveButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <IconSymbol
            name={isPending ? "hourglass" : "checkmark"}
            size={18}
            color={theme.primaryForeground}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.imagePlaceholderWrapper}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
            ) : (
               <View style={[styles.imagePlaceholderBox, { backgroundColor: theme.muted, borderColor: theme.border }]}>
                <IconSymbol
                  name="photo"
                  size={40}
                  color={theme.mutedForeground}
                />
              </View>
            )}
          </View>
          <View style={styles.uploadButtonsRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.secondary }]}
              onPress={pickImageFromCamera}
            >
              <IconSymbol name="camera" size={16} color={theme.secondaryForeground} />
              <Text style={[styles.secondaryButtonText, { color: theme.secondaryForeground }]}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.secondary }]}
              onPress={pickImageFromGallery}
            >
              <IconSymbol name="photo.on.rectangle" size={16} color={theme.secondaryForeground} />
              <Text style={[styles.secondaryButtonText, { color: theme.secondaryForeground }]}>Gallery</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: theme.mutedForeground }]}>Dimensions: 800x800px recommended</Text>
        </View>

        {/* Form Elements */}
        {/* Name */}
        <View style={styles.formGroup}>
          <Label label="Product Name" required theme={theme} />
          <TextInput
            placeholder="Enter brand and product name"
            placeholderTextColor={theme.mutedForeground}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </View>

        {/* SKU & Category Row */}
        <View style={[styles.row, { gap: 12 }]}>
            <View style={[styles.formGroup, { flex: 1 }]}>
                <Label label="SKU" required theme={theme} />
                <TextInput
                    placeholder="PRD-123"
                    placeholderTextColor={theme.mutedForeground}
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
                    value={formData.sku}
                    onChangeText={(text) => handleInputChange("sku", text)}
                />
            </View>
            <View style={[styles.formGroup, { flex: 1.5 }]}>
                <Label label="Category" required theme={theme} />
                <TouchableOpacity
                    style={[styles.input, styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => setCategoryModalVisible(true)}
                >
                    <Text style={[styles.inputPlaceholder, { color: formData.category ? theme.foreground : theme.mutedForeground }]}>
                    {formData.category || "Select..."}
                    </Text>
                    <IconSymbol
                    name="chevron.down"
                    size={16}
                    color={theme.mutedForeground}
                    />
                </TouchableOpacity>
            </View>
        </View>


        {/* Metadata Row */}
        <View style={[styles.row, { gap: 12 }]}>
            <View style={[styles.formGroup, { flex: 1 }]}>
                <Label label="Subcategories" theme={theme} />
                <TextInput
                    placeholder="E.g. iOS"
                    placeholderTextColor={theme.mutedForeground}
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
                    value={formData.subcategories}
                    onChangeText={(text) => handleInputChange("subcategories", text)}
                />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
                <Label label="Colors" theme={theme} />
                <TextInput
                    placeholder="Red, Blue"
                    placeholderTextColor={theme.mutedForeground}
                    style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
                    value={formData.colors}
                    onChangeText={(text) => handleInputChange("colors", text)}
                />
            </View>
        </View>

        {/* Pricing Row */}
        <View style={[styles.row, { gap: 12 }]}>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <Label label="Price" required theme={theme} />
            <View style={[styles.inputWithIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.mutedForeground, paddingRight: 4 }}>$</Text>
              <TextInput
                value={formData.price}
                onChangeText={(text) => handleInputChange("price", text)}
                placeholderTextColor={theme.mutedForeground}
                style={[styles.inputBare, { color: theme.foreground }]}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
            </View>
          </View>
          <View style={{ flex: 1, marginBottom: 16 }}>
            <Label label="Stock Qty" required theme={theme} />
            <View style={[styles.inputWithIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <IconSymbol
                name="number"
                size={16}
                color={theme.mutedForeground}
              />
              <TextInput
                placeholder="0"
                placeholderTextColor={theme.mutedForeground}
                 style={[styles.inputBare, { color: theme.foreground }]}
                keyboardType="number-pad"
                value={formData.stock}
                onChangeText={(text) => handleInputChange("stock", text)}
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Label label="Description" theme={theme} />
          <TextInput
            placeholder="Write a clear description..."
            placeholderTextColor={theme.mutedForeground}
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
          />
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.muted, borderColor: theme.border }]}>
          <View style={[styles.infoIcon, { backgroundColor: theme.primary }]}>
            <IconSymbol name="info" size={14} color={theme.primaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoText, { color: theme.foreground }]}>
              Ensure all <Text style={{ color: theme.destructive, fontWeight: '700' }}>*</Text> fields are accurate before uploading to the live inventory.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Better Footer Actions aligned with shadcn */}
      <View style={[styles.footerActions, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => router.back()}
        >
            <Text style={[styles.cancelText, { color: theme.foreground }]}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isPending}
        >
            <Text style={[styles.primaryText, { color: theme.primaryForeground }]}>
            {isPending ? "Saving..." : "Save Product"}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <IconSymbol
                  name="xmark"
                  size={22}
                  color={theme.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoriesList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    formData.category === cat ? { backgroundColor: theme.secondary, borderColor: theme.primary } : { borderColor: 'transparent' },
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      { color: formData.category === cat ? theme.foreground : theme.mutedForeground, fontWeight: formData.category === cat ? "600" : "400" },
                    ]}
                  >
                    {cat}
                  </Text>
                  {formData.category === cat && (
                    <IconSymbol
                      name="checkmark"
                      size={18}
                      color={theme.foreground}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {/* Custom Category Section */}
              <View style={[styles.customCategorySection, { borderTopColor: theme.border }]}>
                 <Label label="Add a custom category" theme={theme} />
                <View style={styles.customCategoryInput}>
                  <TextInput
                    placeholder="Custom name"
                    placeholderTextColor={theme.mutedForeground}
                    style={[styles.customInputField, { backgroundColor: theme.card, borderColor: theme.border, color: theme.foreground }]}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.addCustomButton, { backgroundColor: theme.secondary }]}
                  onPress={handleAddCustomCategory}
                  disabled={!customCategory.trim()}
                >
                  <IconSymbol
                    name="plus"
                    size={16}
                    color={theme.secondaryForeground}
                  />
                  <Text style={[styles.addCustomButtonText, { color: theme.secondaryForeground }]}>Add Category</Text>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.md,
    fontWeight: "600",
  },
  headerSaveButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  imagePlaceholderWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  imagePlaceholderBox: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
  },
  selectedImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: Typography.xs,
    fontWeight: "500",
  },
  helperText: {
    textAlign: "center",
    fontSize: Typography.xs,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: "500",
  },
  required: {
    fontSize: Typography.sm,
    fontWeight: "700",
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Typography.md,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputPlaceholder: {
    fontSize: Typography.md,
  },
  row: {
    flexDirection: "row",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  inputBare: {
    flex: 1,
    fontSize: Typography.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  infoBanner: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 4,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: Typography.sm,
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelText: {
    fontSize: Typography.sm,
    fontWeight: "600",
  },
  primaryButton: {},
  primaryText: {
    fontSize: Typography.sm,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.md,
    fontWeight: "600",
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
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  categoryItemText: {
    fontSize: Typography.sm,
  },
  customCategorySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  customCategoryInput: {
    marginBottom: 12,
  },
  customInputField: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Typography.md,
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 40,
  },
  addCustomButtonText: {
    fontSize: Typography.sm,
    fontWeight: "600",
  },
});
