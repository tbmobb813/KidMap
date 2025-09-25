jest.mock("@/stores/categoryStore", () => ({
  useCategoryManagement: () => ({
    settings: { maxCustomCategories: 10, allowChildCategoryCreation: true, requireApprovalForCategories: true },
    getApprovedCategories: () => [],
    getPendingCategories: () => [],
    addCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    approveCategory: jest.fn(),
    getAvailableIcons: () => ["Home", "Building", "MapPin", "Heart", "Star"],
    getAvailableColors: () => ["#007AFF", "#FF9500", "#34C759", "#FF3B30", "#AF52DE"],
    canCreateCategory: (userMode) => userMode === "parent" || userMode === "child",
    needsApproval: (userMode) => userMode === "child",
  }),
}));
import { Alert } from "react-native";
jest.mock("@/components/CategoryButton", () => ({
  __esModule: true,
  default: () => null,
}));

import CategoryManagement from "../../components/CategoryManagement";
import { render } from "../testUtils";
import { useCategoryManagement as mockUseCategoryManagement } from "../../__mocks__/stores/categoryStore";


jest.spyOn(Alert, "alert");

describe("CategoryManagement", () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(require("@/stores/categoryStore"), "useCategoryManagement").mockImplementation(mockUseCategoryManagement);
  });

  it("renders without crashing", () => {
    const { getByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    expect(getByText("Manage Categories")).toBeTruthy();
  });
});
