import { ArrowLeft, Plus, Edit3, Trash2, Check, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Modal, Alert } from 'react-native';

import CategoryButton from './CategoryButton';
import Toast from './Toast';

import { useTheme } from '@/constants/theme';
import { CategoryCreateSchema, CategoryUpdateSchema, safeParseWithToast } from '@/core/validation';
import { useToast } from '@/hooks/useToast';
import { useCategoryManagement } from '@/stores/categoryStore';
import { CustomCategory } from '@/types/navigation';


type CategoryManagementProps = {
  onBack: () => void;
  userMode: 'parent' | 'child';
};

const CategoryManagement: React.FC<CategoryManagementProps> = ({ onBack, userMode }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const {
    settings,
    getApprovedCategories,
    getPendingCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    approveCategory,
    getAvailableIcons,
    getAvailableColors,
    canCreateCategory,
    needsApproval,
  } = useCategoryManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('MapPin');
  const [selectedColor, setSelectedColor] = useState('/*TODO theme*/ theme.colors.placeholder /*#007AFF*/');

  const approvedCategories = getApprovedCategories();
  const { toast, showToast, hideToast } = useToast();
  const pendingCategories = getPendingCategories();
  const availableIcons = getAvailableIcons();
  const availableColors = getAvailableColors();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    if (!canCreateCategory(userMode)) {
      showToast(`Limit reached: max ${settings.maxCustomCategories} custom categories`, 'warning');
      return;
    }

    try {
      const isApproved = !needsApproval(userMode);
      
      const parsed = safeParseWithToast(CategoryCreateSchema, {
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
        isDefault: false,
        createdBy: userMode,
        isApproved,
      }, showToast);
      if (!parsed) return;
      await addCategory(parsed);

      setShowCreateModal(false);
      setNewCategoryName('');
      setSelectedIcon('MapPin');
      setSelectedColor('/*TODO theme*/ theme.colors.placeholder /*#007AFF*/');

      if (needsApproval(userMode)) {
        showToast('Category created; awaiting approval', 'info');
      } else {
        showToast('Category created', 'success');
      }
  } catch {
      showToast('Failed to create category', 'error');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    try {
      const parsed = safeParseWithToast(CategoryUpdateSchema, {
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: selectedColor,
      }, showToast);
      if (!parsed) return;
      await updateCategory(editingCategory.id, parsed);

      setEditingCategory(null);
      setNewCategoryName('');
      setSelectedIcon('MapPin');
      setSelectedColor('/*TODO theme*/ theme.colors.placeholder /*#007AFF*/');
  showToast('Category updated', 'success');
  } catch {
  showToast('Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = (category: CustomCategory) => {
    if (category.isDefault) {
      showToast('Default categories cannot be deleted', 'warning');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              showToast('Category deleted', 'success');
            } catch {
              showToast('Failed to delete category', 'error');
            }
          },
        },
      ]
    );
  };

  const handleApproveCategory = async (categoryId: string) => {
    try {
      await approveCategory(categoryId);
  showToast('Category approved', 'success');
  } catch {
  showToast('Failed to approve category', 'error');
    }
  };

  const openCreateModal = () => {
    setNewCategoryName('');
    setSelectedIcon('MapPin');
    setSelectedColor(theme.colors.placeholder);
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const openEditModal = (category: CustomCategory) => {
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const CategoryModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalButton}>
            <X size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.modalTitle}>
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </Text>
          <Pressable 
            onPress={editingCategory ? handleEditCategory : handleCreateCategory}
            style={styles.modalButton}
          >
            <Check size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.previewContainer}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <CategoryButton
              customCategory={{
                id: 'preview',
                name: newCategoryName || 'Category Name',
                icon: selectedIcon,
                color: selectedColor,
                isDefault: false,
                createdBy: userMode,
                isApproved: true,
                createdAt: Date.now(),
              }}
              onPress={() => {}}
              size="medium"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              maxLength={20}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Choose Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {availableIcons.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && styles.selectedIconOption,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <CategoryButton
                    customCategory={{
                      id: 'temp',
                      name: '',
                      icon,
                      color: selectedColor,
                      isDefault: false,
                      createdBy: userMode,
                      isApproved: true,
                      createdAt: Date.now(),
                    }}
                    onPress={() => setSelectedIcon(icon)}
                    size="small"
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Choose Color</Text>
            <View style={styles.colorGrid}>
              {availableColors.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Manage Categories</Text>
        {canCreateCategory(userMode) && (
          <Pressable onPress={openCreateModal} style={styles.addButton}>
            <Plus size={24} color={theme.colors.primary} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.content}>
        {userMode === 'parent' && pendingCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Approval</Text>
            <Text style={styles.sectionDescription}>
              Categories created by your child that need approval
            </Text>
            {pendingCategories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <CategoryButton
                  customCategory={category}
                  onPress={() => {}}
                  size="small"
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryMeta}>
                    Created {new Date(category.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.categoryActions}>
                  <Pressable
                    onPress={() => handleApproveCategory(category.id)}
                    style={[styles.actionButton, styles.approveButton]}
                  >
                    <Check size={20} color={theme.colors.primaryForeground} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteCategory(category)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <X size={20} color={theme.colors.primaryForeground} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <Text style={styles.sectionDescription}>
            {userMode === 'parent' 
              ? 'Manage all categories available to your child'
              : 'Your available categories'
            }
          </Text>
          {approvedCategories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <CategoryButton
                customCategory={category}
                onPress={() => {}}
                size="small"
              />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryMeta}>
                  {category.isDefault ? 'Default' : `Created by ${category.createdBy}`}
                </Text>
              </View>
              {!category.isDefault && (userMode === 'parent' || category.createdBy === userMode) && (
                <View style={styles.categoryActions}>
                  <Pressable
                    onPress={() => openEditModal(category)}
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <Edit3 size={20} color={theme.colors.primaryForeground} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteCategory(category)}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <Trash2 size={20} color={theme.colors.primaryForeground} />
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <CategoryModal />
      <Toast 
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  addButton: { padding: 8 },
  approveButton: { backgroundColor: theme.colors.success },
  backButton: { padding: 8 },
  categoryActions: { flexDirection: 'row', gap: 8 },
  categoryInfo: { flex: 1, marginLeft: 16 },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  categoryMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  categoryName: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  colorOption: { borderColor: 'transparent', borderRadius: 20, borderWidth: 3, height: 40, width: 40 },
  container: { backgroundColor: theme.colors.background, flex: 1 },
  content: { flex: 1 },
  deleteButton: { backgroundColor: theme.colors.error },
  editButton: { backgroundColor: theme.colors.primary },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  iconOption: { borderColor: 'transparent', borderRadius: 12, borderWidth: 2, marginRight: 8 },
  iconScroll: { marginTop: 8 },
  inputSection: { marginBottom: 24 },
  modalButton: { padding: 8 },
  modalContainer: { backgroundColor: theme.colors.background, flex: 1 },
  modalContent: { flex: 1, padding: 16 },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  previewContainer: { alignItems: 'center', marginBottom: 24 },
  section: { padding: 16 },
  sectionDescription: { color: theme.colors.textSecondary, fontSize: 14, marginBottom: 16 },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  selectedColorOption: { borderColor: theme.colors.text },
  selectedIconOption: { borderColor: theme.colors.primary },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    padding: 12,
  },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
});

export default CategoryManagement;
