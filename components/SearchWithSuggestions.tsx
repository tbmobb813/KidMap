import { MapPin, Clock, Star } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";

import SearchBar from "./SearchBar";

import Colors from "@/constants/colors"; // legacy
import { useTheme } from '@/constants/theme';
import { useDebounce } from "@/hooks/useDebounce";
import { Place } from "@/types/navigation";

type SearchSuggestion = {
  id: string;
  text: string;
  type: "recent" | "popular" | "place";
  place?: Place;
};

type SearchWithSuggestionsProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
};

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder,
  suggestions = [],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const theme = useTheme();
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    setShowSuggestions(debouncedValue.length > 0 && suggestions.length > 0);
  }, [debouncedValue, suggestions]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
  case "recent": return <Clock size={16} color={theme.colors.textSecondary} />;
      case "popular": return <Star size={16} color={Colors.warning} />;
      case "place": return <MapPin size={16} color={Colors.primary} />;
  default: return <MapPin size={16} color={theme.colors.textSecondary} />;
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => {
        onSelectSuggestion(item);
        setShowSuggestions(false);
      }}
    >
      {getSuggestionIcon(item.type)}
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item.text}
      </Text>
    </Pressable>
  );

  return (
  <View style={styles.container}>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onClear={() => {
          onChangeText("");
          setShowSuggestions(false);
        }}
        placeholder={placeholder}
      />
      
      {showSuggestions && (
        <View style={[styles.suggestionsContainer,{ backgroundColor: theme.colors.surface }] }>
          <FlatList
            data={suggestions.slice(0, 5)} // Limit to 5 suggestions
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  suggestionItem: {
    alignItems: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  suggestionText: {
    color: Colors.text,
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    borderRadius: 12,
    elevation: 5,
    left: 0,
    position: "absolute",
    right: 0,
    shadowColor: "/*TODO theme*/ theme.colors.placeholder /*#000*/",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 60,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
});

export default SearchWithSuggestions;
