module.exports = {
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
};
