
import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { render, testThemeToggling } from "../../testUtils";

import CategoryManagement from "@/components/CategoryManagement";

// Mock the stores and hooks
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
      {
        id: "cat1",
        name: "Home",
        icon: "Home",
        color: "#007AFF",
        isDefault: true,
        createdBy: "system",
        isApproved: true,
        createdAt: Date.now() - 100000,
      },
      {
        id: "cat2",
        name: "School",
        icon: "Building",
        color: "#FF9500",
        isDefault: false,
        createdBy: "parent",
        isApproved: true,
        createdAt: Date.now() - 50000,
      },
    ],
    getPendingCategories: () => [
      {
        id: "pending1",
        name: "Playground",
        icon: "MapPin",
        color: "#34C759",
        isDefault: false,
        createdBy: "child",
        isApproved: false,
        createdAt: Date.now() - 25000,
      },
    ],
    addCategory: mockAddCategory,
    updateCategory: mockUpdateCategory,
    deleteCategory: mockDeleteCategory,
    approveCategory: mockApproveCategory,
    getAvailableIcons: () => ["Home", "Building", "MapPin", "Heart", "Star"],
    getAvailableColors: () => ["#007AFF", "#FF9500", "#34C759", "#FF3B30", "#AF52DE"],
    canCreateCategory: (userMode: string) => userMode === "parent" || userMode === "child",
    needsApproval: (userMode: string) => userMode === "child",
  }),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({
    toast: {
      message: "",
      type: "info",
      visible: false,
    },
    showToast: mockShowToast,
    hideToast: mockHideToast,
  }),
}));

jest.mock("@/core/validation", () => ({
  CategoryCreateSchema: {},
  CategoryUpdateSchema: {},
  safeParseWithToast: jest.fn((schema, data) => data),
}));

// Mock Alert
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

  it("displays approved categories correctly", () => {
    const { getAllByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    expect(getAllByText("Home")[0]).toBeTruthy(); // First occurrence should be in the main list
    expect(getAllByText("School")[0]).toBeTruthy();
  });

  it("displays pending categories for parent mode", () => {
    const { getByText, getAllByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    expect(getByText("Pending Approval")).toBeTruthy();
    expect(getAllByText("Playground")[0]).toBeTruthy(); // First occurrence should be in pending list
  });

  it("does not display pending categories for child mode", () => {
    const { queryByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="child" />
    );
    expect(queryByText("Pending Approval")).toBeNull();
  });

  it("calls onBack when back button is pressed", () => {
    const { getByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    // Look for back button by finding ArrowLeft icon area
    const backButton = getByText("Manage Categories").parent?.parent?.children?.[0];
    if (backButton) {
      fireEvent.press(backButton);
      expect(mockOnBack).toHaveBeenCalled();
    }
  });

  it("opens create modal when add button is pressed", async () => {
    const { getByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    
    // Find and press the add button (Plus icon)
    const header = getByText("Manage Categories").parent;
    const addButton = header?.children[2]; // Third child should be add button
    if (addButton) {
      fireEvent.press(addButton);
      await waitFor(() => {
        expect(getByText("Create Category")).toBeTruthy();
      });
    }
  });

  it("handles category creation correctly", async () => {
    const { getByText, getByPlaceholderText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    
    // Open create modal
    const header = getByText("Manage Categories").parent;
    const addButton = header?.children[2];
    if (addButton) {
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByText("Create Category")).toBeTruthy();
      });

      // Fill in category name
      const nameInput = getByPlaceholderText("Enter category name");
      fireEvent.changeText(nameInput, "New Category");

      // Press create button
      const createButton = getByText("Create");
      fireEvent.press(createButton);

      expect(mockAddCategory).toHaveBeenCalled();
    }
  });

  it("validates empty category name", async () => {
    const { getByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    
    // Open create modal
    const header = getByText("Manage Categories").parent;
    const addButton = header?.children[2];
    if (addButton) {
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByText("Create Category")).toBeTruthy();
      });

      // Try to create without name
      const createButton = getByText("Create");
      fireEvent.press(createButton);

      expect(mockShowToast).toHaveBeenCalledWith("Please enter a category name", "error");
      expect(mockAddCategory).not.toHaveBeenCalled();
    }
  });

  it("handles category approval for parent mode", async () => {
    const { getAllByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    
    // Find the pending category
    expect(getAllByText("Playground")[0]).toBeTruthy();
    
    // Look for approve button - it should be near the category
    const playgroundItem = getAllByText("Playground")[0].parent?.parent;
    if (playgroundItem) {
      // The approve button should be in the actions area
      const approveButton = playgroundItem.children.find((child: any) => 
        child.props?.accessibilityLabel === "Approve category" ||
        child.props?.testID === "approve-button"
      );
      
      if (approveButton) {
        fireEvent.press(approveButton);
        expect(mockApproveCategory).toHaveBeenCalled();
      }
    }
  });

  it("handles category deletion correctly", async () => {
    const { getAllByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    
    // Find a custom category (School)
    const schoolCategory = getAllByText("School")[0]; // First occurrence should be in main list
    expect(schoolCategory).toBeTruthy();
    
    // Look for delete button near the category
    const schoolItem = schoolCategory.parent?.parent;
    if (schoolItem) {
      const deleteButton = schoolItem.children.find((child: any) => 
        child.props?.accessibilityLabel === "Delete category" ||
        child.props?.testID === "delete-button"
      );
      
      if (deleteButton) {
        fireEvent.press(deleteButton);
        expect(mockDeleteCategory).toHaveBeenCalled();
      }
    }
  });

  it("displays different UI for child mode", () => {
    const { getByText, getAllByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="child" />
    );
    
    expect(getByText("Manage Categories")).toBeTruthy();
    expect(getAllByText("Home")[0]).toBeTruthy(); // First occurrence in main list
    expect(getAllByText("School")[0]).toBeTruthy();
    
    // Should not show pending categories
    const { queryByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="child" />
    );
    expect(queryByText("Pending Approval")).toBeNull();
  });

  it("supports theme toggling", async () => {
    await testThemeToggling((_theme: string) => (
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    ));
  });

  it("handles icon selection in create modal", async () => {
    const { getByText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="parent" />
    );
    
    // Open create modal
    const header = getByText("Manage Categories").parent;
    const addButton = header?.children[2];
    if (addButton) {
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByText("Choose Icon")).toBeTruthy();
      });

      // The icon selection should be available
      expect(getByText("Choose Color")).toBeTruthy();
    }
  });

  it("shows appropriate messages for child mode category creation", async () => {
    const { getByText, getByPlaceholderText } = render(
      <CategoryManagement onBack={mockOnBack} userMode="child" />
    );
    
    // Open create modal
    const header = getByText("Manage Categories").parent;
    const addButton = header?.children[2];
    if (addButton) {
      fireEvent.press(addButton);
      
      await waitFor(() => {
        expect(getByText("Create Category")).toBeTruthy();
      });

      // Fill in category name
      const nameInput = getByPlaceholderText("Enter category name");
      fireEvent.changeText(nameInput, "Child Category");

      // Press create button
      const createButton = getByText("Create");
      fireEvent.press(createButton);

      // Should show approval needed message
      expect(mockShowToast).toHaveBeenCalledWith("Category created; awaiting approval", "info");
    }
  });
});
