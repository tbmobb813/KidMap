import { Search, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, View, Pressable } from "react-native";

import Colors from "@/constants/colors"; // legacy colors
import { useTheme } from '@/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Where do you want to go?",
}) => {
  const theme = useTheme();
  return (
    <View style={[styles.container,{ backgroundColor: theme.colors.surface }] }>
      <Search size={20} color={theme.colors.textSecondary} style={styles.icon} />
      <TextInput
        style={[styles.input,{ color: theme.colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <X size={18} color={theme.colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    padding: 4,
  },
  container: {
    alignItems: "center",
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    height: 56,
    paddingHorizontal: 16,
    shadowColor: "/*TODO theme*/ theme.colors.placeholder /*#000*/",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    color: Colors.text,
    flex: 1,
    fontSize: 16,
  },
});

export default SearchBar;
