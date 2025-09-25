jest.mock("lucide-react-native", () => ({
  ArrowLeft: () => null,
  Plus: () => null,
  Edit3: () => null,
  Trash2: () => null,
  Check: () => null,
  X: () => null,
}));
import { Text } from "react-native";
describe("TrivialComponent", () => {
  it("renders a trivial component without crashing", () => {
    const Trivial = () => <Text>Trivial</Text>;
    const { getByText } = render(<Trivial />);
    expect(getByText("Trivial")).toBeTruthy();
  });
});
jest.mock("@/core/validation", () => ({
  CategoryCreateSchema: {},
  CategoryUpdateSchema: {},
  safeParseWithToast: jest.fn((schema, data) => data),
}));
jest.mock("@/constants/theme", () => ({
  useTheme: () => ({
    colors: {
      background: "#fff",
      border: "#ccc",
      error: "#f00",
      primary: "#00f",
      surface: "#eee",
      text: "#111",
      textSecondary: "#888",
    },
  }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    toast: { message: "", type: "info", visible: false },
    showToast: jest.fn(),
    hideToast: jest.fn(),
  }),
}));
import React from "react";
import CategoryManagement from "../../components/CategoryManagement";
console.log('DEBUG CategoryManagement import:', CategoryManagement);
import { render } from "../testUtils";
jest.mock("@/components/CategoryButton", () => ({
  __esModule: true,
  default: () => null,
}));

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

describe("CategoryManagement (isolated)", () => {
  it("renders without crashing", () => {
    const { getByText } = render(
      <CategoryManagement onBack={() => {}} userMode="parent" />
    );
    expect(getByText("Manage Categories")).toBeTruthy();
  });
});
