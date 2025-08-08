// components/CategoryCreator.tsx - Kid-friendly category creation
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native'
import { Plus, X, Save, Star } from 'lucide-react-native'
import Colors from '../constants/colors'
import AccessibleButton from './AccessibleButton'
import { useCategoryStore, Category } from '../stores/categoryStore'
import { useParentalControlStore } from '../stores/parentalControlStore'

interface CategoryCreatorProps {
  visible: boolean
  onClose: () => void
}

const ICON_OPTIONS = [
  '🏫',
  '🏠',
  '🍕',
  '🎮',
  '🛍️',
  '🏥',
  '🚌',
  '👥',
  '⚽',
  '🎭',
  '📚',
  '🎵',
  '🎨',
  '🏊',
  '🚴',
  '🎯',
  '🌮',
  '🍔',
  '🍦',
  '☕',
  '🥨',
  '🎂',
  '🍪',
  '🧁',
  '🏀',
  '⚾',
  '🎾',
  '🏐',
  '🏓',
  '🎱',
  '🎳',
  '🏸',
  '🎪',
  '🎢',
  '🎡',
  '🎠',
  '🏰',
  '🗿',
  '🌋',
  '🏖️',
]

const COLOR_OPTIONS = [
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#65a30d',
  '#059669',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#a21caf',
  '#7e22ce',
]

export default function CategoryCreator({
  visible,
  onClose,
}: CategoryCreatorProps) {
  const { addCategory } = useCategoryStore()
  const { settings } = useParentalControlStore()

  const [categoryName, setCategoryName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('🏷️')
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])
  const [description, setDescription] = useState('')

  const handleSave = () => {
    if (!categoryName.trim()) {
      Alert.alert('Oops!', 'Please give your category a name! 😊')
      return
    }

    const needsApproval =
      settings.requireApprovalForNewCategories &&
      settings.allowChildCategoryCreation

    const newCategory: Omit<Category, 'id' | 'createdAt'> = {
      name: categoryName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isDefault: false,
      isChildCreated: true,
      needsApproval,
      isApproved: !needsApproval,
      createdBy: 'child',
      description: description.trim() || undefined,
    }

    addCategory(newCategory)

    if (needsApproval) {
      Alert.alert(
        'Category Created! 🎉',
        "Your new category has been sent to your parent for approval. You'll get it soon!",
        [{ text: 'OK', onPress: onClose }],
      )
    } else {
      Alert.alert('Category Added! 🎉', 'Your new category is ready to use!', [
        { text: 'Awesome!', onPress: onClose },
      ])
    }

    // Reset form
    setCategoryName('')
    setSelectedIcon('🏷️')
    setSelectedColor(COLOR_OPTIONS[0])
    setDescription('')
  }

  const handleClose = () => {
    setCategoryName('')
    setSelectedIcon('🏷️')
    setSelectedColor(COLOR_OPTIONS[0])
    setDescription('')
    onClose()
  }

  if (!visible) return null
  if (!settings.allowChildCategoryCreation) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Category</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Save size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: selectedColor + '20' },
              ]}
            >
              <Text style={styles.previewIcon}>{selectedIcon}</Text>
              <Text style={[styles.previewName, { color: selectedColor }]}>
                {categoryName || 'My Category'}
              </Text>
            </View>
          </View>

          {/* Category Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What should we call it?</Text>
            <TextInput
              style={styles.nameInput}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Type a fun name here..."
              placeholderTextColor={Colors.textLight}
              maxLength={20}
            />
            <Text style={styles.characterCount}>{categoryName.length}/20</Text>
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pick a cool icon!</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && styles.iconOptionSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your favorite color!</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Star
                      size={16}
                      color={Colors.background}
                      fill={Colors.background}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tell us more (optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="What kind of places will you put here?"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{description.length}/100</Text>
          </View>

          {/* Approval Notice */}
          {settings.requireApprovalForNewCategories && (
            <View style={styles.approvalNotice}>
              <Text style={styles.approvalText}>
                🔍 Your parent will review this category before you can use it!
              </Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.actions}>
          <AccessibleButton
            title={
              settings.requireApprovalForNewCategories
                ? 'Send for Approval'
                : 'Create Category'
            }
            onPress={handleSave}
            style={[
              styles.createButton,
              !categoryName.trim() && styles.createButtonDisabled,
            ]}
            textStyle={styles.createButtonText}
            disabled={!categoryName.trim()}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  previewSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  previewCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  previewIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  iconOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  colorOptionSelected: {
    borderColor: Colors.textLight,
  },
  descriptionInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  approvalNotice: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  approvalText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 40,
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
  },
  createButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  createButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
})

