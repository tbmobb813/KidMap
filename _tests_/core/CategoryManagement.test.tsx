import { Alert } from "react-native";

import CategoryManagement from "../../components/CategoryManagement";
import { render, } from "../testUtils";

const mockAddCategory = jest.fn();
const mockUpdateCategory = jest.fn();
const mockDeleteCategory = jest.fn();
const mockApproveCategory = jest.fn();
const mockShowToast = jest.fn();
const mockHideToast = jest.fn();

jest.mock("@/stores/categoryStore", () => ({
  useCategoryManagement: () => ({
    settings: {
      maxCustomCategories: 10,
      allowChildCategoryCreation: true,
      requireApprovalForCategories: true,
    },
    getApprovedCategories: () => [
      /* ... */
    ],
    getPendingCategories: () => [
      /* ... */
    ],
    addCategory: mockAddCategory,
    updateCategory: mockUpdateCategory,
    deleteCategory: mockDeleteCategory,
    approveCategory: mockApproveCategory,
    getAvailableIcons: () => ["Home", "Building", "MapPin", "Heart", "Star"],
    getAvailableColors: () => [
      "#007AFF",
      "#FF9500",
      "#34C759",
      "#FF3B30",
      "#AF52DE",
    ],
    canCreateCategory: (userMode: string) =>
      userMode === "parent" || userMode === "child",
    needsApproval: (userMode: string) => userMode === "child",
  }),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    toast: { message: "", type: "info", visible: false },
    showToast: mockShowToast,
    hideToast: mockHideToast,
  }),
}));

jest.mock("@/core/validation", () => ({
  CategoryCreateSchema: {},
  CategoryUpdateSchema: {},
  safeParseWithToast: jest.fn((schema, data) => data),
}));

jest.spyOn(Alert, "alert");

describe("CategoryManagement", () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    expect(getByText("Manage Categories")).toBeTruthy();
  });
});
