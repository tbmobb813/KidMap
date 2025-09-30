// Minimal mock for useTheme to resolve test failures
export default function useTheme() {
  return {
    colors: {
      primary: "#007AFF",
      background: "#FFFFFF",
      text: "#222222",
    },
  };
}
